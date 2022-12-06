import { TestBed } from '@angular/core/testing';
import { BbsService } from './bbs.service';

describe('BbsService', () => {
  let service: BbsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BbsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
