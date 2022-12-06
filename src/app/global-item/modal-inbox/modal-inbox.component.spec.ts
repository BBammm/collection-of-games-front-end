import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalInboxComponent } from './modal-inbox.component';

describe('ModalInboxComponent', () => {
  let component: ModalInboxComponent;
  let fixture: ComponentFixture<ModalInboxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalInboxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalInboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
