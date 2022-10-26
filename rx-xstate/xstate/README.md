# 实现一个rxjs🎅

![image.webp](https://raw.githubusercontent.com/blazer233/algorithm-learn/main/npm-learn/fsm/stately/image.webp)

> 项目代码：https://github.com/blazer233/algorithm-learn/tree/main/npm-learn/fsm/stately
>
>
> 参考轮子：https://github.com/fschaefer/Stately.js


我们平时开发时本质上就时对应用程序的各种状态进行切换并作出相应处理，最直接的方法就是添加标志位然后考虑所有可能出现的边界问题，通过if...else if...else 来对当前状态进行判断从而达成页面的交互效果，
但随着业务需求的增加各种状态也会随之增多，我们就不得不再次修改if...else代码或者增加对应的判断，最终使得程序的可读性、扩展性、维护性变得很麻烦

> 有限状态机，（英语：Finite-state machine, FSM），又称有限状态自动机，简称状态机，是表示有限个状态以及在这些状态之间的转移和动作等行为的数学模型。

利用`有限状态机`我们可以将条件判断的结果转化为状态对象内部的状态，并且能够使用对应的方法，进行对应的改变。这样方便了对状态的管理也会很容易，也是更好的实践了`UI=fn(state)`思想。


#### 举个栗子🌰

我们这里用一个简易的`红绿灯`案例，实现一个简易的`有限状态机`，并且可以通过每一个状态暴露出来的方法，改变当前的状态

```js
const door = machine({
  RED: {
    yello: "YELLO",
  },
  GREEN: {
    red: "RED",
  },
  YELLO: {
    green: "GREEN",
  },
});
```
1. 首先初始时`door`的状态显示为红灯即`RED`
2. 当我们进行`yello`操作的时候，状态变成黄灯，即状态改变为`YELLO`
3. 当我们进行`green`操作的时候，状态变成绿灯，即状态改变为`GREEN`
4. 当我们连着进行`red`操作、`yello`操作的时候，最终状态变成黄灯，即状态改变为`YELLO`
...


## 从零开始

通过接受一个对象(如果是函数就执行)，拿到初始值，并且在函数内部维护一个变量记录当前的状态，并且记录第一个状态为初始状态

```js
const machine = statesObject => {
  if (typeof statesObject == "function") statesObject = statesObject();
  let currentState;
  for (const stateName in statesObject) {
    currentState = currentState || statesObject[stateName];
  }
};
```

#### 获取状态

因为当前状态是通过函数局部变量`currentState`进行保存，我们需要一些方法

- `getMachineState`：获取当前的状态
- `getMachineEvents`：获取当前状态上保存了哪些方法

这两个函数通过`stateMachine`进行保存并作为函数结果进行返回

```js
const machine = statesObject => {
  let currentState
  ...
  const getMachineState = () => currentState.name;
  const getMachineEvents = () => {
    const events = [];
    for (const property in currentState) {
      if (typeof currentState[property] == "function") events.push(property);
    }
    return events;
  };
  const stateMachine = { getMachineState, getMachineEvents };
  ...
  return stateMachine
};

```
#### 状态改变

我们进行改变的时候，调用的是一开始配置好的方法对状态进行更改，此时需要将每一个状态合并到`stateStore`中进行保存

再将对应的方法作为`偏函数`（函数预先将转换的状态和方法进行传递），保存在`stateMachine`（`stateMachine`会作为结果进行返回），这样就可以

- 使用`.yello()`、`.red()`、`.green()`的方法，改变状态

- 使用`.getMachineState()`、`.getMachineEvents()`查看当前状态和查看当前状态对应的方法


```js
const machine = statesObject => {
  if (typeof statesObject == "function") statesObject = statesObject();
  let currentState;

  const stateStore = {};
  const getMachineState = () => currentState.name;
  const getMachineEvents = () => {
    const events = [];
    for (const property in currentState) {
      if (typeof currentState[property] == "function") events.push(property);
    }
    return events;
  };
  const stateMachine = { getMachineState, getMachineEvents };

  for (const stateName in statesObject) {
    stateStore[stateName] = statesObject[stateName];
    for (const event in stateStore[stateName]) {
      stateMachine[event] = transition.bind(null, stateName, event);
    }
    stateStore[stateName].name = stateName;
    currentState = currentState || stateStore[stateName];
  }
  return stateMachine;
};
```

#### transition
上面代码中最重要的莫过于`transition`函数，即改变当前状态，在`stateStore`中获取当前的要更改的状态名，重新给`currentState`赋值，并返回`stateMachine`供函数继续`链式调用`

```js
const machine = statesObject => {
  ...
  const transition = (stateName, eventName) => {
    currentState = stateStore[stateName][eventName];
    return stateMachine;
  };
  for (const stateName in statesObject) {
    stateStore[stateName] = statesObject[stateName];
    for (const event in stateStore[stateName]) {
      stateMachine[event] = transition.bind(null, stateName, event);
    }
    stateStore[stateName].name = stateName;
    currentState = currentState || stateStore[stateName];
  }
  return stateMachine;
};
```

看似没有问题，但是如果我们按照上面的代码执行后，获得的状态值为`undefined`，因为我们在`getMachineState`时，获取到的是`currentState.name`，而不是`currentState`，所以此时在获取状态的时候需要用通过函数进行获取`obj => obj[xxx]`

```js
const machine = statesObject => {
  ...
  const transition = (stateName, eventName) => {
    currentState = stateStore[stateName][eventName](stateStore);
    return stateMachine;
  };
  for (const stateName in statesObject) {
    stateStore[stateName] = statesObject[stateName];
    for (const event in stateStore[stateName]) {
      const item = stateStore[stateName][event];
      if (typeof item == "string") {
        stateStore[stateName][event] = obj => obj[item];
        stateMachine[event] = transition.bind(null, stateName, event);
      }
    }
    stateStore[stateName].name = stateName;
    currentState = currentState || stateStore[stateName];
  }
  return stateMachine;
};
```

#### 实现`fsm`状态机
现在我们实现了一个完整的`fsm`，当我们配置好状态机时

```js
const door = machine({
  RED: {
    yello: "YELLO",
  },
  GREEN: {
    red: "RED",
  },
  YELLO: {
    green: "GREEN",
  },
});
```

执行如下操作时，会打印我们想要的结果

- `door.getMachineState()` --> RED
- `door.yello().getMachineState()` --> YELLO
- `door.green().getMachineState()` --> GREEN
- `door.red().yello().getMachineState()` --> YELLO

#### 实现钩子函数
但是我们监听不到状态机的改变，所以当我们想监听状态变换时，应该从内部暴露出钩子函数，这样可以监听到状态机内部的变化，又能进行一些副作用操作

对此，可以对`transition`进行一些改造，将对于`currentState`状态的改变用方法`setMachineState`去处理

`setMachineState`函数会拦截当前状态上绑定`onChange`方法进行触发，并将`改变状态的函数`、`改变前的状态`、`改变后的状态`传递出去

```js
const machine = statesObject => {
  ...
  const setMachineState = (nextState, eventName) => {
    let onChangeState;
    let lastState = currentState;
    const resolveSpecialEventFn = (stateName, fnName) => {
      for (let property in stateStore[stateName]) {
        if (property.toLowerCase() === fnName.toLowerCase()) {
          return stateStore[stateName][property];
        }
      }
    };
    currentState = nextState;
    onChangeState = resolveSpecialEventFn(lastState.name, "onChange");
    if (
      onChangeState &&
      typeof onChangeState == "function" &&
      lastState.name != currentState.name
    ) {
      onChangeState.call(
        stateStore,
        eventName,
        lastState.name,
        currentState.name
      );
    }
  };

  const transition = (stateName, eventName) => {
    const curState = stateStore[stateName][eventName](stateStore);
    setMachineState(curState, eventName);
    return stateMachine;
  };

  ...
  return stateMachine;
};
```

这样我们在调用时，状态的每一次改变都可以监听到，并且可以执行对应的副作用函数

```js
const door = machine({
  RED: {
    yello: "YELLO",
    onChange(fn, from, to) {
      console.log(fn, from, to, "onChange");
    },
  },
  GREEN: {
    red: "RED",
    onChange(fn, from, to) {
      console.log(fn, from, to, "onChange");
    },
  },
  YELLO: {
    green: "GREEN",
    onChange(fn, from, to) {
      console.log(fn, from, to, "onChange");
    },
  },
});
```


## 完整代码
```js
export default statesObject => {
  if (typeof statesObject == "function") statesObject = statesObject();
  let currentState;
  const stateStore = {};
  const getMachineState = () => currentState.name;
  const getMachineEvents = () => {
    let events = [];
    for (const property in currentState) {
      if (typeof currentState[property] == "function") events.push(property);
    }
    return events;
  };
  const stateMachine = { getMachineState, getMachineEvents };
  const setMachineState = (nextState, eventName) => {
    let onChangeState;
    let lastState = currentState;
    const resolveSpecialEventFn = (stateName, fnName) => {
      for (let property in stateStore[stateName]) {
        if (property.toLowerCase() === fnName.toLowerCase()) {
          return stateStore[stateName][property];
        }
      }
    };
    currentState = nextState;
    onChangeState = resolveSpecialEventFn(lastState.name, "onChange");
    if (
      onChangeState &&
      typeof onChangeState == "function" &&
      lastState.name != currentState.name
    ) {
      onChangeState.call(
        stateStore,
        eventName,
        lastState.name,
        currentState.name
      );
    }
  };
  const transition = (stateName, eventName) => {
    const curState = stateStore[stateName][eventName](stateStore);
    setMachineState(curState, eventName);
    return stateMachine;
  };
  for (const stateName in statesObject) {
    stateStore[stateName] = statesObject[stateName];
    for (const event in stateStore[stateName]) {
      const item = stateStore[stateName][event];
      if (typeof item == "string") {
        stateStore[stateName][event] = obj => obj[item];
        stateMachine[event] = transition.bind(null, stateName, event);
      }
    }
    stateStore[stateName].name = stateName;
    currentState = currentState || stateStore[stateName];
  }
  return stateMachine;
};
```

## 总结

这个 `fsm有限状态机` 主要完成了：

1. 状态的可观测
2. 状态的链式调用
3. 状态变化的钩子函数

以上就是 npm 包 [stately](https://github.com/fschaefer/Stately.js) 的源码学习。
