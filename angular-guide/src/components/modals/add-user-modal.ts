import {
  Component, Output, EventEmitter,
  ChangeDetectionStrategy, HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface AddUserPayload {
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  status: 'active' | 'inactive' | 'pending';
}

interface FieldError { [key: string]: string }

/**
 * AddUserModal — slide-in panel for creating a new user.
 *
 * Validates client-side (mirrors backend Zod schema) before emitting.
 * Emits:
 *   save   — AddUserPayload (valid form submitted)
 *   cancel — user closed modal without saving
 */
@Component({
  selector: 'app-add-user-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Default,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Backdrop -->
    <div class="fixed inset-0 z-[150] flex items-center justify-center bg-[#0A173D]/40 backdrop-blur-sm"
         (click)="onBackdrop($event)">

      <!-- Panel -->
      <div class="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-slate-200
                  animate-modal-in mx-4"
           (click)="$event.stopPropagation()">

        <!-- Header -->
        <div class="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 class="text-base font-semibold text-[#0A173D]">Add User</h2>
            <p class="text-xs text-slate-400 mt-0.5">Fill in the details to create a new user account.</p>
          </div>
          <button type="button"
            class="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400
                   hover:bg-slate-100 hover:text-slate-600 transition-colors"
            (click)="cancel.emit()" aria-label="Close">✕</button>
        </div>

        <!-- Form -->
        <form (ngSubmit)="submit()" #f="ngForm" novalidate class="px-6 py-5 space-y-4">

          <!-- First + Last name row -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="mb-1 block text-[11px] font-medium text-slate-600">
                First Name <span class="text-red-400">*</span>
              </label>
              <input type="text" name="first_name"
                class="field" [class.field-error]="errors['first_name']"
                placeholder="Alice"
                [(ngModel)]="form.first_name"
                (ngModelChange)="clearError('first_name')" />
              <p *ngIf="errors['first_name']" class="mt-1 text-[10px] text-red-500">
                {{ errors['first_name'] }}
              </p>
            </div>
            <div>
              <label class="mb-1 block text-[11px] font-medium text-slate-600">
                Last Name <span class="text-red-400">*</span>
              </label>
              <input type="text" name="last_name"
                class="field" [class.field-error]="errors['last_name']"
                placeholder="Johnson"
                [(ngModel)]="form.last_name"
                (ngModelChange)="clearError('last_name')" />
              <p *ngIf="errors['last_name']" class="mt-1 text-[10px] text-red-500">
                {{ errors['last_name'] }}
              </p>
            </div>
          </div>

          <!-- Email -->
          <div>
            <label class="mb-1 block text-[11px] font-medium text-slate-600">
              Email <span class="text-red-400">*</span>
            </label>
            <input type="email" name="email"
              class="field" [class.field-error]="errors['email']"
              placeholder="alice@example.com"
              [(ngModel)]="form.email"
              (ngModelChange)="clearError('email')" />
            <p *ngIf="errors['email']" class="mt-1 text-[10px] text-red-500">
              {{ errors['email'] }}
            </p>
          </div>

          <!-- Password -->
          <div>
            <label class="mb-1 block text-[11px] font-medium text-slate-600">
              Password <span class="text-red-400">*</span>
            </label>
            <div class="relative">
              <input [type]="showPassword ? 'text' : 'password'" name="password_hash"
                class="field pr-10" [class.field-error]="errors['password_hash']"
                placeholder="Min. 6 characters"
                [(ngModel)]="form.password_hash"
                (ngModelChange)="clearError('password_hash')" />
              <button type="button"
                class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-400
                       hover:text-slate-600"
                (click)="showPassword = !showPassword"
                [title]="showPassword ? 'Hide' : 'Show'">
                {{ showPassword ? '🙈' : '👁' }}
              </button>
            </div>
            <p *ngIf="errors['password_hash']" class="mt-1 text-[10px] text-red-500">
              {{ errors['password_hash'] }}
            </p>
          </div>

          <!-- Status -->
          <div>
            <label class="mb-1 block text-[11px] font-medium text-slate-600">Status</label>
            <div class="flex gap-2">
              <label *ngFor="let s of statuses"
                class="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg
                       border py-2 text-[11px] font-medium transition-colors"
                [class.border-[#436CF3]]="form.status === s.value"
                [class.bg-blue-50]="form.status === s.value"
                [class.text-[#436CF3]]="form.status === s.value"
                [class.border-slate-200]="form.status !== s.value"
                [class.text-slate-500]="form.status !== s.value">
                <input type="radio" name="status" class="sr-only"
                  [value]="s.value" [(ngModel)]="form.status" />
                <span>{{ s.dot }}</span> {{ s.label }}
              </label>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button type="button"
              class="h-9 rounded-lg border border-slate-200 bg-white px-4 text-[12px]
                     font-medium text-slate-500 hover:bg-slate-50 transition-colors"
              (click)="cancel.emit()">Cancel</button>
            <button type="submit"
              class="h-9 rounded-lg bg-[#436CF3] px-5 text-[12px] font-medium text-white
                     hover:bg-[#3557d4] transition-colors flex items-center gap-1.5"
              [disabled]="saving">
              <span *ngIf="saving" class="inline-block h-3.5 w-3.5 animate-spin rounded-full
                border-2 border-white border-t-transparent"></span>
              {{ saving ? 'Saving…' : '＋ Add User' }}
            </button>
          </div>

        </form>
      </div>
    </div>
  `,
  styles: [`
    @keyframes modal-in {
      from { opacity: 0; transform: translateY(-12px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    .animate-modal-in { animation: modal-in 200ms ease-out both; }
    .field {
      @apply h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs
             text-slate-700 outline-none transition-colors
             focus:border-[#436CF3] focus:ring-2 focus:ring-blue-100
             placeholder:text-slate-400;
    }
    .field-error { @apply border-red-300 bg-red-50/30; }
  `],
})
export class AddUserModal {
  @Output() save   = new EventEmitter<AddUserPayload>();
  @Output() cancel = new EventEmitter<void>();

  form = {
    first_name: '',
    last_name: '',
    email: '',
    password_hash: '',
    status: 'active' as 'active' | 'inactive' | 'pending',
  };

  errors: FieldError = {};
  saving = false;
  showPassword = false;

  readonly statuses = [
    { value: 'active'   as const, label: 'Active',   dot: '🟢' },
    { value: 'inactive' as const, label: 'Inactive',  dot: '⚫' },
    { value: 'pending'  as const, label: 'Pending',   dot: '🟡' },
  ];

  clearError(field: string): void {
    delete this.errors[field];
  }

  private validate(): boolean {
    this.errors = {};
    if (!this.form.first_name.trim())
      this.errors['first_name'] = 'First name is required.';
    if (!this.form.last_name.trim())
      this.errors['last_name'] = 'Last name is required.';
    if (!this.form.email.trim())
      this.errors['email'] = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.form.email))
      this.errors['email'] = 'Enter a valid email address.';
    if (!this.form.password_hash.trim())
      this.errors['password_hash'] = 'Password is required.';
    else if (this.form.password_hash.length < 6)
      this.errors['password_hash'] = 'Password must be at least 6 characters.';
    return Object.keys(this.errors).length === 0;
  }

  submit(): void {
    if (!this.validate()) return;
    this.save.emit({ ...this.form });
  }

  /** Close on backdrop click */
  onBackdrop(e: MouseEvent): void {
    if ((e.target as HTMLElement).classList.contains('fixed')) {
      this.cancel.emit();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void { this.cancel.emit(); }
}
