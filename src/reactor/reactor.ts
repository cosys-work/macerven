import type { Monad } from "../patterns";

export type Value<T> = {
  val: () => T
} & { __brand: 'value' };

export type Pipe = <T, U>(f: (x: T) => U) => Pipe;
export type Compose = <T, U>(f: (x: T) => U) => Compose;
export type Node<T> = Value<T> | Pipe | Compose;

export const isValue = <T>(obj: any): obj is Value<T> => obj?.__brand === 'value';

export type Func<T, U> = (x: T) => U;

export const join: <U>(moMo: Monad<Monad<U>>) => Monad<U> 
  = (moMo) => moMo.val();

/**
 * Creates a folder object with a value and functions to manipulate it.
 *
 * @param {T} val - The initial value of the folder.
 * @return {Monad<T>} - An object with the following functions:
 *   - fmap: Maps the value of the folder using the provided function.
 *   - ap: Applies an array of functions to the value of the folder.
 *   - fold: Applies a reducer function to the value of the folder.
 *   - pure: Creates a new folder with the provided value.
 *   - bind :: m t -> (t -> m u) -> m u, where m t is introduced from the val in closure
 */
export const folder: <T>(val: T) => Monad<T> 
  = <T>(val: T) => ({
    val: () => val,
    fmap: <U>(f: (x: T) => U) => folder(f(val)),
    cart: <U>(fa: Array<Func<T, U>>) => folder(fa.map(f => f(val))),
    fold: <U extends T>(fa: Array<Func<T, U>>) => folder(fa.reduce((acc, f) => f(acc), val)),
    pure: (x: T) => folder(x),
    bind: <U>(f: (x: T) => Monad<U>) => join(folder(f(val))),
    join    
}) as Monad<T>;

export const zipper: <T, U>(x: T, y: U) => Monad<[T, U]>
  = <T, U>(x: T, y: U) => folder([x, y]);


export type LinkedList<T> = {
  head: T,
  tail?: LinkedList<T>
}

export function composeFuncList<T extends Func<T, any>>(initial: T, ll: LinkedList<T>): any {
  return ll.tail ? composeFuncList(ll.head(initial), ll.tail) : ll.head(initial);
}