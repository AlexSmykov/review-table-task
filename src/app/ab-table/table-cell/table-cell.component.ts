import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-table-cell',
  template: '<ng-content></ng-content>',
  styles: [':host { display: block; }'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableCellComponent {
  @Input() data: any;
} 