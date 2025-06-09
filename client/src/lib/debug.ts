// Debug configuration
export const IS_DEBUG = true; // Set to false to hide debug panels in production

export interface DebugState {
  autoTurn: boolean;
}

export const initialDebugState: DebugState = {
  autoTurn: true
};