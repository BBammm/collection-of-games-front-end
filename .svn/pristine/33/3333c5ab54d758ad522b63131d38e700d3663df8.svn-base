import { Component, Injector, EventEmitter, Output } from '@angular/core'; // , OnInit, Inject
import { BaseFairs } from '../base-fairs.component';
import * as crypto from 'crypto-js';

@Component({
    selector: 'app-modal-fairness',
    templateUrl: './fairness.component.html',
    styleUrls: ['../fairness.component.scss']
})

export class MineFairnessComponent extends BaseFairs {
    @Output() private popclosed = new EventEmitter();
    public gameHash: string;
    public gameResult: number[];
    public gameResultCode: string;
    public data: any;

    constructor(
        protected injector: Injector,
    ) {
        super(injector);
        this.data = this.injector.get('data');
    }

    public getResult(): void {
        if (this.gameResultCode) {
            const result = this.gameResultCode.split('-');
            const resultNum = result[0].split(',').map((item) => {
                return parseInt(item, 10);
            });

            this.gameHash = this.genGameHash(this.gameResultCode);

            this.gameResult = resultNum.sort((a: number, b: number) => {
                return a - b;
            });
        }
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
