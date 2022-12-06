import { Component, Injector, EventEmitter, Output } from '@angular/core'; // , OnInit, Inject
import { BaseFairs } from '../base-fairs.component';
import * as crypto from 'crypto-js';

@Component({
    selector: 'app-modal-fairness',
    templateUrl: './fairness.component.html',
    styleUrls: ['../fairness.component.scss']
})

export class MiningFairnessComponent extends BaseFairs {
    @Output() private popclosed = new EventEmitter();
    public gameHash: string;
    public gameSalt: string;
    public gameLevel: string;
    public gameResult: number[][];
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

    private getResultMining(resultHash: string, level: string): number[][] {
        const valPerStep = [];
        for (let i = 0; i < 10; i++ ) {
            const j = 3 * i + 1; // 첫번째 자리는 제외한다.
            const val = parseInt(resultHash.substr(j, 3), 16);
            let tmp: number[];
            switch (level) {
                case 'E': // 3개중 2개 (나온 결과가 x)
                    tmp = [1, 1, 1];
                    tmp[val % 3] = 0;
                    valPerStep.push(tmp);
                    break;
                case 'N': // 2개중 1개 (나온 결과가 o)
                    tmp = [0, 0];
                    tmp[val % 2] = 1;
                    valPerStep.push(tmp);
                    break;
                case 'H': // 3개중 1개  (나온 결과가 o)
                    tmp = [0, 0, 0];
                    tmp[val % 3] = 1;
                    valPerStep.push(tmp);
                    break;
             }
        }
        return valPerStep;
    }

    public getResult(): void {
        const resultHash = crypto.HmacSHA256(this.gameHash, this.gameSalt).toString(crypto.enc.Hex);
        this.gameResult = this.getResultMining(resultHash, this.gameLevel);
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
