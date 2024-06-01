import type { Applicative, Functor, Monad } from "./patterns";

const BRAND_SYMBOL = Symbol.for("free-act-signals");
// See: https://github.com/preactjs/signals/blob/main/packages/core/src/index.ts for npm/es5-friendly original implementation
// This is a jsr friendly implementation.

/** 
* A linked list node used to track dependencies (sources) and dependents (targets).
* Also used to remember the source's last version number that the target saw. 
*/
export class Node<T extends object> {
	/* A source whose value the target depends on. */
	_source?: Signal<T>;
	_prevSource?: Node<T>;
	_nextSource?: Node<T>;

	/* A target that depends on the source and should be notified when the source changes. */
	// _target: Computed | Effect;
	_prevTarget?: Node<T>;
	_nextTarget?: Node<T>;

	/**  
  * The version number of the source that target has last seen. We use version numbers
	* instead of storing the source value, because source values can take arbitrary amount
	* of memory, and computed-s could hang on to them forever because they're lazily evaluated.
	* Use the special value -1 to mark potentially unused but recyclable nodes. 
  */
	_version: number;

	/** 
   * Used to remember & roll back the source's previous `._node` value when entering &
   * exiting a new evaluation context. 
  */
	_rollbackNode?: Node<T>;

  constructor(signal?: Signal<T>) {
    this._version = -1;
    this._source = signal;
  }
};

/**
 * The base class for plain and computed signals.
 */
export class Signal<T extends Object> implements Monad<T> {
	/** @internal */
	#value;

	/**
	 * @internal
	 * Version numbers should always be >= 0, because the special value -1 is used
	 * by Nodes to signify potentially unused but recyclable nodes.
	 */
	#version: number = 0;

	/** @internal */
	#node?: Node<T>;

	/** @internal */
	#targets?: Node<T>;

	constructor(value: T) {
    this.#value = value;
    this.#version = 0;
    this.#node = undefined;
    this.#targets = undefined;
  }
  

  map: <U>(f: (x: T) => U) => Functor<U>
    = <U>(f: (x: T) => U) => f(this.value) as Functor<U>;

  ap: <U>(f: Applicative<(x: T) => U>) => Applicative<U>
    = <U>(f: Applicative<(x: T) => U>) => f.map(f => f(this.value)) as Applicative<U>;

  pure: (x: T) => Applicative<T>
    = <T extends Object>(x: T) => new Signal<T>(x);

  bind: <U>(f: (x: T) => Monad<U>) => Monad<U>
    = <U>(f: (x: T) => Monad<U>) => f(this.value);

  join: (moMo: Monad<Monad<T>>) => Monad<T>
    = (moMo: Monad<Monad<T>>) => moMo.bind(x => x);

	/** @internal */
	_refresh(): boolean {
    return true;
  };

  get val(): T {
    return this.#value;
  }

  addTarget(target: Node<T>): void {
    if (!this.#targets) {
      this.#targets = target;
    } else {
      this.#targets._nextTarget = target;
      target._prevTarget = this.#targets;
      this.#targets = target;

      if (this.#node) {
        this.#node._version = this.#version;
      }
    }
  }

	valueOf(): T {
    return this.value;
  }

	toString(): string {
    return this.value + "";
  }

	toJSON(): T {
    return this.value;
  }

	peek(): T {
    return this.value;
  }

	brand: typeof BRAND_SYMBOL = BRAND_SYMBOL;

	set value(value: T) {
    this.#value = value;
    this.#version++;
    if (this.#node) {
      this.#node._version = this.#version;
    }
  }
}