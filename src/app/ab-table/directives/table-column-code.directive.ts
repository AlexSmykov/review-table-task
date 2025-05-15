import { ContentChild, Directive, Input } from '@angular/core';
import { CellDataDirective } from './cell-data.directive';
import { HeaderDataDirective } from './header-data.directive';

@Directive({
  selector: '[appTableColumnCode]',
  standalone: true
})
export class TableColumnCodeDirective {
  @Input('appTableColumnCode') columnCode!: string;
  
  @ContentChild(HeaderDataDirective) headerTemplate?: HeaderDataDirective;
  @ContentChild(CellDataDirective) cellTemplate?: CellDataDirective;
} 