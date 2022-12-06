import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MiningFairnessComponent } from './fairness.component';

describe('ModalMiningFairnessComponent', () => {
  let component: MiningFairnessComponent;
  let fixture: ComponentFixture<MiningFairnessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MiningFairnessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MiningFairnessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
