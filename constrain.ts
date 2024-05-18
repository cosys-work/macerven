export type Stack<T> = {
  push(item: T): Stack<T>;
  pop(): [T | undefined, Stack<T>];
  isEmpty(): boolean;
}

export type Queue<T> = {
  enqueue(item: T): Queue<T>;
  dequeue(): [T | undefined, Queue<T>];
}

export type HashMap<K, V> = {
  put(key: K, value: V): void;
  get(key: K): V | undefined;
}

export type Value<T>= {
  value: T;
}

export type Functor<T> = Value<T> & {
  map: <U>(f: (x: T) => U) => Functor<U>;
};

export type Applicative<T> = Functor<T> & {
  ap: <U>(f: Applicative<(x: T) => U>) => Applicative<U>;
  pure: (x: T) => Applicative<T>;
};

export type Monad<T> = Applicative<T> & {
  bind: <U>(f: (x: T) => Monad<U>) => Monad<U>;
  join: (moMo: Monad<Monad<T>>) => Monad<T>;
};


function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}



function checkFunctorLaws<T, U, V>(functor: Functor<T>, f: (x: T) => U, g: (x: U) => V) {
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
