# react异步分片计算在词云的实践
![](https://raw.githubusercontent.com/blazer233/algorithm-learn/main/wordcloud/image/fm.png#pic_center)

> 项目代码：https://github.com/blazer233/algorithm-learn/tree/main/wordcloud
> 


## 背景

在小程序开发的时候，遇到一个需要展示词云的模块


![](https://raw.githubusercontent.com/blazer233/algorithm-learn/main/wordcloud/image/sjg.png)

第一反应是去 `npm` 搜一下有没有对应的库可以用，`echarts-wordcloud` 、`wordcloud2` 都可以实现想要的效果，但是小程序毕竟容量有限，而且我们只想实现的词云功能又比较简单，为了仅仅一个模块的功能引入一整个npm包，显得有些杀鸡用牛刀，于是第一时间扒下 `wordcloud2` 源码，瞅瞅是怎么实现的，能不能搞个差不多的于是：

![](https://raw.githubusercontent.com/blazer233/algorithm-learn/main/wordcloud/image/wc2.png#pic_center)

这四层while循环，看的我是一脸懵逼...  既然我们实现的并非复杂的词云，为什么不能自己搞一个呢

于是网上找了找资料，自己一点点探索实现了一个简单的词云功能，并且在功能实现的基础上又对其进行了优化。

## 布局

对于词云而言，最重要的就是布局，而我们想要的布局是：

- 以中心为起始点，逐渐以环形向外围扩展，文字由大到小从中间到外围权重逐渐递减，形成一个椭圆形的效果。

这么讲可能一脸懵，但是换个方式表述，也就是将文字按照 `权重/大小` 的方式按照顺序排序，那么这种顺序是什么呢

![](https://raw.githubusercontent.com/blazer233/algorithm-learn/main/wordcloud/image/iknow.png)
![](https://raw.githubusercontent.com/blazer233/algorithm-learn/main/wordcloud/image/wenxiang.png#pic_right)

**蚊香！**

高端的算法，灵感往往来源朴素的生活，蚊香完美符合我们需要的布局，而且提到蚊香，我们就可以通过阿基米德螺线进行绘制，这样只需要将排序好的文字一个个放到对应的位置，便可呈现出词云的效果

首先利用 `阿基米德螺线方程` 算出每个点的坐标位置，然后在整个 `canvas` 画布上调整步长和螺距绘制出坐标点，且如果超出画布大小时 `break` 。最终将每个坐标点进行返回，之后在每个坐标处绘制文字，让文字呈螺线的方向依次排布

```js
/** 阿基米德螺线, 用于初始化位置函数, 调用后返回一个获取位置的函数
 * @param {*} size 画布大小, [width, height]
 * @param {*} { step = 0.1, b = 1, a = 0 }  步长(弧度), 螺距, 起始点距中心的距离
 * @returns
 */
export const archimedeanSpiral = (size, tmp = { step = 0.1, b = 1, a = 0 }) => {
  const e = size[0] / size[1]; // 根据画布长宽比例进行对应缩放
  // 参数t为当前弧度值
  return function (t) {
    return [e * (a + b * (t *= step)) * Math.cos(t), (a + b * t) * Math.sin(t)];
  };
};

```

![](https://raw.githubusercontent.com/blazer233/algorithm-learn/main/wordcloud/image/ring.png#pic_center)

利用方程计算每个词汇的坐标并依次在canvas渲染出来

```js
/**
 * 计算所有螺线点
 * @param {*} size 画布大小
 */
export const getAllPoints = (size) => {
  const getPosition = archimedeanSpiral(size);
  const points = [];
  let maxDelta = Math.sqrt(size[0] * size[0] + size[1] * size[1]), // 最大半径（勾股定理）
    t = 1, // 阿基米德弧度
    dxdy,
    dx, // x坐标
    dy, // y坐标
    x,
    y;
  // 通过每次增加的步长固定为1，实际步长为 step * 1，来获取下一个放置点
  do {
    dxdy = getPosition(t);
    dx = dxdy[0];
    dy = dxdy[1];
    x = dx + size[0] / 2;
    y = dy + size[1] / 2;
    t++;
    if (Math.min(Math.abs(dx), Math.abs(dy)) >= maxDelta) break; // (dx, dy)距离中心超过maxDelta，跳出螺旋返回false
    points.push({ dx, dy, x, y });
  } while (true);
  return points;
};
```

![](https://raw.githubusercontent.com/blazer233/algorithm-learn/main/wordcloud/image/txt-ring.png#pic_center)



## 碰撞

布局似乎是成功了，但是当我们放入文字之后，另一个问题就出现了，由于没有考虑文字碰撞的问题，越是中心的文字越会叠在一起

![](https://raw.githubusercontent.com/blazer233/algorithm-learn/main/wordcloud/image/pengzhaung-has.png#pic_center)

碰撞，顾名思义，就是两个物体碰撞在了一起，眼睛是可以直观的观察到碰撞的发生。但对于前端实现，如何让 JavaScript 代码理解两个独立的“物体”（DOM）碰撞在一起呢。这就涉及到碰撞检测（或者叫边界检测）的问题了，好在此处我们默认将每个词汇都看作是一个个长方体，只需要简单的计算就可以解决

对于两个文字是否碰撞，有如下的判断条件：

![](https://raw.githubusercontent.com/blazer233/algorithm-learn/main/wordcloud/image/penzhuang.png#pic_center)


所以应该在每个词汇进行绘制的时候进行如下检测：

```js
/**
 *
 * @param {*} obj 绘制的词汇1
 * @param {*} obj2 绘制的词汇2
 */
const hitTest = (obj = {}, obj2 = {}) => {
  var objW = obj.w; // 宽度
  var objH = obj.h; // 高度
  var objL = obj.x; //x 坐标
  var objT = obj.y; //y 坐标

  var obj2W = obj2.w;
  var obj2H = obj2.h;
  var obj2L = obj2.x;
  var obj2T = obj2.y;
  // true 没碰上
  // false 碰上了
  return (
    objL + objW < obj2L ||
    objT + objH < obj2T ||
    objL > obj2L + obj2W ||
    objT > obj2T + obj2H
  );
};
```

并且除了文字碰撞之外，还有边缘碰壁的情况也要考虑在内

```js
/**
 *
 * @param {*} point 绘制的文字坐标信息
 * @param {*} size 画布尺寸
 */
export const outLineTest = (point, size) => {
  return (
    Number(point.x) + Number(point.w) > size[0] ||
    Number(point.y) + Number(point.h) > size[1]
  );
};
```

每当绘制一个词汇时，都需要将待绘制词汇与之前排布完成的词汇依次进行碰撞检测，为什么要依次检测呢，只检测上一次绘制的词汇不行吗？这是不行的，因为词汇的字数是不可控的，有可能词汇超长，与上一个文字没有重叠但是与其他文字有重叠。


如果在如上的检测中存在碰撞，则继续用螺线上已绘制坐标的下一个待绘制的坐标点继续检测，如果该坐标放置文字时，依然会与排布好的文字发生碰撞的话，就继续寻找下一个坐标，直到检测通过，确定好当前的坐标，将待绘制的词汇渲染到该坐标位置。

如图，顺着螺线的路径进行排布，依次放置每一个词汇

![](https://raw.githubusercontent.com/blazer233/algorithm-learn/main/wordcloud/image/cs.png#pic_center)

相当于一种简单的 **指针算法**

```js
/**
 *
 * @param {*} ctx canvas 对象
 * @param {*} hasDrawText 已经布局好的词汇
 * @param {*} points 螺线的所有坐标信息
 * @param {*} baseData 所有词汇的绘制坐标信息
 * @param {*} i 索引
 * @param {*} isArea 是否绘制边框
 */
export default function handleItem(ctx, hasDrawText, points, baseData, i, isArea) {
  let point = baseData[i];
  ctx.fillStyle = point.color;
  ctx.font = point.fontSize + "px Arial";
  point.w = ctx.measureText(point.text).width;
  ctx.beginPath();
  if (hasDrawText.length) {
    let s = i;
    while (
      !hasDrawText.every( // 碰撞检测 边缘检测
        one => hitTest(point, one) && !outLineTest(point, size)
      )
    ) {
      point = { ...point, ...points[s] };
      s++; // 索引自增寻找可以通过检测的坐标
    }
  } else {
    point.x = point.x - point.w / 2;
    point.y = point.y - point.h / 2;
  }
  hasDrawText.push(point);
  // /*渲染文字*/
  ctx.fillText(point.text, point.x, point.y + point.h);
}
```

在解决了布局和碰撞两个大问题之后，我们的需求已经做的差不多了，虽然是小程序的需求，这里我们可以用pc模拟演示一下

![](https://raw.githubusercontent.com/blazer233/algorithm-learn/main/wordcloud/image/ciyun-over.png#pic_center)


## schedule

代码的结果如上，但是有个问题，在渲染整个词云的时候，我们需要将每个坐标依次找到、渲染，尤其是在找的时候，我们需要对每次准备绘制的词汇与之前所有的词汇进行碰撞检测，这一点很耗时，当我们的词汇足够多的时候，这个查找时间也会成倍增长，如下是渲染100个词汇的火焰图，调用栈一直被 `handleItem` 占据，页面会出现白屏、卡顿的情况

![](https://raw.githubusercontent.com/blazer233/algorithm-learn/main/wordcloud/image/bef.png#pic_center)

这时候就需要引入异步分片来解决

说到异步分片就不得不提 `react schedule` ，react 就是模拟出浏览器 `requestIdleCallback` 将任务切割成无数小任务，抢空闲时期的空闲时间分片执行

![](https://raw.githubusercontent.com/blazer233/algorithm-learn/main/wordcloud/image/fiber.gif)

`react` 团队没有直接利用 `requestIdleCallback` 是因为这个 `requestIdleCallback` 在各个版本的浏览器兼容性较差，其次，`requestIdleCallback` 并不是每一帧都会执行，它只会在浏览器空闲时间的时候进行执行，而这个 `空闲时间` 是不稳定的，如果浏览器一直处于繁忙状态，导致接受的回调一直无法执行，我们虽然可以利用 `requestIdleCallback` 的第二个参数 `timeout` ,但是如果是因为timeout回调才得以执行的话，其实用户就有可能会感觉到明显卡顿了


![](https://raw.githubusercontent.com/blazer233/algorithm-learn/main/wordcloud/image/raf.png#pic_center)

说到`requestIdleCallback`，此处就不得不谈谈 `requestIdleCallback` 和 `requestFrameAnimation` 的区别。

在使用 `requestFrameAnimation` 的时候利用 `requestFrameAnimation` 的触发时机（下次重绘之前调用），通常是做动画处理，每一帧对一个样式修改，属于高优先级任务，而 `requestIdleCallback` 是用来处理低优先级，一般会把任务push到一个 `taskQueue` 浏览器有空闲时间的时候，才会调用，所以 `requestIdleCallback` 调用的次数不多，但一次 `requestIdleCallback` 会完成很多任务

在 web 通信有两种方式，一种是跨文档通信，也就是我们熟知的 `window.postMessage` ，常被用于与 `iframe` 之间的通信，一种是通道通信也就是 `MessageChannel`。

在早期，`react` 团队采用的是 `requestAnimationFrame` 和`postMessage` 来模拟实现的 `requestidlecallback` ，但是为了提高性能和电池寿命，因此在大多数浏览器里，当 `requestAnimationFrame` 运行在后台标签页或者隐藏的 `<iframe>` 里时，`requestAnimationFrame` 会被暂停调用以提升性能和电池寿命。并且它的调用时机是在渲染之前，但这个时机不稳定，所以这个api也是不稳定的。

---

在 `v16.2.0` 之后，`react` 团队采用的是 `MessageChannel` 的方式进行调用，`React` 把更新操作做成了一个个任务，塞进了 `taskQueue`，也就是任务列表，如果直接遍历执行这个任务列表，纯同步操作，执行期间，浏览器无法响应动画或者用户的输入，于是借助  `MessageChannel` ，依然是遍历执行任务，但当每个任务执行完，就会判断过了多久，如果没有过默认的切片时间（5ms），那就再执行一个任务，如果过了，那就调用 `postMessage`，让出线程，等浏览器处理完动画或者用户输入，就会执行 `onmessage` 推入的任务，接着遍历执行任务列表。

[react scheduler 源码](https://github.com/facebook/react/blob/v18.2.0/packages/scheduler/src/forks/Scheduler.js)


## 改进

说了这么多，那么怎么用react更新的特性改进我们的代码呢

我们可设计一个利用 `MessageChannel` 调度任务的函数，可以将每次循环检测碰撞绘制词汇的执行函数即 `handleItem` 打断，并且将返回的结果通过 `Promise` 进行包装，而且如果渲染的时间过长，还可以中止渲染

并且在对词云处理时，还可以通过` 调度函数` 返回的 `abort` 方法将渲染终止，使词云的绘制更加灵活

```js
/**
 * 调度函数
 * @param {*} handle 进行检测碰撞并绘制的函数
 */
export default handle => {
  const exec = [];
  return {
    add(task) {
      exec.push(task); // 接收task
    },
    run() {
      const RUNTIME = 16;
      const { port1, port2 } = new MessageChannel();
      let isAbort = false;
      const promise = new Promise((resolve, reject) => {
        const runner = () => {
          const prevTime = performance.now();
          do {
            if (isAbort) { // 打断调度任务并返回
              return reject(exec);
            }
            if (!exec.length) { // 任务处理完成
              return resolve(exec);
            }
            const task = exec.shift();
            handle(...task);
          } while (performance.now() - prevTime < RUNTIME);
          port2.postMessage(""); // 放到下一次调度执行
        };
        port1.onmessage = function () {
          runner(); // 执行调度任务
        };
        port2.postMessage(""); // 触发任务调度
      });
      promise.abort = () => {
        isAbort = true;
      };
      return promise;
    },
  };
};
```

此时再看我们的火焰图，每次执行的 `handleItem` 被打断在 `MessageChannel` 中，一旦超过既定时间就会让出主线程，在下一个 `MessageChannel` 继续执行，就很完美

![](https://raw.githubusercontent.com/blazer233/algorithm-learn/main/wordcloud/image/youhua.png#pic_center)

## 总结

`React schedule` 出来很久了，也有很多文章介绍，但在业务中真正能用到的地方很少。实现一个异步调度器很容易，也没什么技术难点，但如果能助力到业务需求上，它的好处则不言而喻，即优化了用户体验，又夯实了自身技术一举两得。

参考文章

- 👋：[React 之 requestIdleCallback 来了解一下](https://juejin.cn/post/7166547963517337614)
- 👋：[异步分片计算在腾讯文档的实践](https://zhuanlan.zhihu.com/p/570318956)
- 👋：[如何实现一个词云](https://mp.weixin.qq.com/s/bOrqR7zvZLreBUS1mrNGVg)





