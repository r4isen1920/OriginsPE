//#region BARREL

/**
 * Public surface of the platform layer: the generic, game-agnostic primitives
 * that every other layer builds on -- event subscription, scheduling, the
 * registry container, and per-player state.
 */

export * from './DecoratedEvents';
export * from './Ticker';
export * from './PlayerState';
export * from './Registry';
