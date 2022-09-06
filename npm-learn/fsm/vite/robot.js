{
  /* <h1>Users</h1>
  <main>
    <div>
      <button id="load" type="button">
        Load users
      </button>
      <div id="users"></div>
    </div>
  </main>
  <div class="glitchButton" style="position:fixed;top:20px;right:20px;"></div> */
}
import {
  invoke,
  state,
  transition,
  createMachine,
  interpret,
  reduce,
} from "./robot";

const context = () => ({ users: [] });

async function loadUsers() {
  const wait = time => new Promise(resolve => setTimeout(resolve, time));
  await wait(3000);
  return [
    { id: 1, name: "Wilbur" },
    { id: 2, name: "Matthew" },
    { id: 3, name: "Anne" },
  ];
}

const machine = createMachine(
  {
    idle: state(transition("fetch", "loading")),
    loading: invoke(
      loadUsers,
      transition(
        "done",
        "loaded",
        reduce((ctx, ev) => ({ ...ctx, users: ev.data }))
      )
    ),
    loaded: state(),
  },
  context
);

const service = interpret(machine, service => {
  console.log(service);
  let state = service.machine.current;
  switch (state) {
    case "loading": {
      loadBtn.setAttribute("disabled", "");
      usersNode.innerHTML = `<span class="loading">Loading</span>`;
      break;
    }
    case "loaded": {
      let { users } = service.context;
      usersNode.innerHTML = `
        <ul>
        ${users
          .map(
            user => `
          <li id="user-${user.id}">${user.name}</li>
        `
          )
          .join("")}
        </ul>
      `;
      break;
    }
  }
});

const usersNode = document.querySelector("#users");
const loadBtn = document.querySelector("#load");
loadBtn.onclick = () => service.send("fetch");
