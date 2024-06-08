/**
 * This file contains all the types used in monadic patterns
 * @module
 */

/**
 * The Value<T> type is a generic type that represents a value of type T.
 *  It has a single property value of type T.
 *  This type is commonly used to create objects that wrap a value and provide additional methods or functionality.
 */
export type Value<T> = {
  val: () => T;
};

/**
 *   Functor<T> type extends Value<T> and adds a map method.
 *   The map method takes a function f that takes a value of type T and returns a value of type U,
 *   and it applies f to the value property of the Functor object.
 *   This allows you to transform the wrapped value using a function in a type-safe manner.
 */
export type Functor<T> = Value<T> & {
  fmap: <U>(f: (x: T) => U) => Functor<U>;
};

/**
 * An Applicative is a design pattern that represents computations as sequences of steps. It has two methods:
 *
 *   ap: This method takes a function f that takes a value of type T and returns an Applicative of type U.
 *   It applies the function f to the current value and returns a new Applicative of type U.
 *
 *   pure: This method takes a value x of type T and returns an Applicative of type T.
 *   It wraps the value x in an Applicative structure.
 *
 *   In summary, the Applicative type represents computations as sequences of steps,
 *   and the ap method applies a function to the current value,
 *   while the pure method wraps a value in an Applicative structure.
 */
export type Applicative<T> = Functor<T> & {
  ap?: <U>(f: Applicative<(x: T) => U>) => Applicative<U>;
  cart: <U>(fa: Array<(x: T) => U>) => Applicative<U[]>;
  fold: <U extends T>(fa: Array<(x: T) => U>) => Applicative<U>;
  pure: <U>(x: U) => Applicative<U>;
};

/**
 * A Monad is a design pattern that represents computations as sequences of steps. It has two methods:
 *
 *   bind: This method takes a function f that takes a value of type T and returns a Monad of type U.
 *   It applies the function f to the current value and returns a new Monad of type U.
 *
 *   join: This method takes a Monad of type Monad<T> and returns a Monad of type T.
 *   It flattens the nested Monad structure and returns the innermost Monad of type T.
 *
 *   In summary, a Monad represents computations as sequences of steps,
 *   and the bind method applies a function to the current value,
 *   while the join method flattens nested Monad structures.
 */
export type Monad<T> = Applicative<T> & {
  bind: <U>(f: (x: T) => Monad<U>) => Monad<U>;  // Good to have, bind :: m t -> (t -> m u) -> m u
  join: (moMo: Monad<Monad<T>>) => Monad<T>; // Essential
};
