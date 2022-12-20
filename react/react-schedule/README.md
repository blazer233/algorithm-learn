react:
  requestAnimationFrame和postMessage来模拟实现的requestidlecallback. 工作原理是调度requestAnimationFrame，存储帧开始的时间，然后调度postMessage，后者在绘制后进行调度。

该包主要流程是把所有任务通过双向链表连接起来, 通过requestAnimationFrame来在浏览器每帧的空闲时间循环处理所有任务, 直到链表为空为止.

setTimeout 换成更好的 MessageChannel。那么为什么要使用 MessageChannel，而不是 requestAnimationFrame 呢？raf 的调用时机是在渲染之前，但这个时机不稳定，导致 raf 调用也不稳定，所以不适合。

我们声明了两个全局变量：taskQueue 和 timerQueue，它们用来表示任务队列。根据代码逻辑，如果有设置 delay 时间，那么它就会被放入 timerQueue 中，所以 timerQueue 表示要延时执行的任务，taskQueue 对应表示现在就要执行的任务。不同的文章中对这两种任务类型的描述不一样，比如有的将其描述为同步任务、异步任务。在本系列文章中，我们都用普通任务和延时任务来表达。

当创建一个调度任务的时候（unstable_scheduleCallback），会传入优先级（priorityLevel）、执行函数（callback），可选项（options），React 会根据任务优先级创建 task 对象，并根据可选项中的 delay 参数判断是将任务放到普通任务队列（taskQueue），还是延时任务队列（timerQueue）。

当放到普通任务队列后，便会执行 requestHostCallback(flushWork)，requestHostCallback 的作用是借助 Message Channel 将线程让出来，让浏览器可以处理动画或者用户输入，当浏览器空闲的时候，便会执行 flushWork 函数，flushWork 的作用是执行任务队列里的任务，它会执行 advanceTimers，不断地将 timerQueue 中到期的任务添加到 taskQueue，它会执行 taskQueue 中优先级最高的任务，当任务函数执行完毕之后，它会判断过了多久，如果时间还没有到一个切片时间（5ms），便会执行队列里的下个优先级最高的任务，一直到超出切片时间，当超出时间之后，React 会让出线程，等待浏览器下次继续执行 flushWork，也就是再次遍历执行任务队列，直到任务队列中的任务全部完成。
普通任务队列的处理流程，我们已经了解了，下篇我们讲讲延时任务的流程。


当我们创建一个延时任务后，我们将其添加到 timerQueue 中，我们使用 requestHostTimeout 来安排调度，requestHostTimeout 本质是一个 setTimeout，当时间到期后，执行 handleTimeout，将到期的任务转移到 taskQueue，然后按照普通任务的执行流程走。
