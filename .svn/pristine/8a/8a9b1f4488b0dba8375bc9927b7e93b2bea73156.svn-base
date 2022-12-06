import { Component, Injector, EventEmitter, Output } from '@angular/core'; // , OnInit, Inject
import { BaseFairs } from '../base-fairs.component';
import * as crypto from 'crypto-js';

@Component({
    selector: 'app-modal-fairness',
    templateUrl: './fairness.component.html',
    styleUrls: ['../fairness.component.scss']
})

export class FiftyFairnessComponent extends BaseFairs { //  extends BaseFairsComponent  implements OnInit
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
            case 2:
            case 4:
            case 6:
            case 8:
            case 10:
            case 12:
            case 14:
            case 16:
            case 18:
            case 20:
            case 22:
            case 24:
            case 26:
            case 28:
            case 30:
            case 32:
            case 34:
            case 38:
            case 40:
            case 42:
            case 44:
            case 46:
            case 48:
            case 50:
            case 52:
                return 'Black';
            case 1:
            case 3:
            case 15:
            case 17:
            case 25:
            case 27:
            case 35:
            case 37:
            case 45:
            case 47:
                return 'Green';
            case 5:
            case 7:
            case 9:
            case 11:
            case 13:
            case 19:
            case 21:
            case 23:
            case 29:
            case 31:
            case 33:
            case 39:
            case 41:
            case 43:
            case 49:
            case 51:
            case 53:
                return 'Red';
            case 36:
                return 'Yellow';

        }
    }
    private crashPointFromHash(serverSeed: string): number {
       const h = serverSeed.substr(1, 10);
       const roll = parseInt(h, 16);
       return roll % 54;
    }

    public getResult(): void {
        this.resultCode = this.crashPointFromHash(this.gameHash);
        this.resultColor = this.getResultColor(this.resultCode);
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
