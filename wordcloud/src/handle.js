import { hitTest, outLineTest, CANVAS_SIZE as size } from "./tool_config";

/**
 *
 * @param {*} ctx canvas 对象
 * @param {*} points 螺线的所有坐标
 * @param {*} baseData 所有词汇的绘制坐标
 * @param {*} i 索引
 * @param {*} isArea 是否绘制边框
 */
export default function handleItem(
  ctx,
  hasDrawText,
  points,
  baseData,
  i,
  isArea
) {
  let point = baseData[i];
  ctx.fillStyle = point.color;
  ctx.font = point.fontSize + "px Arial";
  point._width = ctx.measureText(point.text).width;
  ctx.beginPath();
  if (hasDrawText.length) {
    let s = i;
    while (
      !hasDrawText.every(
        one => hitTest(point, one) && !outLineTest(point, size)
      )
    ) {
      point = { ...point, ...points[s] };
      s++;
    }
  } else {
    point.x = point.x - point._width / 2;
    point.y = point.y - point._height / 2;
  }
  hasDrawText.push(point);
  // /*画文字*/
  ctx.fillText(point.text, point.x, point.y + point._height);
  // /*画框*/
  isArea && ctx.strokeRect(point.x, point.y + 6, point._width, point._height);
}
