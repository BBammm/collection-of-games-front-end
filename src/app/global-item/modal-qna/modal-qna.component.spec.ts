import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalQnaComponent } from './modal-qna.component';

describe('ModalQnaComponent', () => {
  let component: ModalQnaComponent;
  let fixture: ComponentFixture<ModalQnaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalQnaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalQnaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
