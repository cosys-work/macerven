import type { Applicative, Functor, Monad } from "./patterns";

// See: https://github.com/preactjs/signals/blob/main/packages/core/src/index.ts for npm/es5-friendly original implementation
// This is a jsr friendly implementation.
const BRAND_SYMBOL = Symbol.for("free-act-signals");

// Flags for Computed and Effect.
// const RUNNING = 1 << 0;
// const NOTIFIED = 1 << 1;
// const OUTDATED = 1 << 2;
// const DISPOSED = 1 << 3;
// const HAS_ERROR = 1 << 4;
const TRACKING = 1 << 5;

declare class Computed<T extends Object> extends Signal<T> {
	_fn: () => T;
	_sources?: Node<T>;
	_globalVersion: number;
	_flags: number;

	constructor(fn: () => T);

	_notify(): void;
	get value(): T;
}

type EffectFn = () => void | (() => void);

declare class Effect<T extends Object> {
	_fn?: EffectFn;
	_cleanup?: () => void;
	_sources?: Node<T>;
	_nextBatchedEffect?: Effect<T>;
	_flags: number;

	constructor(fn: EffectFn);

	_callback(): void;
	_start(): () => void;
	_notify(): void;
	_dispose(): void;
}

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
	_target?: Computed<T> | Effect<T>;
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

  set _node(node: Node<T>) {
    this.#node = node;
  }
  
  get _node(): Node<T> {
    return this.#node ?? new Node(this);
  }

  set _version(version: number) {
    this.#version = version;
  }

  get _version(): number {
    return this.#version;
  }

  set _targets(targets: Node<T>) {
    this.#targets = targets;
  }

  get _targets(): Node<T> {
    return this.#targets ?? new Node(this);
  }

  _subscribe(node: Node<T>): void {
    if (this._targets !== node && node._prevTarget === undefined) {
      node._nextTarget = this._targets;
      if (this._targets !== undefined) {
        this._targets._prevTarget = node;
      }
      this._targets = node;
    }
  }

  _unsubscribe(node: Node<T>): void {
    if (this._targets !== undefined) {
      const prev = node._prevTarget;
      const next = node._nextTarget;
      if (prev !== undefined) {
        prev._nextTarget = next;
        node._prevTarget = undefined;
      }
      if (next !== undefined) {
        next._prevTarget = prev;
        node._nextTarget = undefined;
      }
      if (node === this._targets) {
        this._targets = next ?? this._targets;
      }
    }
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

function addDependency<T extends Object>(signal: Signal<T>, evalContext: Computed<T> | Effect<T>): Node<T> | undefined {
  // Add a new dependency node to the evalContext's dependency list.
	let node = signal._node;
	if (node === undefined || node._target !== evalContext) {
		/**
		 * `signal` is a new dependency. Create a new dependency node, and set it
		 * as the tail of the current context's dependency list. e.g:
		 *
		 * { A <-> B       }
		 *         ↑     ↑
		 *        tail  node (new)
		 *               ↓
		 * { A <-> B <-> C }
		 *               ↑
		 *              tail (evalContext._sources)
		 */
		node = {
			_version: 0,
			_source: signal,
			_prevSource: evalContext._sources,
			_nextSource: undefined,
			_target: evalContext,
			_prevTarget: undefined,
			_nextTarget: undefined,
			_rollbackNode: node,
		};

		if (evalContext._sources !== undefined) {
			evalContext._sources._nextSource = node;
		}
		evalContext._sources = node;
		signal._node = node;

		// Subscribe to change notifications from this dependency if we're in an effect
		// OR evaluating a computed signal that in turn has subscribers.
		if (evalContext._flags & TRACKING) {
			signal._subscribe(node);
		}
		return node;
	} else if (node._version === -1) {
		// `signal` is an existing dependency from a previous evaluation. Reuse it.
		node._version = 0;

		/**
		 * If `node` is not already the current tail of the dependency list (i.e.
		 * there is a next node in the list), then make the `node` the new tail. e.g:
		 *
		 * { A <-> B <-> C <-> D }
		 *         ↑           ↑
		 *        node   ┌─── tail (evalContext._sources)
		 *         └─────│─────┐
		 *               ↓     ↓
		 * { A <-> C <-> D <-> B }
		 *                     ↑
		 *                    tail (evalContext._sources)
		 */
		if (node._nextSource !== undefined) {
			node._nextSource._prevSource = node._prevSource;

			if (node._prevSource !== undefined) {
				node._prevSource._nextSource = node._nextSource;
			}

			node._prevSource = evalContext._sources;
			node._nextSource = undefined;

			evalContext._sources!._nextSource = node;
			evalContext._sources = node;
		}

		// We can assume that the currently evaluated effect / computed signal is already
		// subscribed to change notifications from `signal` if needed.
		return node;
	}
	return undefined;
}