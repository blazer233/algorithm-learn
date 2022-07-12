# 总结

### weakMap 和 Map 区别
### setTimeout 和 setIntervel 区别
 - 嵌套的 setTimeout 能够精确地设置两次执行之间的延时，而 setInterval 却不能。
 - 使用 setInterval 时，函数的实际调用间隔要比代码中设定的时间间隔要短
### requestAnimationFrame 和 requestIdleCallback 区别
 - requestAnimationFrame会在每次屏幕刷新的时候被调用，确定执行，属于高优先级工作。
 - requestIdleCallback则会在每次屏幕刷新时，判断当前帧是否还有多余的时间，如果有，则会调用，有闲暇工夫才执行，属于低优先级工作