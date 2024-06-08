import type { Monad } from "../patterns";

export type Value<T> = {
  val: T
} & { __brand: 'value' };

export type Pipe = <T, U>(f: (x: T) => U) => Pipe;
export type Compose = <T, U>(f: (x: T) => U) => Compose;
export type Node<T> = Value<T> | Pipe | Compose;

export const isValue = <T>(obj: any): obj is Value<T> => obj?.__brand === 'value';

export type Func<T, U> = (x: T) => U;

export const join: <U>(moMo: Monad<Monad<U>>) => Monad<U> 
  = (moMo) => moMo.val;

/**
 * Creates a piper object with a value and functions to manipulate it.
 *
 * @param {T} val - The initial value of the piper.
 * @return {Monad<T>} - An object with the following functions:
 *   - fmap: Maps the value of the piper using the provided function.
 *   - ap: Applies an array of functions to the value of the piper.
 *   - fold: Applies a reducer function to the value of the piper.
 *   - pure: Creates a new piper with the provided value.
 *   - bind :: m t -> (t -> m u) -> m u, where m t is introduced from the val in closure
 */
export const piper: <T>(val: T) => Monad<T> 
  = <T>(val: T) => ({
    val,
    fmap: <U>(f: (x: T) => U) => piper(f(val)),
    cart: <U>(fa: Array<Func<T, U>>) => piper(fa.map(f => f(val))),
    fold: <U extends T>(fa: Array<Func<T, U>>) => piper(fa.reduce((acc, f) => f(acc), val)),
    pure: <U>(x: U) => piper(x),
    bind: <U>(f: (x: T) => Monad<U>) => join(piper(f(val))),
    join: <U>(moMo: Monad<Monad<U>>) => moMo.val    
}) as Monad<T>;