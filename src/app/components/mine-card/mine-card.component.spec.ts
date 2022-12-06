import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MineCardComponent } from './mine-card.component';

describe('MineCardComponent', () => {
  let component: MineCardComponent;
  let fixture: ComponentFixture<MineCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MineCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MineCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
