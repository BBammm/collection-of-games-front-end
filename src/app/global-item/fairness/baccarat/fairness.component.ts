import { Component, Injector, EventEmitter, Output } from '@angular/core'; // , OnInit, Inject
import { BaseFairs } from '../base-fairs.component';
import * as crypto from 'crypto-js';

@Component({
    selector: 'app-modal-fairness',
    templateUrl: './fairness.component.html',
    styleUrls: ['../fairness.component.scss']
})

export class BaccaratFairnessComponent extends BaseFairs { //  extends BaseFairsComponent  implements OnInit
    @Output() private popclosed = new EventEmitter();
    public gameHash: string;
    public resultCards: string[];
    public prevHash: string;
    public currentSalt: string;
    public currentHash: string;
    public data: any;

    constructor(
        protected injector: Injector,
    ) {
        super(injector);
        this.data = this.injector.get('data');
    }
    private getResultCard(hash: string): string[] {
      let start = 1;
      let selResult: string;
      let hex2: string;
      const cards = [];
      do {
        hex2 = hash.substr(start, 2);
        selResult = this.selectCard(hex2);
        start++;
        if (selResult) {
          cards.push(selResult);
        }
      }
      while (cards.length < 6);

      return cards;
    }

    private selectCard(hex2: string): string {
      const cardtype = hex2.substr(0, 1);
      const cardnum = hex2.substr(1, 1);
      if (cardnum === '0' || cardnum === 'e' || cardnum === 'f') {
        return;
      } else {
        const selCardType = this.getCardType(parseInt((parseInt(cardtype, 16) / 4).toString(), 10));
        const selCardNum = this.getCardNum(parseInt(cardnum, 16));
        return selCardType + selCardNum;
      }
    }

    private getCardType(no: number): string {
      let cardType: string;
      switch (no) {
        case 0:
          cardType = 'D'; // Red Diamond
          break;
        case 1:
          cardType = 'S'; // Black Spade
          break;
        case 2:
          cardType = 'H'; // Red Heart
          break;
        case 3:
          cardType = 'C'; // Black Clover
          break;
      }
      return cardType;
    }

    private getCardNum(no: number): string {
      let cardNum: string;
      switch (no) {
        case 1:
          cardNum = 'A';
          break;
        case 11:
          cardNum = 'J';
          break;
        case 12:
          cardNum = 'Q';
          break;
        case 13:
          cardNum = 'K';
          break;
        default:
          cardNum = no.toString();
          break;
      }
      return cardNum;
    }

    public getResult(): void {
        this.resultCards = this.getResultCard(this.gameHash);
    }

    public validCheck(): void {
        this.currentHash = crypto.HmacSHA256(this.prevHash, this.currentSalt).toString(crypto.enc.Hex);
    }

    public close(): void {
        // 현재 팝업창 닫기 ()
        // 이부분인 BaseFairs 에 들어갈 경우는 에러가 발생함..
        this.popclosed.emit();
    }
}
