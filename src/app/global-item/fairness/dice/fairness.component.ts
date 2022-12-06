import { Component, Injector, EventEmitter, Output } from '@angular/core'; // , OnInit, Inject
import { BaseFairs } from '../base-fairs.component';
import * as crypto from 'crypto-js';

@Component({
    selector: 'app-modal-fairness',
    templateUrl: './fairness.component.html',
    styleUrls: ['../fairness.component.scss']
})

export class DiceFairnessComponent extends BaseFairs { //  extends BaseFairsComponent  implements OnInit
    @Output() private popclosed = new EventEmitter();
    public gameHash: string;
    public resultDices: number[];
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

    private getResultDices(hash: string): number[] {
       const h = parseInt(hash.slice(0, 52 / 4), 16).toString(6);
       const n1 = parseInt(h.substr(2, 1), 10) + 1;
       const n2 = parseInt(h.substr(3, 1), 10) + 1;
       return [n1, n2];
    }

    public getResult(): void {
        this.resultDices = this.getResultDices(this.gameHash);
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
