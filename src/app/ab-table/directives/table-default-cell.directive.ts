import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[appTableDefaultCell]',
  standalone: true
})
export class TableDefaultCellDirective {
  constructor(public templateRef: TemplateRef<any>) {}
} 