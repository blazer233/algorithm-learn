var arr1 = [1, 2, [3], [1, 2, 3, [4, [2, 3, 4]]]];
function flatten(arr) {
  while (arr.some(item => Array.isArray(item))) {
    arr = [].concat(...arr);
  }
  return arr;
  return arr.flat(Infinity);
  return arr
    .toString()
    .split(",")
    .map(item => +item);
}
flatten(arr1); //[1, 2, 3, 1, 2, 3, 4, 2, 3, 4]
