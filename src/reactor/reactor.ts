import type { Monad } from "../patterns";

export type Value<T> = {
  val: () => T
} & { __brand: 'value' };

/**
 * Checks if the given object is a value of type T.
 *
 * @param {any} obj - The object to check.
 * @return {obj is Value<T>} - True if the object is a value of type T, false otherwise.
 */
export function isValue<T>(obj: any): obj is Value<T> {
    return obj?.__brand === 'value' && obj?.val() !== undefined;
}

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
 *
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
    pure,
    bind: <U>(f: (x: T) => Monad<U>) => join(folder(f(val))),
    join    
}) as Monad<T>;
