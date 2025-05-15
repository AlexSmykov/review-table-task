import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: '[appCellData]',
  standalone: true
})
export class CellDataDirective {
  @Input('appCellData') data: any;

  constructor(public templateRef: TemplateRef<any>) {}
} 