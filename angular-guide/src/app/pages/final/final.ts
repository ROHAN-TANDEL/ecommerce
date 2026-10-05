import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HorizontalSection } from '../../../components/layouts/horizontal-section/horizontal-section';
import { VerticalSection } from '../../../components/layouts/vertical-section/vertical-section';
import {
  AutoRefreshComponent,
  LockUpdateComponent,
  DensityComponent,
  ExportActionComponent,
  DownloadActionComponent,
  ColumnsManagerComponent,
  ColumnNavComponent,
  ViewsManagerComponent,
  FullscreenToggleComponent,
  CollapseToggleComponent,
  CollabToggleComponent,
  ActionButtonComponent,
} from '../../../components/data-table/table';
import type { TableDensity } from '../../../components/data-table/table/density';
import type { ExportFormat } from '../../../components/data-table/table/export-action';
import type { DownloadFormat } from '../../../components/data-table/table/download-action';

@Component({
  selector: 'app-final',
  standalone: true,
  imports: [
    CommonModule,
    HorizontalSection,
    VerticalSection,
    AutoRefreshComponent,
    LockUpdateComponent,
    DensityComponent,
    ExportActionComponent,
    DownloadActionComponent,
    ColumnsManagerComponent,
    ColumnNavComponent,
    ViewsManagerComponent,
    FullscreenToggleComponent,
    CollapseToggleComponent,
    CollabToggleComponent,
    ActionButtonComponent
  ],
  templateUrl: './final.html',
  styleUrl: './final.css'
})
export class Final {
  // State for all action widgets
  refreshCount = 0;
  isLocked = false;
  density: TableDensity = 'comfortable';
  lastExported = '';
  lastDownloaded = '';
  activeView = 'Default';
  isFullscreen = false;
  isCollapsed = false;
  isCollabActive = true;
  columnScrollIndex = 1;
  lastActionMessage = '';

  onRefresh(): void {
    this.refreshCount++;
    this.lastActionMessage = `Refreshed (${this.refreshCount})`;
  }

  onLock(locked: boolean): void {
    this.isLocked = locked;
    this.lastActionMessage = locked ? 'Table locked for editing' : 'Table unlocked';
  }

  onDensityChange(d: TableDensity): void {
    this.density = d;
    this.lastActionMessage = `Density set to: ${d}`;
  }

  onExport(fmt: ExportFormat): void {
    this.lastExported = fmt;
    this.lastActionMessage = `Exported as ${fmt.toUpperCase()}`;
  }

  onDownload(fmt: DownloadFormat): void {
    this.lastDownloaded = fmt;
    this.lastActionMessage = `Downloaded as ${fmt.toUpperCase()}`;
  }

  onColumnsChange(visibility: Record<string, boolean>): void {
    const visibleCount = Object.values(visibility).filter(Boolean).length;
    this.lastActionMessage = `Columns updated: ${visibleCount} visible`;
  }

  onColumnNav(dir: 'prev' | 'next'): void {
    if (dir === 'prev' && this.columnScrollIndex > 1) this.columnScrollIndex--;
    if (dir === 'next' && this.columnScrollIndex < 5) this.columnScrollIndex++;
    this.lastActionMessage = `Scrolled columns to page ${this.columnScrollIndex}`;
  }

  onViewChange(view: string): void {
    this.activeView = view || 'Default';
    this.lastActionMessage = `Switched to view: ${this.activeView}`;
  }

  onSaveView(): void {
    this.lastActionMessage = 'Saved current view layout';
  }

  onResetView(): void {
    this.activeView = 'Default';
    this.lastActionMessage = 'Reset view to default';
  }

  onActionClick(actionName: string): void {
    this.lastActionMessage = `Triggered: ${actionName}`;
  }
}
