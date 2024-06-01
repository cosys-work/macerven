import type { Functor, Applicative, Monad } from "./patterns";

/**
 * Throws an error with the given message if the condition is false.
 *
 * @param {boolean} condition - The condition to check.
 * @param {string} message - The error message to throw.
 * @return {void} This function does not return anything.
 */
export function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

/**
 * Checks the functor laws for the given functor, function `f`, and function `g`.
 *
 * @param {Functor<T>} functor - The functor to check.
 * @param {(x: T) => U} f - The function `f` to apply to the functor.
 * @param {(x: U) => V} g - The function `g` to apply to the result of `f`.
 */
export function checkFunctorLaws<T, U, V>(functor: Functor<T>, f: (x: T) => U, g: (x: U) => V) {
  // Identity law: fmap id = id
  assert(JSON.stringify(functor.map(x => x)) === JSON.stringify(functor), 'Functor identity law failed');

  // Composition law: fmap (g . f) = fmap g . fmap f
  assert(JSON.stringify(functor.map(x => g(f(x)))) === JSON.stringify(functor.map(f).map(g)), 'Functor composition law failed');
}

// Applicative laws
function checkApplicativeLaws<T, U>(applicative: Applicative<T>, f: (x: T) => U, x: T) {
  // Identity law: pure id <*> v = v
  
  // Homomorphism law: pure f <*> pure x = pure (f x)

  // Interchange law: u <*> pure y = pure ($ y) <*> u

}

// Monad laws
function checkMonadLaws<T, U, V>(monad: Monad<T>, f: (x: T) => Monad<U>, g: (x: U) => Monad<V>) {
  // Left identity law: return a >>= f = f a
  assert(JSON.stringify(monad.bind(f)) === JSON.stringify(f(monad.value)), 'Monad left identity law failed');

  // Right identity law: m >>= return = m
  assert(JSON.stringify(monad.bind(x => monad)) === JSON.stringify(monad), 'Monad right identity law failed');


  // Associativity law: (m >>= f) >>= g = m >>= (\x -> f x >>= g)
  assert(JSON.stringify(monad.bind(f).bind(g)) === JSON.stringify(monad.bind(x => f(x).bind(g))), 'Monad associativity law failed');
}
