
import produce from './core'
import producejs from './immer.js';
const base = {
  a: 1,
  b: {
    c: 2,
    d: 3,
  }
}
console.time('produce')
const immutable = produce(base, (draft: any) => {
  draft.b.c = 6;
})
console.timeEnd('produce')
console.time('producejs')
const immutable1 = producejs(base, (draft: any) => {
  draft.b.c = 4;
})
console.timeEnd('producejs')

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
${JSON.stringify(immutable)}
${JSON.stringify(immutable1)}
`
