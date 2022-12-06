import { TestBed } from '@angular/core/testing';

import { GameTransactionService } from './game-transaction.service';

describe('GameTransactionService', () => {
  let service: GameTransactionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameTransactionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
