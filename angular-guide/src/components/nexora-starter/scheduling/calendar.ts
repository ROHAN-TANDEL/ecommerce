import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface CalendarDay {
  date: Date;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  hasEvents?: boolean;
}

@Component({
  selector: 'nexora-calendar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4 rounded-2xl border border-[#EAECF0] bg-white shadow-xs select-none">
      <!-- Calendar Header -->
      <div class="flex items-center justify-between mb-4">
        <div>
          <h4 class="text-sm font-bold text-[#101828]">{{ monthNames[currentMonth] }} {{ currentYear }}</h4>
          <span class="text-[10px] text-[#667085]">Scheduled sprint & deployments</span>
        </div>
        <div class="flex items-center gap-1">
          <button
            type="button"
            (click)="prevMonth()"
            class="w-7 h-7 rounded-lg border border-[#D0D5DD] hover:bg-[#F9FAFB] flex items-center justify-center text-[#667085] cursor-pointer"
          >
            &larr;
          </button>
          <button
            type="button"
            (click)="setToday()"
            class="h-7 px-2 rounded-lg border border-[#D0D5DD] hover:bg-[#F9FAFB] text-[11px] font-semibold text-[#344054] cursor-pointer"
          >
            Today
          </button>
          <button
            type="button"
            (click)="nextMonth()"
            class="w-7 h-7 rounded-lg border border-[#D0D5DD] hover:bg-[#F9FAFB] flex items-center justify-center text-[#667085] cursor-pointer"
          >
            &rarr;
          </button>
        </div>
      </div>

      <!-- Days of Week -->
      <div class="grid grid-cols-7 gap-1 text-center text-[11px] font-semibold text-[#667085] mb-2">
        <div *ngFor="let day of ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']">{{ day }}</div>
      </div>

      <!-- Dates Grid -->
      <div class="grid grid-cols-7 gap-1 text-center">
        <button
          *ngFor="let d of daysInView"
          type="button"
          (click)="selectDate(d)"
          class="h-9 rounded-lg text-xs font-medium transition-all relative flex flex-col items-center justify-center cursor-pointer"
          [class.text-[#98A2B3]]="!d.isCurrentMonth"
          [class.text-[#1D2939]]="d.isCurrentMonth && !d.isSelected"
          [class.bg-[#EFF4FF]]="d.isToday && !d.isSelected"
          [class.text-[#436CF3]]="d.isToday && !d.isSelected"
          [class.bg-[#436CF3]]="d.isSelected"
          [class.text-white]="d.isSelected"
          [class.font-bold]="d.isToday || d.isSelected"
          [class.hover:bg-[#F2F4F7]]="!d.isSelected"
        >
          <span>{{ d.dayNumber }}</span>
          <span
            *ngIf="d.hasEvents"
            class="w-1 h-1 rounded-full mt-0.5"
            [class.bg-white]="d.isSelected"
            [class.bg-[#436CF3]]="!d.isSelected"
          ></span>
        </button>
      </div>
    </div>
  `
})
export class NexoraCalendarComponent {
  @Input() selectedDate: Date = new Date();
  @Output() selectedDateChange = new EventEmitter<Date>();
  @Output() dateSelect = new EventEmitter<Date>();

  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth();

  monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  get daysInView(): CalendarDay[] {
    const list: CalendarDay[] = [];
    const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
    const totalDays = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();
    const prevMonthDays = new Date(this.currentYear, this.currentMonth, 0).getDate();

    // Previous month filler
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = new Date(this.currentYear, this.currentMonth - 1, prevMonthDays - i);
      list.push({
        date: d,
        dayNumber: prevMonthDays - i,
        isCurrentMonth: false,
        isToday: false,
        isSelected: false
      });
    }

    const today = new Date();

    // Current month days
    for (let day = 1; day <= totalDays; day++) {
      const d = new Date(this.currentYear, this.currentMonth, day);
      const isToday =
        today.getFullYear() === this.currentYear &&
        today.getMonth() === this.currentMonth &&
        today.getDate() === day;
      const isSelected =
        this.selectedDate &&
        this.selectedDate.getFullYear() === this.currentYear &&
        this.selectedDate.getMonth() === this.currentMonth &&
        this.selectedDate.getDate() === day;

      list.push({
        date: d,
        dayNumber: day,
        isCurrentMonth: true,
        isToday,
        isSelected: !!isSelected,
        hasEvents: day % 4 === 0
      });
    }

    // Next month filler up to 35 or 42 cells
    const remaining = 35 - list.length;
    if (remaining > 0) {
      for (let day = 1; day <= remaining; day++) {
        const d = new Date(this.currentYear, this.currentMonth + 1, day);
        list.push({
          date: d,
          dayNumber: day,
          isCurrentMonth: false,
          isToday: false,
          isSelected: false
        });
      }
    }

    return list;
  }

  prevMonth(): void {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
  }

  nextMonth(): void {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
  }

  setToday(): void {
    const now = new Date();
    this.currentYear = now.getFullYear();
    this.currentMonth = now.getMonth();
    this.selectDate({
      date: now,
      dayNumber: now.getDate(),
      isCurrentMonth: true,
      isToday: true,
      isSelected: true
    });
  }

  selectDate(d: CalendarDay): void {
    this.selectedDate = d.date;
    this.selectedDateChange.emit(this.selectedDate);
    this.dateSelect.emit(this.selectedDate);
  }
}

@Component({
  selector: 'nexora-mini-calendar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-2.5 rounded-xl border border-[#EAECF0] bg-white shadow-xs w-56 text-[11px] select-none">
      <div class="flex items-center justify-between mb-2">
        <span class="font-bold text-[#101828]">{{ monthName }} {{ year }}</span>
        <span class="text-[9px] text-[#436CF3] font-semibold bg-[#EFF4FF] px-1.5 py-0.5 rounded">Mini</span>
      </div>
      <div class="grid grid-cols-7 gap-1 text-center font-semibold text-[#667085] mb-1 text-[9px]">
        <div>S</div><div>M</div><div>T</div><div>W</div><div>T</div><div>F</div><div>S</div>
      </div>
      <div class="grid grid-cols-7 gap-1 text-center">
        <button
          *ngFor="let d of sampleDays"
          type="button"
          (click)="onSelectDay(d)"
          class="h-6 flex items-center justify-center rounded cursor-pointer transition-colors"
          [class.bg-[#436CF3]]="isDaySelected(d)"
          [class.text-white]="isDaySelected(d)"
          [class.font-bold]="isDaySelected(d)"
          [class.hover:bg-[#F2F4F7]]="!isDaySelected(d)"
        >
          {{ d }}
        </button>
      </div>
    </div>
  `
})
export class NexoraMiniCalendarComponent {
  @Input() selectedDate: Date = new Date();
  @Output() selectedDateChange = new EventEmitter<Date>();
  @Output() dateSelect = new EventEmitter<Date>();

  monthName = 'October';
  year = 2026;
  sampleDays = Array.from({ length: 31 }, (_, i) => i + 1);

  isDaySelected(d: number): boolean {
    if (!this.selectedDate) return false;
    return this.selectedDate.getDate() === d;
  }

  onSelectDay(day: number): void {
    const newDate = new Date(this.year, 9, day); // October (month 9)
    this.selectedDate = newDate;
    this.selectedDateChange.emit(this.selectedDate);
    this.dateSelect.emit(this.selectedDate);
  }
}
