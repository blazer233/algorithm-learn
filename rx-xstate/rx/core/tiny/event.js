import { Observable } from "./core";

export const fromEvent = (target, eventName) => {
  return new Observable(subscriber => {
    const handler = e => subscriber.next(e);
    target.addEventListener(eventName, handler);
    const unsubscribe = () => target.removeEventListener(eventName, handler);
    subscriber.add(unsubscribe);
  });
};
