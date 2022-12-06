import { Component, Injector, EventEmitter, Output } from '@angular/core'; // , OnInit, Inject
import { BaseFairs } from '../base-fairs.component';
import * as crypto from 'crypto-js';

@Component({
    selector: 'app-modal-fairness',
    templateUrl: './fairness.component.html',
    styleUrls: ['../fairness.component.scss']
})

export class HalfFairnessComponent extends BaseFairs {
    @Output() private popclosed = new EventEmitter();
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
        const no = parseInt(h, 16);
        const cardNo = (no % 12) + 1;

        let card: string;
        switch (cardNo) {
            case 1:
                card = 'A';
                break;
            case 10:
                card = 'J';
                break;
            case 11:
                card = 'Q';
                break;
            case 12:
                card = 'K';
                break;
            default:
                card = cardNo.toString();
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
