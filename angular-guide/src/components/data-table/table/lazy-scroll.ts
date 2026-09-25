import {
  Directive, Input, Output, EventEmitter,
  HostListener, ElementRef, OnDestroy, NgZone
} from '@angular/core';

/**
 * LazyScroll — fires `loadMore` when the host scrollable container nears its bottom.
 *
 * TABLE level · Property: pagination (virtual/lazy mode)
 *
 * Rules:
 *   • Horizontal scrolling must preserve column/header alignment.
 *   • Loading presentation replaces or overlays the normal body presentation.
 * Constraints:
 *   • Sticky headers must remain aligned with body columns during scroll.
 *   • Fullscreen must not change column meaning/order.
 *
 * Usage:
 *   <div dtLazyScroll [threshold]="200" (loadMore)="onLoadMore()">
 *     <table>…</table>
 *   </div>
 * The host element must have overflow-y: auto / scroll set externally.
 */
@Directive({
  selector: '[dtLazyScroll]',
  standalone: true,
})
export class LazyScroll implements OnDestroy {
  @Input() threshold: number = 200;
  @Input() loading: boolean = false;

  @Output() loadMore = new EventEmitter<void>();

  private ticking = false;

  constructor(private el: ElementRef<HTMLElement>, private zone: NgZone) {}

  @HostListener('scroll')
  onScroll(): void {
    if (this.loading || this.ticking) return;
    this.ticking = true;
    requestAnimationFrame(() => {
      this.ticking = false;
      const el = this.el.nativeElement;
      if (el.scrollHeight - el.scrollTop - el.clientHeight <= this.threshold) {
        this.zone.run(() => this.loadMore.emit());
      }
    });
  }

  ngOnDestroy(): void { this.ticking = false; }
}
