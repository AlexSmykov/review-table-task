import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[appTableDefaultHeader]',
  standalone: true
})
export class TableDefaultHeaderDirective {
  constructor(public templateRef: TemplateRef<any>) {}
} 