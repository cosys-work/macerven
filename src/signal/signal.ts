import type { Applicative, Functor, Monad } from "../patterns";
import { Node } from "./node";

/** 
 * See: https://github.com/preactjs/signals/blob/main/packages/core/src/index.ts for npm/es5-friendly original implementation
 * This is a jsr friendly implementation. 
 * @module
 * */
const BRAND_SYMBOL = Symbol.for("free-act-signals");

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

