import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BetContainerComponent } from './bet-container.component';

describe('BetContainerComponent', () => {
  let component: BetContainerComponent;
  let fixture: ComponentFixture<BetContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BetContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BetContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
