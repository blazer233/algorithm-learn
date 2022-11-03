import { Observable } from "./core";

export function from(obj) {
  if (obj instanceof Observable) return obj;
  if (obj) {
    if (typeof obj.length === "number" && typeof obj != "function") {
      return new Observable(subscriber => {
        for (let i = 0; i < obj.length && !subscriber.closed; i++) {
          subscriber.next(obj[i]);
        }
        subscriber.complete();
      });
    }
  }
}
