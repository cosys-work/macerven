import type { Signal } from "./signal";
import type { Node } from "./node";

export declare class Computed<T extends Object> extends Signal<T> {
	_fn: () => T;
	_sources?: Node<T>;
	_globalVersion: number;
	_flags: number;

	constructor(fn: () => T);

	_notify(): void;
	get value(): T;
}
