import { Component, Injector, EventEmitter, Output } from '@angular/core'; // , OnInit, Inject
import { BaseFairs } from '../base-fairs.component';
import * as crypto from 'crypto-js';

@Component({
    selector: 'app-modal-fairness',
    templateUrl: './fairness.component.html',
    styleUrls: ['../fairness.component.scss']
})

export class GraphFairnessComponent extends BaseFairs { //  extends BaseFairsComponent  implements OnInit
    @Output() private popclosed = new EventEmitter();
    public gameHash: string;
    public gameResult: number;
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
    private hmac(key: string, v: string): string {
      const hmacHasher = crypto.algo.HMAC.create(crypto.algo.SHA256, key);
      return hmacHasher.finalize(v).toString();
    }

    private crashPointFromHash(serverSeed: string): number {
        const hash = this.hmac(serverSeed, '000000000000000007a9a31ff7f07463d91af6b5454241d5faf282e5e0fe1b3a');

        const h = parseInt(hash.slice(0, 52 / 4), 16);
        const e = Math.pow(2, 52);

        return Math.floor((100 * e - h) / (e - h));
    }

    public getResult(): void {
        this.gameResult = this.crashPointFromHash(this.gameHash);
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
