import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JokerFairnessComponent } from './fairness.component';

describe('ModalJokerFairnessComponent', () => {
  let component: JokerFairnessComponent;
  let fixture: ComponentFixture<JokerFairnessComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JokerFairnessComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JokerFairnessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
