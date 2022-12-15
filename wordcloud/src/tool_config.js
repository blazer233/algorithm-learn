export const CONFIG = {
  large: { step: 0.1, b: 1 },
  showIndex: false,
  showSpiral: false,
  isArea: false,
};

export const handleAsyncTask = cb => {
  if (typeof MessageChannel !== "undefined") {
    const { port1, port2 } = new MessageChannel();
    port1.onmessage = cb;
    return port2.postMessage(null);
  }
  if (typeof requestAnimationFrame !== "undefined") {
    return requestAnimationFrame(cb);
  }
  return setTimeout(cb, 200);
};

/** 阿基米德螺线, 用于初始化位置函数, 调用后返回一个获取位置的函数
 * @param {*} size 画布大小, [width, height]
 * @param {*} { step = 0.1, b = 1, a = 0 }  步长(弧度), 螺距, 起始点距中心的距离
 * @returns
 */
export const archimedeanSpiral = (size, { step = 0.1, b = 1, a = 0 }) => {
  const e = size[0] / size[1]; // 根据画布长宽比例进行对应缩放
  // 参数t为当前弧度值
  return function (t) {
    return [e * (a + b * (t *= step)) * Math.cos(t), (a + b * t) * Math.sin(t)];
  };
};

/**
 * 计算所有螺线点
 */
export const getAllPoints = (size, tmp) => {
  const getPosition = archimedeanSpiral(size, tmp);
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

/**
 * 画辅助线
 */
export const drawSpiral = (ctx, points, size) => {
  let last = [0, 0];
  points.forEach(point => {
    ctx.beginPath();
    ctx.moveTo(last[0] + size[0] / 2, last[1] + size[1] / 2);
    ctx.lineTo(point.dx + size[0] / 2, point.dy + size[1] / 2);
    last = [point.dx, point.dy];
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(
      point.dx + size[0] / 2,
      point.dy + size[1] / 2,
      2,
      0,
      2 * Math.PI,
      false
    );
  });
};

/**
 * 碰撞测试
 */
export const hitTest = (obj = {}, obj2) => {
  var objW = obj._width;
  var objH = obj._height;
  var objL = obj.x; //x
  var objT = obj.y; //y

  var obj2W = obj2._width;
  var obj2H = obj2._height;
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

/**
 * 是否超出边界
 */
export const outLineTest = (point, size) => {
  return (
    Number(point.x) + Number(point._width) > size[0] ||
    Number(point.y) + Number(point._height) > size[1]
  );
};

/**
 * 画布大小
 */
export const CANVAS_SIZE = [1500, 1500];
const size = [
  { fontSize: 32, color: "burlywood" },
  { fontSize: 36, color: "gray" },
  { fontSize: 55, color: "peru" },
  { fontSize: 60, color: "cadetblue" },
];
const foods = [
  "螺蛳粉",
  "鸭血粉丝",
  "甜不辣",
  "重庆小面",
  "肉夹馍",
  "炸酱面",
  "沙县小吃",
  "烤冷面",
  "臭豆腐",
  "钵钵鸡",
  "酸辣粉",
  "冒菜",
  "驴打滚",
  "板栗",
  "醪糟",
];

function getData(res = []) {
  size.forEach(i => {
    foods.forEach(text => {
      res.push({ ...i, text });
    });
  });
  return res;
}
/**
 * 数据
 */
export const MOCK_DATA = getData();
