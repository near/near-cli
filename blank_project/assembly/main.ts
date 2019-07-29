import { Greeter } from "../out/model.near";

// --- contract code goes below

// >> hello-snippet
// To be able to call this function in the contract we need to export it
// using `export` keyword.

export function hello(): string {
  let greeter = new Greeter("Hello");
  return greeter.greet("world");
}
// << hello-snippet
