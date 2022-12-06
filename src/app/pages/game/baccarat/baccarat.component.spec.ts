import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BaccaratComponent } from './baccarat.component';

describe('BaccaratComponent', () => {
  let component: BaccaratComponent;
  let fixture: ComponentFixture<BaccaratComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BaccaratComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BaccaratComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
