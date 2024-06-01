import type { Node } from "./node";

export type EffectFn = () => void | (() => void);

export declare class Effect<T extends Object> {
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
