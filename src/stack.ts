// Uniquely represents a stack.
export const StackN = Symbol("Stack");

/*
The EmptyStack<T> type represents an empty stack data structure in TypeScript. It is a type definition that defines the shape of an empty stack object. Here is a succinct explanation of each method:

push(item: T): Stack<T>: This method adds an item to the stack and returns a new stack with the item added.
pop(): [undefined, EmptyStack<T>]: This method removes the top item from the stack and returns a tuple containing undefined and a new empty stack.
peek(): [undefined, EmptyStack<T>]: This method returns the top item of the stack without removing it, along with the empty stack itself.
size(): 0: This method returns the size of the stack, which is always 0 for an empty stack.

The EmptyStack<T> type also includes two fields:

[StackN]: true: This field is a symbol that uniquely represents a stack object.
isEmpty: true: This field indicates that the stack is empty.

Overall, this type definition provides a clear structure for an empty stack object, including the methods for adding and removing items, inspecting the top item, and getting the size of the stack.
*/
export type EmptyStack<T> = {
  [StackN]: true;
  isEmpty: true;

  push(item: T): Stack<T>;
  pop(): [undefined, EmptyStack<T>];
  peek(): [undefined, EmptyStack<T>];
  size(): 0;
};

/*
Represents a stack data structure. Here's a succinct explanation of its methods:

[StackN]: true: This property indicates that the object is a stack.
isEmpty: false: This property indicates that the stack is not empty.

push(item: T): Stack<T>: This method adds an item to the stack and returns a new stack with the item added.
pop(): [T, Stack<T>] | [undefined, EmptyStack<T>]: This method removes the top item from the stack and returns a tuple containing the removed item and a new stack. If the stack is empty, it returns [undefined, EmptyStack<T>].
peek(): [T, Stack<T>]: This method returns the top item of the stack without removing it, along with the stack itself.
size(): number: This method returns the number of items in the stack.

This type is used to define the structure of a stack object that can hold values of type T. It includes methods to add items to the stack, remove items from the top, and inspect the top item without removing it.

The Stack<T> type also uses symbols to ensure type safety. The StackN symbol is used to identify objects as stacks, and the EmptyStack<T> type represents an empty stack.
*/
export type Stack<T> = {
  [StackN]: true;
  isEmpty: false;

  push(item: T): Stack<T>;
  pop(): [T, Stack<T>] | [undefined, EmptyStack<T>];
  peek(): [T, Stack<T>];
  size(): number;
};

/**
 * Checks if the given object is a Stack of type T.
 *
 * @param {any} obj - The object to check.
 * @return {obj is Stack<T>} - True if the object is a Stack of type T, false otherwise.
 */
export function isStack<T>(obj: any): obj is Stack<T> {
  return obj?.hasOwnProperty(StackN);
}

/**
 * Checks if the given object is an empty stack of type T.
 *
 * @param {any} obj - The object to check.
 * @return {obj is EmptyStack<T>} - True if the object is an empty stack of type T, false otherwise.
 */
export function isEmptyStack<T>(obj: any): obj is EmptyStack<T> {
  return obj?.hasOwnProperty(StackN) && obj?.isEmpty === true;
}
