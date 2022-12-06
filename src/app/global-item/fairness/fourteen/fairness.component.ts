import { Component, Injector, EventEmitter, Output } from '@angular/core'; // , OnInit, Inject
import { BaseFairs } from '../base-fairs.component';
import * as crypto from 'crypto-js';

@Component({
    selector: 'app-modal-fairness',
    templateUrl: './fairness.component.html',
    styleUrls: ['../fairness.component.scss']
})

export class FourteenFairnessComponent extends BaseFairs {
    @Output() private popclosed = new EventEmitter();
    public gameHash: string;
    public resultCode: number;
    public resultColor: string;
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

    private getResultColor(num: number): string {
        switch (num) {
            case 0:
                return 'Green';
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
                return 'Red';
            case 8:
            case 9:
            case 10:
            case 11:
            case 12:
            case 13:
            case 14:
                return 'Blue';
        }
    }

    private crashPointFromHash(serverSeed: string): number {
        const roll = parseInt(serverSeed.substr(0, 8), 16);
        return Math.abs(roll) % 15;
    }

    public getResult(): void {
        this.resultCode = this.crashPointFromHash(this.gameHash);
        this.resultColor = this.getResultColor(this.resultCode);
        // this.resultColor = this.getResultColor(parseInt(this.resultCode, 10));
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
