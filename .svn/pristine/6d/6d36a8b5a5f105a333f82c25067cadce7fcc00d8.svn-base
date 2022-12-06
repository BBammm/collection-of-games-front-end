import { Component, OnInit, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router'; // ActivatedRoute,

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SocketMultiService } from 'ng-node-socket';
import { MAIN_SERVER } from '../../../../environments/environment';

import { AccountService } from '../../../services/account.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { SnackbarService } from '../../../services/snackbar.service';

@Component({
    selector: 'app-withdraw',
    templateUrl: './withdraw.component.html',
    styleUrls: ['./withdraw.component.scss']
})
export class WithdrawComponent implements OnInit, OnDestroy {
    private ngUnsubscribe = new Subject();
    private submited = false; // for prevent twice submit
    public isPending = false;

    public step = 1;
    public symbolList = [
        { title: 'Select', value: '' },
        { title: 'BTC', value: 'BTC' },
        { title: 'ETH', value: 'ETH' },
        { title: 'XRP', value: 'XRP' },
        { title: 'TRX', value: 'TRX' }
    ];

    public stepOneWithdraw = new FormGroup({
        symbol: new FormControl('', [Validators.required]),
        amount: new FormControl(undefined, [Validators.required])
    });
    public withdrawInfo: any;
    private userInfo: any;
    private errorNumMsg: any = '';
    public needNum = false;

    public tgmMarketPrice = {
        BTC: {symbol: 'BTC', ask: {upbit: 0, bithumb: 0, price: 0}, bid: {upbit: 0, bithumb: 0, price: 0}},
        ETH: {symbol: 'BTC', ask: {upbit: 0, bithumb: 0, price: 0}, bid: {upbit: 0, bithumb: 0, price: 0}},
        XRP: {symbol: 'BTC', ask: {upbit: 0, bithumb: 0, price: 0}, bid: {upbit: 0, bithumb: 0, price: 0}},
        TRX: {symbol: 'BTC', ask: {upbit: 0, bithumb: 0, price: 0}, bid: {upbit: 0, bithumb: 0, price: 0}}
    };

    constructor(
        // private route: ActivatedRoute,
        private router: Router,
        private accountSvc: AccountService,
        private authSvc: AuthService,
        private socket: SocketMultiService,
        private titleSvc: Title,
        private snackbarSvc: SnackbarService,
    ) {
        this.titleSvc.setTitle('WITHDRAWAL');
        this.authSvc.getUserDetail().then((res: any) => {
            this.userInfo = res.user;
        });
    }

    public ngOnInit(): void {
        // 실시간 TGM 가격 불러오기
        this.socket.init(MAIN_SERVER.socketName, MAIN_SERVER.socketUrl);
        this.socket.Emit(MAIN_SERVER.socketName, 'join-tgm-price', (resp: any) => {
            // {BTC: {symbol: 'BTC', ask: {upbit, bithumb, price}}, ETH:{}}
            this.tgmMarketPrice = resp;
        });
        this.socket.On(MAIN_SERVER.socketName, 'symbol.krw.price')
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((data: any) => {
                // {ask: {upbit, bithumb, price}, bid: {upbit, bithumb, price}, symbol: 'XRP'}
                const marketPrice = data[0];
                this.tgmMarketPrice[marketPrice.symbol] = marketPrice;
        });

        this.withdrawInfo = {
            symbol: '',
            commission: 0,
            min: 0,
            unitPrice: 0,
            inAmount: 0,
            totalAmount: 0,
            payAmount: 0,
            enc: '',
            address: '',
            authNo: undefined,
            tag: '',
            enableTag: true
        };
    }

    public ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }
    /**
     * 1stepSubmit
     */
    public stepOneSubmit(): void {
        if (this.stepOneWithdraw.invalid) {
            this.isPending = false;
            return this.snackbarSvc.trans('dep-wdl.withdraw.required.somefield');
        }
        this.withdrawInfo = {
            symbol: this.stepOneWithdraw.value.symbol,
            amount: this.stepOneWithdraw.value.amount,
        };
        this.accountSvc.withdrawCheck(this.withdrawInfo).then((res: any) => {
            this.isPending = true;
            if (res.error) {
                return this.snackbarSvc.show(res.error);
            }
            this.setData(res);
            this.step = 2;
        })
        .catch((err: string) => console.error(err))
        .finally(() => {
            this.isPending = false;
        });
    }

    /**
     *  인증번호 받기
     */
    public getNum(): void {
        const params = {
            national_code: this.userInfo.national_code,
            mobile: this.userInfo.mobile
        };
        this.accountSvc.getWithdrawAuthNum(params).then((res: any) => {
            this.errorNumMsg = res;
        })
        .catch((err: string) => {
            return this.snackbarSvc.show(err);
        })
        .finally(() => {
            if (this.errorNumMsg.error) {
                return this.snackbarSvc.show(this.errorNumMsg.error);
            } else {
                this.needNum = true;
                return this.snackbarSvc.show(this.errorNumMsg.message, {type: 'success'});
            }
        });
    }

    /**
     * 출금하기
     */
    public withdraw(): void {
        if (!this.withdrawInfo.authNo) {
            return this.snackbarSvc.trans('dep-wdl.withdraw.required.auth-num');
        }

        if (this.withdrawInfo.symbol === 'XRP' && !this.withdrawInfo.tag && this.withdrawInfo.enableTag) {
            return this.snackbarSvc.trans('dep-wdl.withdraw.required.destination-tag');
        }

        if (!this.withdrawInfo.address) {
            return this.snackbarSvc.trans('dep-wdl.withdraw.required.address');
        }

        if (this.submited) {
            return;
        }
        this.submited = true;

        const params = {
            enc: this.withdrawInfo.enc,
            symbol: this.withdrawInfo.symbol,
            amount: this.withdrawInfo.inAmount,
            address: this.withdrawInfo.address,
            tag: this.withdrawInfo.tag || '',
            enableTag: this.withdrawInfo.enableTag,
            authNo: this.withdrawInfo.authNo,
            totalAmount: this.withdrawInfo.totalAmount,
            commission: this.withdrawInfo.commission,
            payAmount: this.withdrawInfo.payAmount,
            unitPrice: this.withdrawInfo.unitPrice,
        };

        this.accountSvc.withdraw(params).then((res: any) => {
            this.submited = false;
            if (!res.error) {
                this.snackbarSvc.trans('dep-wdl.withdraw.messages.applied', {type: 'success'});
                this.router.navigate(['history/main/withdraw']);
            } else {
                this.snackbarSvc.show(res.error);
            }
        })
        .catch((err: string) => {
            this.snackbarSvc.show(err);
        })
        .finally(() => {

        });
    }

    private setData(datas: any): void {
        const data = datas.info;
        this.withdrawInfo = {
            symbol: data.symbol,
            commission: data.commission,
            min: data.min,
            unitPrice: data.unitPrice,
            inAmount: data.inAmount,
            totalAmount: data.totalAmount,
            payAmount: data.payAmount,
            enc: data.enc,
            address: '',
            enableTag: true
        };
    }

    /**
     * 뒤로가기
     */
    public stepBack(): void {
        this.step = 1;
    }
}
