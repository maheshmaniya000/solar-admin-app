import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'sg-admin-export-table-data',
  templateUrl: './export-table-data.component.html'
})
export class ExportTableDataComponent {
  @Output() exportData = new EventEmitter<void>();
}
