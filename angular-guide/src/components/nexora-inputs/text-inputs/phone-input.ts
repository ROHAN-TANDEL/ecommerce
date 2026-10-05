import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, HostListener, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface CountryCode {
  flag: string;
  code: string;
  name: string;
}

@Component({
  selector: 'nexora-phone-input',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <div class="flex flex-col gap-1 w-full">
      <label *ngIf="label" class="text-xs font-semibold text-[#344054]">{{ label }}</label>
      <div class="flex items-center w-full rounded-lg border border-[#D0D5DD] bg-white transition focus-within:border-[#436CF3] focus-within:ring-2 focus-within:ring-blue-100 relative">
        <!-- Country Selector -->
        <button
          type="button"
          (click)="isOpen = !isOpen"
          class="inline-flex items-center gap-1 bg-[#F9FAFB] border-r border-[#D0D5DD] px-2 h-9 text-xs text-[#344054] hover:bg-slate-100 rounded-l-lg transition-colors shrink-0">
          <span>{{ selectedCountry.flag }}</span>
          <span class="font-medium text-[11px]">{{ selectedCountry.code }}</span>
          <span class="text-[9px] text-[#98A2B3]">⌄</span>
        </button>

        <!-- Dropdown menu -->
        <div *ngIf="isOpen"
             class="absolute left-0 top-full mt-1 z-50 w-48 rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
          <button
            *ngFor="let c of countries"
            type="button"
            (click)="selectCountry(c)"
            class="flex items-center gap-2 w-full px-2.5 py-1.5 text-xs text-left rounded-md hover:bg-blue-50 hover:text-[#436CF3] transition-colors">
            <span>{{ c.flag }}</span>
            <span class="font-medium">{{ c.code }}</span>
            <span class="text-[#667085] text-[10px] truncate">{{ c.name }}</span>
          </button>
        </div>

        <input
          type="tel"
          [value]="phoneNumber"
          (input)="onPhoneInput($event)"
          [placeholder]="placeholder"
          [disabled]="disabled"
          class="h-9 flex-1 bg-white px-2.5 text-xs text-[#101828] outline-none placeholder:text-[#98A2B3] disabled:bg-[#F2F4F7]"
        />
      </div>
      <span *ngIf="helper" class="text-[10px] text-[#667085]">{{ helper }}</span>
    </div>
  `
})
export class NexoraPhoneInputComponent {
  @Input() label: string = 'Phone number';
  @Input() badge: string = '';
  @Input() placeholder: string = '98765 43210';
  @Input() helper: string = 'Enter 10 digit mobile number';
  @Input() hint: string = '';
  @Input() phoneNumber: string = '98765 43210';
  @Input() set phone(v: string) { if (v) this.phoneNumber = v; }
  get phone(): string { return this.phoneNumber; }
  @Input() set countryCode(c: string) {
    if (c) {
      const match = this.countries.find(item => item.code === c);
      if (match) this.selectedCountry = match;
    }
  }
  get countryCode(): string { return this.selectedCountry.code; }
  @Input() disabled: boolean = false;
  @Output() phoneChange = new EventEmitter<string>();
  @Output() countryCodeChange = new EventEmitter<string>();

  isOpen = false;

  countries: CountryCode[] = [
    { flag: '🇮🇳', code: '+91', name: 'India' },
    { flag: '🇺🇸', code: '+1',  name: 'United States' },
    { flag: '🇬🇧', code: '+44', name: 'United Kingdom' },
    { flag: '🇩🇪', code: '+49', name: 'Germany' },
    { flag: '🇦🇺', code: '+61', name: 'Australia' },
  ];

  selectedCountry: CountryCode = this.countries[0];

  constructor(private readonly elRef: ElementRef<HTMLElement>, private readonly cdr: ChangeDetectorRef) {}

  selectCountry(c: CountryCode): void {
    this.selectedCountry = c;
    this.isOpen = false;
    this.countryCodeChange.emit(this.selectedCountry.code);
    this.emitChange();
    this.cdr.markForCheck();
  }

  onPhoneInput(e: Event): void {
    this.phoneNumber = (e.target as HTMLInputElement).value;
    this.phoneChange.emit(this.phoneNumber);
    this.emitChange();
  }

  private emitChange(): void {
    // Also trigger any generic notification if needed
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent): void {
    if (this.isOpen && !this.elRef.nativeElement.contains(e.target as Node)) {
      this.isOpen = false;
      this.cdr.markForCheck();
    }
  }
}

export { NexoraPhoneInputComponent as NexoraPhoneInput };

