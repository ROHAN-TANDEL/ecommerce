
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ActionMenuItem {
  key: string;
  label: string;
  icon?: string;
  children?: ActionMenuItem[];
  disabled?: boolean;
}

@Component({
  selector: 'dt-action-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div #root class="relative inline-block">
      <button
        #trigger
        type="button"
        class="inline-flex items-center gap-2 rounded-lg border
               border-slate-200 bg-white px-3 py-2 text-sm
               text-slate-700 shadow-sm hover:bg-slate-50"
        [attr.aria-expanded]="isOpen"
        (click)="toggle($event)">
        {{ triggerLabel }}
        <span>{{ isOpen ? '⌃' : '⌄' }}</span>
      </button>
    </div>

    <ng-container *ngIf="isOpen">
      <div
        class="fixed inset-0 z-[400]"
        (click)="close()">
      </div>

      <div
        #menuPanel
        class="fixed z-[401] w-[220px] max-w-[calc(100vw-16px)]
               overflow-y-auto overscroll-contain rounded-xl border
               border-slate-200 bg-white p-1.5 shadow-2xl"
        style="max-height: calc(100vh - 16px)"
        [style.top.px]="menuTop"
        [style.left.px]="menuLeft"
        (click)="$event.stopPropagation()">

        <ng-container *ngFor="let item of items">
          <div class="relative">
            <button
              type="button"
              class="flex w-full items-center gap-2 rounded-md
                     px-2.5 py-2 text-left text-sm text-slate-700
                     hover:bg-blue-50 hover:text-[#436CF3]
                     disabled:cursor-not-allowed disabled:opacity-40"
              [disabled]="item.disabled"
              (click)="item.children?.length
                ? toggleSubmenu(item.key, $event)
                : selectItem(item, $event)">

              <span *ngIf="item.icon">{{ item.icon }}</span>
              <span class="flex-1">{{ item.label }}</span>
              <span *ngIf="item.children?.length">‹</span>
            </button>

            <div
              *ngIf="activeSubmenu === item.key"
              #submenuPanel
              class="fixed z-[402] w-[210px] max-w-[calc(100vw-16px)]
                     overflow-y-auto overscroll-contain rounded-xl border
                     border-slate-200 bg-white p-1.5 shadow-2xl"
              style="max-height: calc(100vh - 16px)"
              [style.top.px]="submenuTop"
              [style.left.px]="submenuLeft"
              (click)="$event.stopPropagation()">

              <button
                *ngFor="let child of item.children"
                type="button"
                class="flex w-full items-center gap-2 rounded-md
                       px-2.5 py-2 text-left text-sm text-slate-700
                       hover:bg-blue-50 hover:text-[#436CF3]
                       disabled:opacity-40"
                [disabled]="child.disabled"
                (click)="selectItem(child, $event)">
                <span *ngIf="child.icon">{{ child.icon }}</span>
                <span>{{ child.label }}</span>
              </button>
            </div>
          </div>
        </ng-container>
      </div>
    </ng-container>
  `,
})
export class ActionMenuComponent implements OnDestroy {
  @Input() triggerLabel = 'Demo menu';
  @Input() items: ActionMenuItem[] = [];

  @Output() itemSelected = new EventEmitter<ActionMenuItem>();

  @ViewChild('trigger') trigger?: ElementRef<HTMLButtonElement>;
  @ViewChild('menuPanel') menuPanel?: ElementRef<HTMLDivElement>;
  @ViewChild('submenuPanel') submenuPanel?: ElementRef<HTMLDivElement>;

  isOpen = false;
  activeSubmenu: string | null = null;

  menuTop = 0;
  menuLeft = 0;
  submenuTop = 0;
  submenuLeft = 0;

  private activeRow: HTMLElement | null = null;
  private repositionHandler = () => this.positionMenu();

  toggle(event: MouseEvent): void {
    event.stopPropagation();

    if (this.isOpen) {
      this.close();
      return;
    }

    this.isOpen = true;
    this.activeSubmenu = null;

    // Wait until Angular renders the menu before measuring it.
    requestAnimationFrame(() => this.positionMenu());
    window.addEventListener('resize', this.repositionHandler);
    window.addEventListener('scroll', this.repositionHandler, true);
  }

  toggleSubmenu(key: string, event: MouseEvent): void {
    event.stopPropagation();

    if (this.activeSubmenu === key) {
      this.activeSubmenu = null;
      this.activeRow = null;
      return;
    }

    this.activeSubmenu = key;
    this.activeRow = event.currentTarget as HTMLElement;

    requestAnimationFrame(() => this.positionSubmenu());
  }

  selectItem(item: ActionMenuItem, event: MouseEvent): void {
    event.stopPropagation();
    this.itemSelected.emit(item);
    this.close();
  }

  close(): void {
    this.isOpen = false;
    this.activeSubmenu = null;
    this.activeRow = null;

    window.removeEventListener('resize', this.repositionHandler);
    window.removeEventListener('scroll', this.repositionHandler, true);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as Node | null;
    if (target && this.trigger?.nativeElement.contains(target)) return;
    // Clicks inside the fixed menu stop propagation in the template.
    this.close();
  }

  ngOnDestroy(): void {
    this.close();
  }

  private positionMenu(): void {
    const trigger = this.trigger?.nativeElement;
    const panel = this.menuPanel?.nativeElement;
    if (!trigger || !panel || !this.isOpen) return;

    const rect = trigger.getBoundingClientRect();
    const margin = 8;
    const gap = 6;
    const menuWidth = Math.min(220, window.innerWidth - margin * 2);
    const menuHeight = Math.min(panel.scrollHeight, window.innerHeight - margin * 2);

    const spaceBelow = window.innerHeight - rect.bottom - gap - margin;
    const spaceAbove = rect.top - gap - margin;
    const openAbove = spaceBelow < Math.min(panel.scrollHeight, 240)
      && spaceAbove > spaceBelow;

    this.menuTop = openAbove
      ? Math.max(margin, rect.top - menuHeight - gap)
      : Math.max(margin, Math.min(rect.bottom + gap, window.innerHeight - menuHeight - margin));

    this.menuLeft = Math.max(
      margin,
      Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - margin),
    );

    this.positionSubmenu();
  }

  private positionSubmenu(): void {
    if (!this.activeRow || !this.isOpen) return;

    const rect = this.activeRow.getBoundingClientRect();
    const panel = this.submenuPanel?.nativeElement;
    const margin = 8;
    const gap = 4;
    const submenuWidth = Math.min(210, window.innerWidth - margin * 2);
    const submenuHeight = Math.min(
      panel?.scrollHeight ?? 240,
      window.innerHeight - margin * 2,
    );

    const spaceRight = window.innerWidth - rect.right - gap - margin;
    const spaceLeft = rect.left - gap - margin;
    const openLeft = spaceRight < submenuWidth && spaceLeft > spaceRight;

    this.submenuLeft = openLeft
      ? Math.max(margin, rect.left - submenuWidth - gap)
      : Math.max(margin, Math.min(rect.right + gap, window.innerWidth - submenuWidth - margin));

    this.submenuTop = Math.max(
      margin,
      Math.min(rect.top, window.innerHeight - submenuHeight - margin),
    );
  }
}
