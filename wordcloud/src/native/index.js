import handleItem from "../handle";
import {
  getAllPoints,
  drawSpiral,
  CONFIG,
  CANVAS_SIZE as size,
  MOCK_DATA as mock,
} from "../tool_config";

function paintSpiral(dom, config = CONFIG) {
  mock.sort((a, b) => b.fontSize - a.fontSize);
  const ctx = dom.getContext("2d");
  [dom.width, dom.height] = size;
  const points = getAllPoints(size, config.large); // 所有放置点
  mock.forEach((item, i) => {
    item.text = config.showIndex ? `${i}${item.text}` : item.text;
    item._height = item.fontSize * 1;
    item = Object.assign(item, points[i]);
  });
  if (config.showSpiral) {
    drawSpiral(ctx, points, size);
  }
  let _i = 0;
  while (_i < mock.length) {
    handleItem(ctx, points, mock, _i, config.isArea);
    _i++;
  }
}
console.time("native");
paintSpiral(document.querySelector("#app"));
console.timeEnd("native");
