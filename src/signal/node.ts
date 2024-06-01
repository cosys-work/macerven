import type { Signal } from "./signal";
import type { Computed } from "./computed";
import type { Effect } from "./effect";

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