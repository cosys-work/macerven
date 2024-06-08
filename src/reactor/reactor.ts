import { BehaviorSubject } from "rxjs";
import type { Monad } from "../patterns";

/**
 * A function that takes a value of type T and returns a value of type U.
*/
export type Func<T, U> = (x: T) => U;

/**
 * Unwraps a boxed folder monad and returns the inner monad.
*/
export function join<U>(moMo: Monad<Monad<U>>): Monad<U> {
  return moMo.val();
}

/**
 * Creates a folder object with a value and functions to manipulate it.
 * @param {T} x - The initial value of the folder.
 * @return {Monad<T>} - An object with the following functions:
 *   - fmap: Maps the value of the folder using the provided function.
 *   - ap: Applies an array of functions to the value of the folder.
 *   - fold: Applies a reducer function to the value of the folder.
 *   - pure: Creates a new folder with the provided value.
 *   - bind :: m t -> (t -> m u) -> m u, where m t is introduced from the val in closure
 */
export const pure = <T>(x: T): Monad<T> => folder(x);

/**
 * Creates a folder object with a value and functions to manipulate it.
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
    pure,
    bind: <U>(f: (x: T) => Monad<U>) => join(folder(f(val))),
    join    
}) as Monad<T>;

/**
 * Creates a Monad object with a value and functions to manipulate it.
 *
 * @param {T} val - The initial value of the Monad.
 * @return {Monad<T>} - An object with the following functions:
 *   - val: Returns the current value of the Monad.
 *   - fmap: Maps the value of the Monad using the provided function.
 *   - cart: Applies an array of functions to the value of the Monad.
 *   - fold: Applies a reducer function to the value of the Monad.
 *   - pure: Creates a new Monad with the provided value.
 *   - bind: Applies a function to the value of the Monad and returns a new Monad.
 *   - join: Returns a new Monad with the value of the current Monad.
 *   - sub: Subscribes to changes in the value of the Monad.
 *   - unsub: Unsubscribes from changes in the value of the Monad.
 *   - pipe: Pipes the value of the Monad to another Observable.
 */
export const piper: <T>(val: T) => Monad<T>
  = <T>(val: T) =>  { 
    const __val = new BehaviorSubject<T>(val);
    return ({
    val: () => __val.value,
    fmap: <U>(f: (x: T) => U) => piper(f(__val.value)),
    cart: <U>(fa: Array<Func<T, U>>) => piper(fa.map(f => f(__val.value))),
    fold: <U extends T>(fa: Array<Func<T, U>>) => piper(fa.reduce((acc, f) => f(acc), __val.value)),
    pure,
    bind: <U>(f: (x: T) => Monad<U>) => join(piper(f(__val.value))),
    join,
    sub: __val.subscribe,
    unsub: __val.unsubscribe,
    pipe: __val.pipe 
  }) as Monad<T> }