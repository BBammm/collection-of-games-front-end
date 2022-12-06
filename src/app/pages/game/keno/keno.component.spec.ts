import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KenoComponent } from './keno.component';

describe('KenoComponent', () => {
  let component: KenoComponent;
  let fixture: ComponentFixture<KenoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KenoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KenoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
