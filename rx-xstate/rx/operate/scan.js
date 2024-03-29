import { operate } from "./OperatorSubscriber";
import { scanInternals } from "./scanInternals";

export function scan(accumulator, seed) {
  return operate(scanInternals(accumulator, seed, arguments.length >= 2, true));
}
