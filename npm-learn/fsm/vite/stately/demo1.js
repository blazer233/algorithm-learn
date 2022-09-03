import machine from "../../stately";
const door = machine({
  OPEN: {
    onBeforeClose: function (arg) {
      console.log(arg, "onBeforeClose");
    },
    close: "CLOSED",
    onAfterClose: function (arg) {
      console.log(arg, "onAfterClose");
    },
    onLeave: function (arg) {
      console.log(arg, "onLeave");
    },
    onEnter: function (arg) {
      console.log(arg, "onEnter");
    }
  },
  CLOSED: {
    open: "OPEN",
    next1: function () {}
  }
});
console.log(door, "door");
console.log(door.getMachineEvents(), "--door.getMachineEvents()");
console.log(door.getMachineState(), "--door.getMachineState()");
console.log(door.close().getMachineState(), "--door.close().getMachineState()");
// console.log(door.next1().getMachineState(), "--door.next1().getMachineState()");
console.log(door.open().getMachineState(), "--door.open().getMachineState()");
