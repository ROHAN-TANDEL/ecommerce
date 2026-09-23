/**
 * row/  —  ROW level
 *
 * One component per row visual state.
 * The table orchestrator selects exactly one per data row
 * based on this priority chain (strongest constraint first):
 *
 *   DisabledRow    row.disabled = true
 *       ↓
 *   UnavailableRow row.rowState = 'error' | 'warning'
 *       ↓
 *   EditableRow    editingRows.includes(row.id)  ← col.editable gates each cell
 *       ↓
 *   ReadonlyRow    default
 *
 *   dt-row-editable    EditableRow    editable.ts
 *   dt-row-readonly    ReadonlyRow    readonly.ts
 *   dt-row-disabled    DisabledRow    disabled.ts
 *   dt-row-unavailable UnavailableRow unavailable.ts
 */
export { EditableRow }   from './editable';
export { ReadonlyRow }   from './readonly';
export { DisabledRow }   from './disabled';
export { UnavailableRow } from './unavailable';
