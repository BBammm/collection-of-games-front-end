import { Component, OnInit, Input, Output, EventEmitter, ViewChild, HostListener, OnChanges, SimpleChange } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { DecimalPipe } from '@angular/common';
import { GAMES } from '../../../environments/environment';
import { SnackbarService } from '../../services/snackbar.service';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-bet-container',
    templateUrl: './bet-container.component.html',
    styleUrls: ['./bet-container.component.scss'],
    animations: [
        trigger('morePannelTrigger', [
            state('inactive', style({
                height: '0px',
            })),
            state('active', style({
                height: '220px',
            })),
            transition('inactive => active', animate('50ms ease-in')),
            transition('active => inactive', animate('50ms ease-out'))
        ])
    ]
})
export class BetContainerComponent implements OnInit, OnChanges {
    @Input() private point: number; // 사용자가 현재 소지한 금액
    @Input() private betted: number; // 에러를 통과한 실제 배팅되는 금액
    // @Input() private direction = 'down'; // 클릭시 어느방향으로 펼쳐질 것인가?
    @Output() private setPoint: EventEmitter<number> = new EventEmitter<number>();

    @ViewChild('morePannelElement') private morePannelElement: any;
    protected ngUnsubscribe = new Subject();

    public ngStyle: any = { bottom: '40px' };
    private tmpAmount = 0;
//    private Amount = 0;
    public inputBetAmount: string; //
    public morePannelState = 'inactive';
    public btnOn = '';

    @HostListener('document:click', ['$event.target'])
    public onClick(targetElement: any): void {
        const clickedInside = this.morePannelElement.nativeElement.contains(targetElement);
        if (!clickedInside) {
            this.morePannelState = 'inactive';
        }
    }

    constructor(
        private decimalPipe: DecimalPipe,
        private snackbarSvc: SnackbarService,
        private translate: TranslateService
    ) { }

    public ngOnInit(): void {
        this.inputBetAmount = this.betted + '';
    }

    public ngOnChanges(changes: { [propKey: string]: SimpleChange }): void {
        for (const propName in changes) {
            if (changes.hasOwnProperty(propName)) {
                switch (propName) {
                    case 'point':
                        this.point = changes[propName].currentValue;
                        if (changes[propName].isFirstChange()) { // 첫번째로 변하는 경우는 로그인 되어 현재 사용자의 포인트를 가져올 경우
                        }
                        break;
                    case 'betted':
                        this.betted = changes[propName].currentValue;
                        this.tmpAmount = this.betted;
                        break;
                    case 'direction':
                        switch (changes[propName].currentValue) {
                            case 'down': // default up;
                                this.ngStyle = { top: '40px' };
                                break;
                        }
                        break;
                }
            }
        }
    }

    /**
     * @param String flag : up, down
     */
    public setBetAmount(amount: number): void {
        this.tmpAmount += amount;
        this.emitBetAmount();
    }

    /**
     * @param String flag half, multi, max
     */
    public setMultiply(flag: string): void {
        this.btnOn = flag;
        switch (flag) {
            case 'half':
                this.tmpAmount = this.tmpAmount / 2;
                break;
            case 'multi':
                this.tmpAmount = this.tmpAmount * 2;
                break;
            case 'min':
                this.tmpAmount = GAMES.minBet;
                break;
            case 'max':
                this.tmpAmount = GAMES.maxBet;
                break;
        }
        this.emitBetAmount();
    }

    private emitBetAmount(): void {
        if (this.tmpAmount > this.point) {
            this.transSystemMessage('games.alert.notEnoughPoint');
        }
        if (this.tmpAmount < GAMES.minBet) {
            this.tmpAmount = GAMES.minBet;
        } else if (this.tmpAmount > GAMES.maxBet) {
            this.tmpAmount = GAMES.maxBet;
        }

        if (this.tmpAmount > this.point) {
            this.tmpAmount = this.point;
        }

        this.tmpAmount = Math.floor(this.tmpAmount / 1000) * 1000;
        this.inputBetAmount = this.decimalPipe.transform(this.tmpAmount.toString());
        this.setPoint.emit(this.tmpAmount);
    }

    public resetBetAmount(): void {
        this.tmpAmount = 0;
        this.inputBetAmount = this.decimalPipe.transform(this.tmpAmount.toString());
        this.setPoint.emit(this.tmpAmount);
    }

    /**
     * 수동으로 betAmount를 변경할 경우
     */
    public changedBetAmount(e: string): void {
        const amount = e.replace(/\D/g, '');
        this.inputBetAmount = this.decimalPipe.transform(amount);
    }

    public numberOnly(event: any): boolean {
        const charCode = (event.which) ? event.which : event.keyCode;
        if (charCode > 31 && (charCode < 48 || charCode > 57)) {
            return false;
        }
        return true;

    }

    /**
     * 수동 입력시
     */
    public onBlur(): void {
        if (this.inputBetAmount) {
            const amount = this.inputBetAmount.replace(/\D/g, '');
            if (amount) {
                // this.setBetAmount(parseInt(amount, 10));
                this.tmpAmount = parseInt(amount, 10);
                this.emitBetAmount();
            }
        }
    }

    public moreState(): void {
        if (this.morePannelState === 'inactive') {
            this.morePannelState = 'active';
        } else {
            this.morePannelState = 'inactive';
        }
    }

    protected systemMessage(str: string, delaytime?: number, sound?: string, snackbarType?: string): void {
        delaytime = delaytime ? delaytime : 800;
        this.snackbarSvc.show(str, { timeout: delaytime, type: snackbarType });
    }
    protected transSystemMessage(str: string, transoption?: any, delaytime?: number, sound?: string, snackbarType?: string): void {
        this.translate.get(str, transoption)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((value) => {
            this.systemMessage(value, delaytime, sound, snackbarType);
        });
    }

}
