let fiber = null;

let currentlyRenderingFiber = null;
let workInProgressHook = null;

// hook = {memorizedState: null, next: null};

export function renderWithHooks(wip) {
  currentlyRenderingFiber = wip;
  currentlyRenderingFiber.memorizedState = null;
  workInProgressHook = null;
}

function updateWorkInProgressHook() {
  let hook;
  // old fiber
  const current = currentlyRenderingFiber.alternate;

  if (current) {
    // 组件更新
    currentlyRenderingFiber.memorizedState = current.memorizedState;
    if (workInProgressHook) {
      workInProgressHook = hook = workInProgressHook.next;
    } else {
      // hook0
      hook = currentlyRenderingFiber.memorizedState;
      workInProgressHook = hook;
    }
  } else {
    // 组件初次渲染
    hook = { memorizedState: null, next: null };
    if (workInProgressHook) {
      workInProgressHook.next = hook;
      workInProgressHook = workInProgressHook.next;
    } else {
      // hook0
      currentlyRenderingFiber.memorizedState = hook;
      workInProgressHook = currentlyRenderingFiber.memorizedState;
    }
  }

  return hook;
}

export function useReducer(reducer, initalState) {
  // 当前useReducer对应的hook
  const hook = updateWorkInProgressHook();

  if (!currentlyRenderingFiber.alternate) {
    hook.memorizedState = initalState;
  }

  const dispatch = () => {
    // 1. 修改状态值
    hook.memorizedState = reducer(hook.memorizedState);
    // 2. 更新组件
    currentlyRenderingFiber.alternate = { ...currentlyRenderingFiber };
    fiber = currentlyRenderingFiber;
    console.log("omg"); //sy-log
  };
  // todo 返回新的状态值和修改状态值的函数
  return [hook.memorizedState, dispatch];
}
