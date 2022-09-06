import machine from "../stately";
const door = machine({
  RED: {
    yello: "YELLO",
    onChange(fn, from, to) {
      console.log(fn, from, to, "onChange");
    },
  },
  GREEN: {
    red: "RED",
    onChange(fn, from, to) {
      console.log(fn, from, to, "onChange");
    },
  },
  YELLO: {
    green: "GREEN",
    onChange(fn, from, to) {
      console.log(fn, from, to, "onChange");
    },
  },
});

console.log(
  `${door.getMachineState()}---${door.getMachineEvents()}`,
  "    door.getMachineState()"
);
console.log(
  `${door.yello().getMachineState()}---${door.getMachineEvents()}`,
  "    door.yello().getMachineState()"
);
console.log(
  `${door.green().getMachineState()}---${door.getMachineEvents()}`,
  "    door.green().getMachineState()"
);
console.log(
  `${door.red().yello().getMachineState()}---${door.getMachineEvents()}`,
  "    door.red().yello().getMachineState()"
);
