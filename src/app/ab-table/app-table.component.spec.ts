import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbTableComponent } from './app-table.component';

describe('AbTableComponent', () => {
  let component: AbTableComponent;
  let fixture: ComponentFixture<AbTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AbTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AbTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
