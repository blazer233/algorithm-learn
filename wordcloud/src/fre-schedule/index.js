import { handleAsyncTask as task } from "../tool_config";
const queue = [];
const threshold = 5;
const transitions = [];
let deadline = 0;

export const getTime = () => performance.now();
export const shouldYield = () => getTime() >= deadline;
export const startTransition = cb =>
  transitions.push(cb) && task(transitions.shift());

export const schedule = callback => {
  queue.push(callback);
  startTransition(flush);
};

function flush() {
  deadline = getTime() + threshold;
  while (queue.length && !shouldYield()) queue.shift()();
}
