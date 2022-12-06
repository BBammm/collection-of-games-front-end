import { Component, OnInit, Injector, Output, EventEmitter } from '@angular/core';
import { BaseFairs } from '../base-fairs.component';
import * as crypto from 'crypto-js';

@Component({
    selector: 'app-slot',
    templateUrl: './slot.component.html',
    styleUrls: ['../fairness.component.scss']
})
export class SlotFairnessComponent extends BaseFairs {
    @Output() private popclosed = new EventEmitter();
    public gameHash: string;
    public gameResult: number[];
    public gameResultCode: string;
    public data: any;

    public cardsInfo = [];

    private source: any;

    constructor(
        protected injector: Injector,
    ) {
        super(injector);
        this.data = this.injector.get('data');
    }

    public getResult(): void {
        this.source = this.cardChoose();

        this.cardsInfo = this.convertCardsFromHash(this.source.cardNo, this.source.cardType);
    }
    private cardChoose() {
        const hash = this.gameResultCode;
        const dec = BigInt('0x' + hash);
        const cardNo = dec.toString(13).substring(1, 17);
        const cardType = dec.toString(4).substring(1, 17);

        const cards = {};
        for (let i = 0; i < cardNo.length; i++) {
            const n = cardNo.charAt(i);
            const t = cardType.charAt(i);
            const card = t + n;
            if (cards.hasOwnProperty(card)) {
                return this.getResult();
            } else {
                cards[card] = true;
            }
        }
        return { cardNo, cardType };
    }
    private convertCardsFromHash(cardNo, cardType) {
        const rtn = [];
        for (let i = 0; i < 3; i++) {
            const j = i * 5;
            const n = cardNo.substr(j, 5);
            const t = cardType.substr(j, 5);
            const cardNoArr = this.getSuit(n);
            const cardTypeArr = this.getCardType(t, cardNoArr);
            rtn.push(cardTypeArr);
        }
        return rtn;
    }
    private getSuit(t) {
        const rtn = [];
        for (let i = 0; i < t.length; i++) {
            const s = t.charAt(i);
            switch (s) {
                case 'a':
                    rtn.push({ suit: 'J', n: 11 });
                    break;
                case 'b':
                    rtn.push({ suit: 'Q', n: 12 });
                    break;
                case 'c':
                    rtn.push({ suit: 'K', n: 13 });
                    break;
                case '0':
                    rtn.push({ suit: '10', n: 10 });
                    break;
                case '1':
                    rtn.push({ suit: 'A', n: 1 });
                    break;
                default:
                    rtn.push({ suit: s, n: parseInt(s, 10) });
                    break;
            }
        }
        return rtn;
    }
    private getCardType(t, n) {
        const rtn = [];
        for (let i = 0; i < t.length; i++) {
            const s = t.charAt(i);
            switch (s) {
                case '0':
                    rtn[i] = 'S' + n[i].suit;
                    break;
                case '1':
                    // n[i].card = 'C';
                    rtn[i] = 'C' + n[i].suit;
                    break;
                case '2':
                    // n[i].card = 'H';
                    rtn[i] = 'H' + n[i].suit;
                    break;
                case '3':
                    // n[i].card = 'D';
                    rtn[i] = 'D' + n[i].suit;
                    break;
            }
        }

        return rtn;
    }


    private genGameHash(resultCode: string): string {
        return crypto.SHA256(resultCode).toString();
    }

    public close(): void {
        // 현재 팝업창 닫기 ()
        // 이부분인 BaseFairs 에 들어갈 경우는 에러가 발생함..
        this.popclosed.emit();
    }

}
