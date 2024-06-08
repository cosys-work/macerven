import { describe, test, expect } from "bun:test";
import { join, piper } from "./reactor";
import type { Monad } from "../patterns";

describe("piper", () => {
  test("fmap should apply a function to the value", () => {
    expect(piper(42).fmap(x => x + x).val).toEqual(84);
  });
  
  test("cartesian ap should apply functions to the value as a cartesian cross product", () => {
    const answer = piper(2).cart([x => x +  x + x, x => x * x]).val;
    expect(answer).toBeArray();  
    expect(answer[0]).toEqual(6);
    expect(answer[1]).toEqual(4);
  })
  
  test("fold ap (similar to zip ap) should apply functions to the value as a chain of composed functions", () => {
    expect(piper(2).fold([x => x + x, x => x * x]).val).toEqual(16);  
  })  

  test("pure should create a new piper with the provided value", () => {
    const pied = piper('life, universe, everything');
    expect(pied.pure(42).val).toEqual(42);
  })

  test("bind should bind a function to the value", () => {
    const answer = piper(42).bind(x => piper(x + x)).val;
    expect(answer).toEqual(84);
  })

  test("join should unbox a monad", () => {
    const answer: Monad<Monad<number>> = piper(piper(42));
    expect(join(answer).val).toEqual(42);
   })
})

