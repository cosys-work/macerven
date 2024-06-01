import type { Signal } from "./signal";
import type { Computed } from "./computed";
import type { Effect } from "./effect";
import type { Node } from "./node";

// Flags for Computed and Effect.
// const RUNNING = 1 << 0;
// const NOTIFIED = 1 << 1;
// const OUTDATED = 1 << 2;
// const DISPOSED = 1 << 3;
// const HAS_ERROR = 1 << 4;
const TRACKING = 1 << 5;



type EvalContext<T extends Object = any> = Computed<T> | Effect<T> | undefined;
let evalContext: EvalContext = undefined;
/**
 * Adds a new dependency node to the evalContext's dependency list. If the signal is a new dependency,
 * creates a new dependency node and sets it as the tail of the current context's dependency list.
 * If the signal is an existing dependency from a previous evaluation, reuses it.
 *
 * @param {Signal<T>} signal - The signal to add as a dependency.
 * @param {Computed<T> | Effect<T>} evalContext - The context in which the dependency is being added.
 * @return {Node<T> | undefined} - The newly created dependency node, or undefined if the signal is already a dependency.
 */
export function addDependency<T extends Object>(signal: Signal<T>): Node<T> | undefined {
  if (evalContext === undefined) {
    return undefined;
  }
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