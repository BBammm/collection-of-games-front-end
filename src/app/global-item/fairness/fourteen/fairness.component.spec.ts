import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FourteenFairnessComponent } from './fairness.component';

describe('ModalFourteenFairnessComponent', () => {
  let component: FourteenFairnessComponent;
  let fixture: ComponentFixture<FourteenFairnessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FourteenFairnessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FourteenFairnessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
