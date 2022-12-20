class Rect {
  constructor(x, y, w, h) {
    this.collisionType = "rect";
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }
}
/* 
  四叉树节点包含：
  - objects: 用于存储物体对象
  - nodes: 存储四个子节点
  - level: 该节点的深度，根节点的默认深度为0
  - bounds: 该节点对应的象限在屏幕上的范围，bounds是一个矩形
*/
const QuadTree = function QuadTree(bounds, level) {
  this.objects = [];
  this.nodes = [];
  this.level = typeof level === "undefined" ? 0 : level;
  this.bounds = bounds;
};
/*
  常量：
  - MAX_OBJECTS: 每个节点（象限）所能包含物体的最大数量
  - MAX_LEVELS: 四叉树的最大深度
*/
QuadTree.prototype.MAX_OBJECTS = 10;
QuadTree.prototype.MAX_LEVELS = 5;

/* 
  获取物体对应的象限序号，以屏幕中心为界限，切割屏幕:
  - 右上：象限一
  - 左上：象限二
  - 左下：象限三
  - 右下：象限四
*/
QuadTree.prototype.getIndex = function (rect = {}) {
  const { x, y } = this.bounds.centroid;
  const { x: rx, y: ry, w, h } = rect;
  const onTop = ry + h <= y;
  const onBottom = ry >= y;
  const onLeft = rx + w <= x;
  const onRight = rx >= x;

  if (onTop) {
    if (onRight) {
      return 0;
    } else if (onLeft) {
      return 1;
    }
  } else if (onBottom) {
    if (onLeft) {
      return 2;
    } else if (onRight) {
      return 3;
    }
  }

  // 如果物体跨越多个象限，则放回-1
  return -1;
};

// 划分
QuadTree.prototype.split = function () {
  var level = this.level,
    bounds = this.bounds,
    x = bounds.x,
    y = bounds.y,
    sWidth = bounds.width / 2,
    sHeight = bounds.height / 2;

  this.nodes.push(
    new QuadTree(new Rect(bounds.centroid.x, y, sWidth, sHeight), level + 1),
    new QuadTree(new Rect(x, y, sWidth, sHeight), level + 1),
    new QuadTree(new Rect(x, bounds.centroid.y, sWidth, sHeight), level + 1),
    new QuadTree(
      new Rect(bounds.centroid.x, bounds.centroid.y, sWidth, sHeight),
      level + 1
    )
  );
};

/*
  插入功能：
    - 如果当前节点[ 存在 ]子节点，则检查物体到底属于哪个子节点，如果能匹配到子节点，则将该物体插入到该子节点中
    - 如果当前节点[ 不存在 ]子节点，将该物体存储在当前节点。随后，检查当前节点的存储数量，如果超过了最大存储数量，则对当前节点进行划分，划分完成后，将当前节点存储的物体重新分配到四个子节点中。
*/
QuadTree.prototype.insert = function (rect) {
  var [objs, i, index] = [this.objects];
  // 如果该节点下存在子节点
  if (this.nodes.length) {
    index = this.getIndex(rect);
    if (index !== -1) {
      this.nodes[index].insert(rect);
      return;
    }
  }
  // 否则存储在当前节点下
  objs.push(rect);
  // 如果当前节点存储的数量超过了MAX_OBJECTS
  if (
    !this.nodes.length &&
    this.objects.length > this.MAX_OBJECTS &&
    this.level < this.MAX_LEVELS
  ) {
    this.split();
    for (i = objs.length - 1; i >= 0; i--) {
      index = this.getIndex(objs[i]);
      if (index !== -1) {
        this.nodes[index].insert(objs.splice(i, 1)[0]);
      }
    }
  }
};
/*
  检索功能：
    给出一个物体对象，该函数负责将该物体可能发生碰撞的所有物体选取出来。该函数先查找物体所属的象限，该象限下的物体都是有可能发生碰撞的，然后再递归地查找子象限...
*/
QuadTree.prototype.retrieve = function (rect) {
  var [result, index] = [[]];

  if (this.nodes.length) {
    index = this.getIndex(rect);
    if (index !== -1) {
      resutl = result.concat(this.nodes[index].retrieve(rect));
    } else {
      arr = rect.carve(this.bounds);
      for (i = arr.length - 1; i >= 0; i--) {
        index = this.getIndex(arr[i]);
        resutl = result.concat(this.nodes[index].retrieve(rect));
      }
    }
  }
  result = result.concat(this.objects);
  return result;
};

export default new QuadTree(new Rect(0, 0, 1000, 500));
