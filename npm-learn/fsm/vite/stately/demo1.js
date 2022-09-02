import machine from "../../stately";
const door = machine({
  OPEN: {
    close: "CLOSED",
  },
  CLOSED: {
    open: "OPEN",
  },
});
console.log(door, "door");
console.log(door.getMachineEvents(), "--door.getMachineEvents()");
console.log(door.getMachineState(), "--door.getMachineState()");
// console.log(door.close().getMachineState(), "--door.close().getMachineState()");
// console.log(door.open().getMachineState(), "--door.open().getMachineState()");
