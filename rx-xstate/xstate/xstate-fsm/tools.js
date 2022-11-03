export const toArray = i => (i ? [i] : []);
export const assign = i => ({ type: ASSIGN_ACTION, assignment: i });
export const INIT_EVENT = { type: "xstate.init" };
export const ASSIGN_ACTION = "xstate.assign";
export const isMatcher = val => state => state == val;
export const toEventObject = event =>
  typeof event === "string" ? { type: event } : event;
export const createUnchangedState = (value, context) => {
  return {
    value,
    context,
    actions: [],
    changed: false,
    matches: isMatcher(value),
  };
};
export const toActionObject = (action, actionMap) => {
  action =
    typeof action === "string" && actionMap && actionMap[action]
      ? actionMap[action]
      : action;
  return typeof action === "string"
    ? {
        type: action,
      }
    : typeof action === "function"
    ? {
        type: action.name,
        exec: action,
      }
    : action;
};
