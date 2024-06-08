export type Position  = [number, number, number] & { __brand: 'position' } ;
export type Orientation = [number, number, number] & { __brand: 'orientation' };
export type Configuration = [number, number, number] & { __brand: 'configuration' };
export type State = [Position, Orientation, Configuration] & { __brand: 'state' };

export type ActionState = (s: State) => State;
export type ReactionState = (s: State, a: ActionState) => State;

export type ActionEvent = <T>(e: Event) => T;
export type ReactionEvent = <T>(e: Event, a: ActionEvent) => T;

export type Action = [ActionState, ActionEvent] & { __brand: 'action' };
export type Reaction = [ReactionState, ReactionEvent] & { __brand: 'reaction' };