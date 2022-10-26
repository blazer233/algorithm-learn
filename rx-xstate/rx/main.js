import { Observable } from "./core/Observable";
import { from } from "./observable/from";
import { map } from "./operate/map";
import { take } from "./operate/take";
// Create a lazy Push System

// rxjs
//  .interval(500)
//  .pipe(rxjs.operators.take(400))
//  .subscribe(console.log);

const observable = new Observable(subscriber => {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.next(3);
  subscriber.complete();
  return () => {
    console.log(11111111);
  };
});
const pseudoSubscriber = {
  next: value => console.log("we got", value),
  error: error => console.error(error),
  complete: () => console.log("completed"),
};

const subscription = observable.subscribe(pseudoSubscriber);
subscription.unsubscribe();

from([1, 2, 3, 4, 5])
  .pipe(
    take(4),
    map(arg => {
      arg += 1;
      return arg;
    })
  )
  .subscribe(val => console.log(val));
// from("Hello World").subscribe(val => console.log(val));
