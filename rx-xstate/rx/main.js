// import { Observable } from "./core/Observable";
import { from } from "./observable/from";
import { map } from "./operate/map";
import { take } from "./operate/take";
import { Observable } from "./core/other";

// Create a lazy Push System

const observable = new Observable(subscriber => {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.next(3);
  subscriber.complete();
  return () => console.log("succes");
});
const pseudoSubscriber = {
  next: value => console.log("we got", value),
  error: error => console.error(error),
  complete: () => console.log("completed"),
};

const subscription = observable.subscribe(pseudoSubscriber);
subscription.unsubscribe();

// from([1, 2, 3, 4, 5])
//   .pipe(
//     take(4),
//     map(arg => {
//       arg += 1;
//       return arg;
//     })
//   )
//   .subscribe(console.log);
// from("Hello World").subscribe(val => console.log(val));
