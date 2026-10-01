export type NexoraActionStatus =
  | 'idle'
  | 'loading'
  | 'success'
  | 'error';

export interface NexoraActionState {
  status: NexoraActionStatus;
  error?: string;
}

export type NexoraActionMap = Record<string, NexoraActionState>;
