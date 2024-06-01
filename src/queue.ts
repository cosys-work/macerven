/** 
* Uniquely represents a queue.
*/
export const QueueN = Symbol("Queue");

/**
* EmptyQueue represents a type for an empty queue. Here's a succinct explanation:

* The EmptyQueue type has a property [QueueN]: true and isEmpty: true. These properties indicate that the queue is empty.
* The enqueue method adds an item to the queue and returns a new queue with the item added.
* The dequeue method removes the first item from the queue and returns a tuple containing the removed item (which will be undefined in this case) and a new EmptyQueue instance.
*/
export type EmptyQueue<T> = {
  [QueueN]: true;
  isEmpty: true;

  enqueue(item: T): Queue<T>;
  dequeue(): [undefined, EmptyQueue<T>];
}

/**
* The Queue<T> type represents a queue data structure in TypeScript. Here's a succinct explanation of its methods:
* 
* [QueueN]: true: This property indicates that the object is a queue.
* isEmpty: false: This property indicates that the queue is not empty.
* 
* enqueue(item: T): Queue<T>: This method adds an item to the queue and returns a new queue with the item added.
* dequeue(): [T, Queue<T>] | [undefined, EmptyQueue<T>]: This method removes the first item from the queue and returns a tuple containing the removed item and a new queue. If the queue is empty, it returns [undefined, EmptyQueue<T>].
* 
* This type is used to define the structure of a queue object that can hold values of type T. It includes methods to add items to the queue and remove items from the front of the queue.
*/
export type Queue<T> = {
  [QueueN]: true,
  isEmpty: false;

  enqueue(item: T): Queue<T>;
  dequeue(): [T, Queue<T>] | [undefined, EmptyQueue<T>];
}

/**
* Checks if the given object is a Queue or EmptyQueue of type T.
*
* @param {any} obj - The object to check.
* @return {obj is Queue<T> | EmptyQueue<T>} - True if the object is a Queue or EmptyQueue of type T, false otherwise.
*/
export function isQueue<T>(obj: any): obj is Queue<T> | EmptyQueue<T> {
  return obj?.hasOwnProperty(QueueN);
}

/**
 * Checks if the given object is an empty queue of type T.
 *
 * @param {any} obj - The object to check.
 * @return {obj is EmptyQueue<T>} - True if the object is an empty queue of type T, false otherwise.
*/
export function isEmptyQueue<T>(obj: any): obj is EmptyQueue<T> {
  return obj?.hasOwnProperty(QueueN) && obj?.isEmpty === true;
}
