import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HalfComponent } from './half.component';

describe('HalfComponent', () => {
  let component: HalfComponent;
  let fixture: ComponentFixture<HalfComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HalfComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HalfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
