import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: '[appHeaderData]',
  standalone: true
})
export class HeaderDataDirective {
  @Input('appHeaderData') data: any;

  constructor(public templateRef: TemplateRef<any>) {}
} 