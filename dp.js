let knapsack01 = function (w, v, n) {};

console.log(knapsack01([1, 2, 3], [6, 10, 12], 5));

var wiggleMaxLength = function (nums) {};
console.log(wiggleMaxLength([1, 17, 5, 10, 13, 15, 10, 5, 16, 8]));

function promiseRace(arr) {
  return new Promise((resolve, reject) => {
    arr.forEach(i =>
      Promise.resolve(i)
        .then(res => resolve(res))
        .catch(err => reject(err))
    );
  });
}
