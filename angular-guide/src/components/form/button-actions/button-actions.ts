import { Component } from '@angular/core';


export type NexoraActionStatus =
  | 'idle'
  | 'loading'
  | 'success'
  | 'error';


@Component({
  selector: 'app-button-actions',
  imports: [],
  templateUrl: './button-actions.html',
  styleUrl: './button-actions.css',
})
export class ButtonActions {
  status: NexoraActionStatus  = 'idle';
  error?: string;
}

export type NexoraActionMap = Record<string, NexoraActionStatus>;
