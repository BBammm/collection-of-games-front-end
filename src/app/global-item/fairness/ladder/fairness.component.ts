import { Component, Injector, EventEmitter, Output } from '@angular/core'; // , OnInit, Inject
import { BaseFairs } from '../base-fairs.component';
import * as crypto from 'crypto-js';

@Component({
    selector: 'app-modal-fairness',
    templateUrl: './fairness.component.html',
    styleUrls: ['../fairness.component.scss']
})

export class LadderFairnessComponent extends BaseFairs {
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

    private getResultCode(hash: string): string[] {
        const start = parseInt(hash.substr(1, 3), 16) % 2;
        const line = parseInt(hash.substr(4, 3), 16) % 2;

        const result = [];
        switch (start) {
          case 0:
            result[0] = 'L';
            result[1] = 'Left';
            break;
          case 1:
            result[0] = 'R';
            result[1] = 'Right';
            break;
        }

        switch (line) {
          case 0:
            result[0] += '3';
            result[1] += ' > Line 3';
            break;
          case 1:
            result[0] += '4';
            result[1] += ' > Line 4';
            break;
        }

        switch (result[0]) {
          case 'R3':
            result[0] += 'O';
            result[1] += ' > Odd';
            break;
          case 'R4':
            result[0] += 'E';
            result[1] += ' > Even';
            break;
          case 'L3':
            result[0] += 'E';
            result[1] += ' > Even';
            break;
          case 'L4':
            result[0] += 'O';
            result[1] += ' > Odd';
            break;
        }
        return result;
      }

   public getResult(): void {
       const result = this.getResultCode(this.gameHash);
       this.gameResult =  result[0] + '(' + result[1] + ')';
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
