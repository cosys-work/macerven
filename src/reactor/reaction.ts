/**
 * A tuple representing position in a 1D or 2D or 3D space
*/
export type Position  = [number, number, number] & { __brand: 'position' } ;

/**
 * A tuple representing orientation in a 1D or 2D or 3D space
*/
export type Orientation = [number, number, number] & { __brand: 'orientation' };

/**
 * A tuple representing configuration in a 1D or 2D or 3D space
*/
export type Configuration = [number, number, number] & { __brand: 'configuration' };

/**
 * A tuple representing position, orientation and configuration states in a 1D or 2D or 3D space
*/
export type State = [Position, Orientation, Configuration] & { __brand: 'state' };

/**
 * A  function calculating a state change in a 1D or 2D or 3D space
*/
export type ActionState = (s: State) => State;

/**
 * A functor calculating a state change in a 1D or 2D or 3D space, given an initial state
*/
export type ReactionState = (s: State, a: ActionState) => State;

/**
 * A  function calculating an event message 
*/
export type ActionEvent = <T>(e: Event) => T;

/**
 * A functor calculating an event message, given an initial event
*/
export type ReactionEvent = <T>(e: Event, a: ActionEvent) => T;

/**
 * A tuple representing an event causing action 
*/
export type Action = [ActionState, ActionEvent] & { __brand: 'action' };

/**
 *  A tuple representing an event caused reaction
*/
export type Reaction = [ReactionState, ReactionEvent] & { __brand: 'reaction' };