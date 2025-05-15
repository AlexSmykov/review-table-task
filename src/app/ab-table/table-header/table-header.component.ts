import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-table-header',
  template: '<ng-content></ng-content>',
  styles: [':host { display: block; }'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableHeaderComponent {
  @Input() data: any;
} 