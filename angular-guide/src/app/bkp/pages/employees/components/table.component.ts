import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'table-component',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="border border-slate-200/90 rounded-xl overflow-hidden bg-white shadow-[0_1px_3px_rgba(0,0,0,0.03)] relative">

      <!-- Loading overlay indicator -->
      <div *ngIf="isLoading" class="absolute inset-0 bg-white/70 backdrop-blur-[2px] z-30 flex items-center justify-center">
        <div class="flex items-center gap-2 px-4 py-2 bg-slate-900/95 text-white rounded-lg shadow-lg text-xs font-medium">
          <span class="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
          <span>Loading data...</span>
        </div>
      </div>

      <!-- Viewport Scroll Container with min/max height -->
      <div
        #viewport
        (scroll)="onViewportScroll()"
        class="overflow-auto relative scroll-smooth"
        [style.min-height]="minHeight"
        [style.max-height]="maxHeight"
      >
        <table class="w-full text-left border-collapse table-fixed">
          <ng-content></ng-content>
        </table>
      </div>

    </div>
  `,
})
export class TableComponent implements AfterViewInit, OnDestroy {
  @Input() isLoading = false;
  @Input() minHeight = '380px';
  @Input() maxHeight = 'calc(100vh - 240px)';

  @Output() scrollProgress = new EventEmitter<number>();
  @Output() scrollableChange = new EventEmitter<boolean>();

  @ViewChild('viewport', { static: false }) viewportRef?: ElementRef<HTMLDivElement>;

  currentPercentage = 0;
  isScrollable = false;
  private resizeObserver?: ResizeObserver;

  ngAfterViewInit(): void {
    if (this.viewportRef?.nativeElement && typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.checkScrollability();
      });
      this.resizeObserver.observe(this.viewportRef.nativeElement);
    }
    setTimeout(() => this.checkScrollability(), 50);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.checkScrollability();
  }

  onViewportScroll(): void {
    this.checkScrollability();
  }

  checkScrollability(): void {
    if (!this.viewportRef?.nativeElement) return;
    const el = this.viewportRef.nativeElement;
    const canScroll = el.scrollWidth > el.clientWidth + 2;

    if (this.isScrollable !== canScroll) {
      this.isScrollable = canScroll;
      this.scrollableChange.emit(canScroll);
    }

    const maxScroll = el.scrollWidth - el.clientWidth;
    if (maxScroll <= 0) {
      this.currentPercentage = 0;
      this.scrollProgress.emit(0);
      return;
    }
    const pct = Math.round((el.scrollLeft / maxScroll) * 100);
    this.currentPercentage = Math.min(100, Math.max(0, pct));
    this.scrollProgress.emit(this.currentPercentage);
  }

  scrollTo(direction: 'left' | 'right' | 'start' | 'end'): void {
    if (!this.viewportRef?.nativeElement) return;
    const el = this.viewportRef.nativeElement;
    if (direction === 'start') {
      el.scrollTo({ left: 0, behavior: 'smooth' });
    } else if (direction === 'end') {
      el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
    } else if (direction === 'left') {
      el.scrollBy({ left: -260, behavior: 'smooth' });
    } else if (direction === 'right') {
      el.scrollBy({ left: 260, behavior: 'smooth' });
    }
    setTimeout(() => this.checkScrollability(), 200);
  }
}


