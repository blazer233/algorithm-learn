import handleItem from "../handle";
import {
  getAllPoints,
  drawSpiral,
  CONFIG,
  CANVAS_SIZE as size,
  MOCK_DATA as mock,
} from "../tool_config";
import schedule from "./index";
export default async function paintSpiral(dom, config = CONFIG) {
  mock.sort((a, b) => b.fontSize - a.fontSize);
  const ctx = dom.getContext("2d");
  const points = getAllPoints(size, config.large); // 所有放置点
  const handle = schedule(handleItem);
  [dom.width, dom.height] = size;
  mock.forEach((item, i) => {
    item.text = config.showIndex ? `${i}${item.text}` : item.text;
    item._height = item.fontSize * 1;
    item = Object.assign(item, points[i]);
  });
  let lastOne = [];
  if (config.showSpiral) {
    drawSpiral(ctx, points, size);
  }
  mock.forEach((i, idx) => {
    handle.add([ctx, lastOne, points, mock, idx, config.isArea]);
  });
  const draw = handle.run();
  // setTimeout(draw.abort, 1);
  await draw;
}
console.time("dev");
paintSpiral(document.querySelector("#app"));
console.timeEnd("dev");
