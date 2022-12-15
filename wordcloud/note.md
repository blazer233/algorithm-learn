requestIdleCallback 和 requestFrameAnimation 的用法是不一样的，我们用 requestFrameAnimation 的时候通常是做动画，每帧执行一个样式修改，但 requestIdleCallback 是用来处理低优先级的任务的，我们会把任务做成一个队列，只要还有空闲时间，我们就持续执行队列里的任务，所以 requestIdleCallback 虽然调用次数少，但在一次 requestIdleCallback 中，我们可能会完成很多任务。

如果存在屏幕刷新，浏览器会计算当前帧剩余时间，如果有空闲时期


react:
  requestAnimationFrame和postMessage来模拟实现的requestidlecallback. 工作原理是调度requestAnimationFrame，存储帧开始的时间，然后调度postMessage，后者在绘制后进行调度。

该包主要流程是把所有任务通过双向链表连接起来, 通过requestAnimationFrame来在浏览器每帧的空闲时间循环处理所有任务, 直到链表为空为止.

setTimeout 换成更好的 MessageChannel。那么为什么要使用 MessageChannel，而不是 requestAnimationFrame 呢？raf 的调用时机是在渲染之前，但这个时机不稳定，导致 raf 调用也不稳定，所以不适合。

```js
// Polyfill requestIdleCallback.
var scheduledRICCallback = null;
var frameDeadline = 0;
// 假设 30fps，一秒就是 33ms
var activeFrameTime = 33;

var frameDeadlineObject = {
  timeRemaining: function() {
    return frameDeadline - performance.now();
  }
};

var idleTick = function(event) {
    scheduledRICCallback(frameDeadlineObject);
};

window.addEventListener('message', idleTick, false);

var animationTick = function(rafTime) {
  frameDeadline = rafTime + activeFrameTime;
  window.postMessage('__reactIdleCallback$1', '*');
};

var rIC = function(callback) {
  scheduledRICCallback = callback;
  requestAnimationFrame(animationTick);
  return 0;
};
```
逻辑很简单，rIC 就是 requestIdleCallback 的简写，rIC 函数执行的时候，调用 requestAnimationFrame(animationTick)，animationTick 会被传入当前帧执行的时间(rafTime)，我们假设要保持最低的 30fps，一帧就是 33ms，我们就可以得知这帧最晚应该在 frameDeadline = rafTime + activeFrameTime前结束。
然后我们通过 postMessage 进行通信，通信的内容并不重要，重点是浏览器会被推入一个宏任务，也就是 idleTick 函数，我们通过 frameDeadline - performance.now()就可以算出这帧还剩多少时间，然后将包含这个信息的对象（frameDeadlineObject）传入 callback 函数，由此实现了 requestIdleCallback 的模拟。

现在我们终于得知了 React 时间切片的真相。
React 把 React 的更新操作做成了一个个任务，塞进了 taskQueue，也就是任务列表，如果直接遍历执行这个任务列表，纯同步操作，执行期间，浏览器无法响应动画或者用户的输入，于是借助 MessageChannel，依然是遍历执行任务，但当每个任务执行完，就会判断过了多久，如果没有过默认的切片时间（5ms），那就再执行一个任务，如果过了，那就调用 postMessage，让出线程，等浏览器处理完动画或者用户输入，就会执行 onmessage 推入的任务，接着遍历执行任务列表。


web 通信（web messaging）有两种方式，一种是跨文档通信(cross-document messaging)，也就是我们熟知的 window.postMessage()，常被用于与 iframe 之间的通信，一种是通道通信（channel messaging），也就是我们现在要介绍的。

React 在 v16.2.0 版本取消了使用 requestAnimationFrame