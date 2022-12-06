import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MypageMainComponent } from './mypage-main.component';

describe('MypageMainComponent', () => {
  let component: MypageMainComponent;
  let fixture: ComponentFixture<MypageMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MypageMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MypageMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
