import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiceFairnessComponent } from './fairness.component';

describe('ModalFairnessComponent', () => {
  let component: DiceFairnessComponent;
  let fixture: ComponentFixture<DiceFairnessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiceFairnessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiceFairnessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
