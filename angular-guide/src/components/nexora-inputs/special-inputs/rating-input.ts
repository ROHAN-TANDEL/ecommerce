import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'nexora-rating-input',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col gap-1 w-full">
      <div class="flex items-center justify-between">
        <label *ngIf="label" class="text-xs font-semibold text-[#344054]">
          {{ label }}
          <span *ngIf="required" class="text-[#EF4444] ml-0.5">*</span>
        </label>
        <span *ngIf="badge" class="text-[10px] font-medium text-[#436CF3] bg-[#EFF4FF] px-1.5 py-0.5 rounded">
          {{ badge }}
        </span>
      </div>

      <div class="flex items-center gap-1.5 py-1">
        <div class="flex items-center gap-1">
          <button
            *ngFor="let star of stars"
            type="button"
            (mouseenter)="hoverRating = star"
            (mouseleave)="hoverRating = 0"
            (click)="setRating(star)"
            [disabled]="disabled"
            class="text-[#D0D5DD] hover:scale-110 transition-transform focus:outline-none cursor-pointer disabled:cursor-not-allowed"
          >
            <svg
              class="w-5 h-5 transition-colors"
              [class.text-[#F59E0B]]="(hoverRating || rating) >= star"
              [class.fill-[#F59E0B]]="(hoverRating || rating) >= star"
              [class.text-[#D0D5DD]]="(hoverRating || rating) < star"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path fill-rule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>

        <span class="text-xs font-semibold text-[#344054] ml-1.5">
          {{ rating }} / {{ maxStars }}
        </span>
      </div>

      <span *ngIf="hint" class="text-[10px] text-[#667085]">{{ hint }}</span>
    </div>
  `
})
export class NexoraRatingInputComponent {
  @Input() label = '';
  @Input() badge = '';
  @Input() hint = '';
  @Input() required = false;
  @Input() disabled = false;
  @Input() maxStars = 5;
  @Input() rating = 4;

  @Output() ratingChange = new EventEmitter<number>();

  hoverRating = 0;

  get stars(): number[] {
    return Array.from({ length: this.maxStars }, (_, i) => i + 1);
  }

  setRating(val: number) {
    if (this.disabled) return;
    this.rating = val;
    this.ratingChange.emit(this.rating);
  }
}
