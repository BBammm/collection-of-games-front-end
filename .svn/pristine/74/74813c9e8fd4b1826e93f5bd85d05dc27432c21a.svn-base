import { Component, Injector, EventEmitter, Output } from '@angular/core'; // , OnInit, Inject
import { BaseFairs } from '../base-fairs.component';
import * as crypto from 'crypto-js';

@Component({
    selector: 'app-modal-fairness',
    templateUrl: './fairness.component.html',
    styleUrls: ['../fairness.component.scss']
})

export class JokerFairnessComponent extends BaseFairs {
    @Output() private popclosed = new EventEmitter();
    public title: string;
    public gameHash: string;
    public gameResult: string;
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

    private getResultCard(hash: string): string {
        const h = hash.substr(1, 10);
        const no = parseInt(h, 16) % 50;
        let card: string;
        let cardType: number;
        let cardNo: number;
        let cardTmp: string;
        if (no >= 48) {
            card = 'JO';
        } else if (no < 12) {
            cardType = 0;
            cardNo = no;
        } else {
            cardType = no / 12;
            cardNo = no % 12;
        }
        if (card !== 'JO') {
            cardType = Math.floor(cardType);
            switch (cardType) {
                case 0:
                    cardTmp = 'D';
                    break;
                case 1:
                    cardTmp = 'S';
                    break;
                case 2:
                    cardTmp = 'H';
                    break;
                case 3:
                    cardTmp = 'C';
                    break;
            }

            switch (cardNo) {
                case 0:
                    card = cardTmp + 'A';
                    break;
                case 9:
                    card = cardTmp + 'J';
                    break;
                case 10:
                    card = cardTmp + 'Q';
                    break;
                case 11:
                    card = cardTmp + 'K';
                    break;
                default:
                    card = cardTmp + (cardNo + 1).toString();
                    break;
            }
        }
        return card;
    }

    public getResult(): void {
        this.gameResult = this.getResultCard(this.gameHash);
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
