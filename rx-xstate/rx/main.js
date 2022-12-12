// import { Observable } from "./core/Observable";
// import { from } from "./observable/from";
// import { fromEvent } from "./observable/event";
// import { map } from "./operate/map";
// import { take } from "./operate/take";
// import { scan } from "./operate/scan";
// import { Subject } from "./core/Subject";
// import { switchMap } from "./operate/switchMap";
// import { bindCallback } from "./observable/bindCallback";
import {
  Observable,
  from,
  take,
  map,
  fromEvent,
  Subject,
} from "./core/tiny/index";

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

from("357911").subscribe(console.log);

fromEvent(document, "click")
  .pipe(
    take(4),
    map(({ type }) => ({ type }))
  )
  .subscribe(console.log);

const source$ = new Subject();
source$.subscribe(data => console.log(`Subject 订阅: ${data}`));
source$
  // .pipe(take(2))
  .subscribe(data => console.log(`Subject take(2)订阅: ${data}`));

source$.next(1);
source$.next(2);
source$.next(3);
source$.subscribe(data => console.log(`Subject 只订阅第四次: ${data}`));
source$.next(4);

source$.complete();

// const test = cb => cb(1);
// let o$ = bindCallback(test);
// o$().subscribe(console.log);
