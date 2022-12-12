import { Observable } from "./core";

export function from(obj) {
  return new Observable(subscriber => {
    for (let i = 0; i < obj.length && !subscriber.closed; i++) {
      subscriber.next(obj[i]);
    }
    subscriber.complete();
  });
}
