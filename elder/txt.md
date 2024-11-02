
事情的起因，还要从一次需求讲起，记得那是一个午后，产品的一则消息，打破了这难得的片刻安宁...

微信小店客服小程序的大部分用户是视频号购物的消费者，而中老年用户群体又占了绝大多数，标识不清、字体太小等问题往往就导致了老年用户的体验不佳，所以产品提出要通过适老化的设计，来优化老年群体的使用体验

产品有需求，开发来响应

调研了一些竞品，发现很少有在复杂页面兼容两套样式的小程序，适老化在小程序的实践大多都是对于字号的放大和加粗，并且大部分是基于微信小程序官方是推出过的一套适老化的工具：

![image.png](https://raw.githubusercontent.com/blazer233/algorithm-learn/refs/heads/main/elder/2.png)

原理是通过`<page-meta root-font-size="system"/>`将用户设置的字体大小作用到小程序的 `rem` 大小单位，转换工具会将`wxss`中的字体大小，行高，图片宽高等样式，转换为根据`rem`缩放的形式

这种方式对于用户小程序用户基础库的兼容性有一定要求，其次对很多细节样式，没有办法精确把控，只能做到简单放大，但微信小店客服小程序的老年人群体要远高于平均水平，所以对适老化的要求更为苛刻

例：老年人首页布局和普通用户的首页布局也是不同的

![image.png](https://raw.githubusercontent.com/blazer233/algorithm-learn/refs/heads/main/elder/1.png)


其实，我们项目之始就引入了团队内部自研的原子css，并且我们有一整套css原子化方案

可以借助原子css自身原子化的特性来解决不同的样式问题，这样并不需要两套完整样式方案去处理适老化样式

```html
  <view class="overflow-y-scroll relative bg-ffffff">
    <view class="flex flex-1 flex-column w-100p relative">
      <view class='flex align-items-center mt-24 mr-32 ml-32 z-index-1'>
      ...
```

那么方案就很明确：

1.  枚举出适老化和普通用户不一样的 css 变量，如字体大小、图片尺寸、等可以和设计进行约定

```js
{
  1: {
    linerClass: 'liner-c-bg', // 渐变
    backgroundColorTop: '#ff6146', // 顶色
    backgroundColor: '#ff6146', // 底色
    defClass: 'c-bg-class', //  默认背景色class
    ...
  },
  2: {
    linerClass: 'liner-b-bg',
    backgroundColorTop: '#169D8F',
    backgroundColor: '#169D8F',
    defClass: 'b-bg-class',
    ...
  }
}  
```
2.  当 页面 / 组件 加载时，加载适老化状态，wxml能获取到最新的样式进行渲染

新的问题就出现了，如何隐性的注入变量，让开发时只需要关注当前业务逻辑，而无需关注页面上的适老化状态呢？

在组件中官方给出了`behaviors`属性，可以通过它进行混入，将复用的地方抽离出来，这样耦合的逻辑可以单独处理

但是在页面上，这种方式就不一定可靠，虽然在一些社区文档看到`behaviors`属性可以在页面文件使用，但是微信小店客服小程序的用户普遍手机配置较低，小程序基础库的版本可能也会比较低，这样使用对我们而言不一定保险

这里我们分为两个阶段去实现：
1. 在进入小程序时，拿到并设置用户状态到全局缓存，这个逻辑我们可以定义一个`initUserIdentify`函数去处理

在`app.js`中`onShow`的时候使用`initUserIdentify`获取并设置适老化状态，此时通过接口获取到状态存到本地缓存
> 为什么是onShow呢，因为小程序有不同的入口，入口不同参数也就不同，参数又决定了当前的用户状态

```js
...
const app = getApp()
async onShow(options) {
    let query = null;
    try {
      // 执行函数
      query = await this.initUserIdentify(options?.query); 
    } catch (error) {
      query = DEF_QUERY;
    }
    app.globalData.mainPageData = query;
}
```
2. 设置完全局缓存之后，可以在页面中监听设置成功的状态

在`app.js`中进行如上操作，这个请求过程是异步执行的，在页面中并不知道何时执行结束，何时能够拿到全局变量，所以需要构造一个`EventEmitter`去监听这个动作，当执行完成时去`dispatch`对应的数据

```js
//app.js 实现一个 EventEmitter
class EventEmitter {
  constructor() {
    this.events = {};
  }

  // 订阅事件
  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  // 取消订阅事件
  off(event, listener) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(l => l !== listener);
  }

  // 触发事件
  dispatch(event, ...args) {
    if (!this.events[event]) return;
    this.events[event].forEach(listener => listener(...args));
  }
}
```

修改`app.js`中`onShow`方法，添加`dispatch`，此时可以在页面的`onShow`时，如果缓存中没有`mainPageData`的数据则对`__getMainPageData__`进行监听，拿到数据之后执行`this.setData()`渲染到页面

```js
// app.js
const app = getApp()
async onShow(options) {
    let query = null;
    try {
      // 执行函数
      query = await initUserIdentify(options?.query); 
    } catch (error) {
      query = DEF_QUERY;
    }
    app.globalData.mainPageData = query;
    emitter.dispatch('__getMainPageData__', query)
}

// page.js
const app = getApp();
Page({
  onShow() {
    if (app.globalData.mainPageData) {
      this.setData({ mainPageData });
    } else {
      emitter.on('__getMainPageData__', (mainPageData) => {
        // 页面设置适老化
        this.setData({ mainPageData });
      });
    }
  },
});

```

现在，我们解决适老化的问题。

但是等等，这样好像加大了开发者的心智负担，每次开发新页面的时候都需要做以上重复且冗余的逻辑，这并不合理

那么回到最初的问题，如何将这层数据隐性的`setData`到页面的`data`中呢？实现一个页面级的`behaviors`

首先，需要对页面进行重写，正常的小程序页面是通过 `Page(options)` 函数进行构造，将页面所需要的data、生命周期方法、自定义方法都作为`options`来传入

我们设想是否可以通过一个实例对象去实现这个`options`，每个页面都是继承于一个公共的类（`HookPage`），最终让一个实例对象的`options`传入`Page`方法里，这样有了公共的类就可以对页面的生命周期进行收拢，如下：
```js
// page.js
// 理想状态页面配置
import hook from '../../hook';

class IndexClass extends hook.HookPage {
  data = {
    msg: 'Hello World',
  };
  onShow() {
    console.log('IndexClass');
  }
}
hook.createPage(IndexClass);
```

`HookPage`和`createPage`是如何实现的呢？

如下，理想状态上可以在`HookPage`上挂载一些通用的生命周期函数，比如在页面上的`onShow`执行之前，我挂载到`HookPage`上的`_initShow`函数就会先触发，这样就可以在`_initShow`函数中做一些可抽离的逻辑（用户适老化状态）

```js
class HookPage {
  constructor() {
    this._initShow = function () {
      // 可以获取到页面的this
      console.log(this);
    };
  }
}

const createPage = PageClass => {
  const instance = new PageClass();
  Page(instance);
};

export default { HookPage, createPage };
```

但是事情往往不会那么的理想，我需要一个`mergePage`的映射，把`_initShow`和`onShow`这两个方法关联起来，并且最关键的是，当`_initShow`执行时，可以拿到页面onShow调用时的this，这样才可以正确的执行this.setData()

```js

class HookPage {
  ...
}

const mergePage = {
  onShow: fn => {
    return function (...arg) {
      this._initShow(...arg)
      fn.call(this, ...arg);
    };
  },
};

const createPage = PageClass => {
  const instance = new PageClass();
  for (const i in mergePage) instance[i] = mergePage[i](instance[i]);
  Page(instance);
};
```

如上，在`createPage`时循环了`mergePage`，当调用`mergePage`枚举过的方法时，相当于增强了被枚举的小程序页面的生命周期函数，当页面的`onShow`调用时，它返回一个新的函数，这个新函数在被调用时会先执行`HookPage`上`constructor`定义过的 `this._initShow(...arg)`，然后再调用原始的`onShow`函数

这样就可以实现一个页面级别的`behaviors`。

现在我们就可以让`HookPage`中定义的`this._initShow `与页面中的`onShow`进行联动，此时还需要一个`checkGlobalDataExist`，来检查`app.js`中的`onShow`，如果缓存中有`mainPageData`，则直接返回，没有的话则通过`emitter.on`进行监听，让整个链路更加丝滑：

```js
const app = getApp()
export const checkGlobalDataExist = () => {
// 检查当前缓存中是否存在 mainPageData
  return new Promise(res => {
    const mainPageData = app.globalData.mainPageData;
    if (mainPageData) {
      res(mainPageData);
    } else {
      emitter.on('__getMainPageData__', res);
    }
  });
};
```

此时`HookPage`中的`this._initShow`方法就可以这样写:

```js
class HookPage {
  constructor() {
    this._initShow = function () {
      checkGlobalDataExist()
        .then(mainPageData => {
          this.setData({ mainPageData }, () => this.afterRoleCreateFunc?.());
        })
        .finally(() => {
          emitter.off('__getMainPageData__');
        });
    };
  }
}
```

因为在`this._initShow`里可以拿到页面的`this`，那么就可以创造出一个`afterRoleCreateFunc`的钩子函数函数，这样在页面上就可以通过`this.afterRoleCreateFunc`来执行拿到身份之后的操作

这样通过改造页面结构，实现了一个页面的混入方法，将不同身份的样式对象隐性注入到页面data中，在wxml就可以拿到`mainPageData`的内容，而无需在页面上关注何时`setData`

对于组件的开发上，同理也是这个方案，只不过不需要我们去单独做 *Polyfill* ，组件是支持`behaviors`属性的，可以直接导出一个`Behavior`

因为有些组件的执行是快于页面的，`checkGlobalDataExist`方法就可以得到复用，这样避免了页面和组件之间传参的问题，也减轻了开发的心智负担，此时同样可以暴露出`afterRoleCreateFunc`钩子函数，相当于提供了一个组件的生命周期函数，供组件调用

```js
export const commonBehavior = Behavior({
  lifetimes: {
    attached() {
      checkGlobalDataExist()
        .then(mainPageData => {
          this.setData({ mainPageData }, () => this.afterRoleCreateFunc?.());
        })
        .finally(() => {
          wekf.off('__getMainPageData__');
        });
    },
  },
});

```

这样在 页面 / 组件 中就可以通过已注入的`mainPageData`拿到适用于不同人群的样式，在小程序通过弱侵入的方式解决了适老化样式适配的问题


```html
<view class="bg-ededed border-box min-h-100vh h-100p overflow-hidden flex flex-column">
  <view slot="main" bgcolor="{{mainPageData.backgroundColor}}" class="flex flex-column bg-ededed overflow-y-scroll" style="max-height: calc(100vh - {{navHeight}}px)">
    <view class="flex flex-1 flex-column w-100p main-page bg-ededed relative" >
      <view class="{{mainPageData.linerClass}} absolute w-100p t-0 h-360 l-0"></view>
        ...
```
以上，感谢大家阅读，这套方案在业务中已经落地，为了便于描述和理解，以上代码均为业务代码抽离后的简单逻辑代码，当然还是有些不足和改进的地方，欢迎互相交流。
