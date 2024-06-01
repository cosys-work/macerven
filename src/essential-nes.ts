/*
    Represents a multi-dimensional array.
*/
export type MultiDimArray<T> = T[] | MultiDimArray<T>[];

/*
    Represents a JSON value.
*/
export type Json = string | number | null | Json[] | { [k: string]: Json };

// Represents a tree with a parent
export type Tree<T> = {
    val: T,
    left?: Tree<T>,
    right?: Tree<T>,
    parent: Tree<T>,
};

// Represents a binary tree
export type BinaryTree<T> = {
    val: T,
    left: BinaryTree<T> | null,
    right: BinaryTree<T> | null,
};

// Approximates a hyper-graph
export type HGraph<T> = {
    val: T | Array<T>,
    edges: Array<Array<HGraph<T>>>,
};

// Represents a priority queue
export type PriorityQueue<T> = {
    val: T,
    priority: number,
    next: PriorityQueue<T> | null,
};

// Represents a linked list
export type LinkedList<T> = {
    val: T,
    next: LinkedList<T> | null,
};

// Represents a doubly linked list
export type DoublyLinkedList<T> = {
    val: T,
    next: DoublyLinkedList<T> | null,
    prev: DoublyLinkedList<T> | null,
};

// Represents a linked map
export type LinkedMap<K, V> = {
    key: K,
    val: V,
    next: Map<K, V> | null,
};

// Represents a total map where all possible keys of type K are present and have a guaranteed value
export type TotalMap<K, V> = {
    set(key: K, value: V): TotalMap<K, V>;
    get(key: K): [V, TotalMap<K, V>];
    value(key: K): V;
}

// Represents a bijection map where any key of type K can be mapped to any value of type V
export type BijectionMap<K, V> = {
    set(key: K, value: V): TotalMap<K, V>;
    get(key: K): [V, TotalMap<K, V>];
    value(key: K): V;
    remove(key: K): TotalMap<K, V>;
}