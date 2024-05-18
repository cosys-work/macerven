export type MultiDimArray<T> = T[] | MultiDimArray<T>[];

export type Json = string | number | null | Json[] | { [k: string]: Json };

export type Tree<T> = {
    val: T,
    left: Tree<T> | null,
    right: Tree<T> | null,
    parent: Tree<T> | null,
};

export type BinaryTree<T> = {
    val: T,
    left: BinaryTree<T> | null,
    right: BinaryTree<T> | null,
};

export type Graph<T> = {
    val: T,
    edges: Graph<T>[],
};

export type PriorityQueue<T> = {
    val: T,
    priority: number,
    next: PriorityQueue<T> | null,
};

export type LinkedList<T> = {
    val: T,
    next: LinkedList<T> | null,
};

export type DoublyLinkedList<T> = {
    val: T,
    next: DoublyLinkedList<T> | null,
    prev: DoublyLinkedList<T> | null,
};


export type Map<K, V> = {
    key: K,
    val: V,
    next: Map<K, V> | null,
};
