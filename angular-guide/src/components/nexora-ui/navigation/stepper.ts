import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface StepItem {
  id: string | number;
  label: string;
  description?: string;
}

@Component({
  selector: 'nexora-stepper',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full py-2">
      <ol class="flex items-center w-full">
        <li
          *ngFor="let step of steps; let i = index; let last = last"
          class="flex items-center"
          [class.flex-1]="!last"
        >
          <div class="flex items-center gap-2 cursor-pointer select-none" (click)="goToStep(i + 1)">
            <!-- Circle indicator -->
            <div
              class="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all shrink-0"
              [class.bg-[#436CF3]]="currentStep === i + 1"
              [class.text-white]="currentStep === i + 1"
              [class.ring-4]="currentStep === i + 1"
              [class.ring-[#EFF4FF]]="currentStep === i + 1"
              [class.bg-[#12B76A]]="currentStep > i + 1"
              [class.text-white]="currentStep > i + 1"
              [class.bg-[#F2F4F7]]="currentStep < i + 1"
              [class.text-[#667085]]="currentStep < i + 1"
            >
              <!-- Completed checkmark -->
              <svg *ngIf="currentStep > i + 1" class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
              </svg>
              <!-- Step index -->
              <span *ngIf="currentStep <= i + 1">{{ i + 1 }}</span>
            </div>

            <!-- Labels -->
            <div class="flex flex-col text-left">
              <span
                class="text-xs font-semibold"
                [class.text-[#436CF3]]="currentStep === i + 1"
                [class.text-[#101828]]="currentStep > i + 1"
                [class.text-[#667085]]="currentStep < i + 1"
              >
                {{ step.label }}
              </span>
              <span *ngIf="step.description" class="text-[10px] text-[#98A2B3]">{{ step.description }}</span>
            </div>
          </div>

          <!-- Connecting line -->
          <div
            *ngIf="!last"
            class="flex-1 h-0.5 mx-3 transition-colors"
            [class.bg-[#12B76A]]="currentStep > i + 1"
            [class.bg-[#EAECF0]]="currentStep <= i + 1"
          ></div>
        </li>
      </ol>
    </div>
  `
})
export class NexoraStepperComponent {
  @Input() steps: StepItem[] = [];
  @Input() currentStep = 1;

  @Output() currentStepChange = new EventEmitter<number>();

  goToStep(s: number): void {
    this.currentStep = s;
    this.currentStepChange.emit(this.currentStep);
  }
}
