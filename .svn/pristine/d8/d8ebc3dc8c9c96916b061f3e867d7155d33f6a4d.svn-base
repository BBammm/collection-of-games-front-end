import { Component, OnInit, OnDestroy } from '@angular/core'; // , OnChanges
import { Title } from '@angular/platform-browser';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SocketMultiService } from 'ng-node-socket';
import { MAIN_SERVER } from '../../../../environments/environment';
import { AccountService } from '../../../services/account.service';
import { copyToClipboard } from '../../../functions/common';
import { SnackbarService } from '../../../services/snackbar.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-deposit',
    templateUrl: './deposit.component.html',
    styleUrls: ['./deposit.component.scss']
})
export class DepositComponent implements OnInit, OnDestroy {
    private ngUnsubscribe = new Subject();
    public symbolInfo =  '';
    public symbolList = [
        { title: 'Select', value: '' },
        { title: 'BTC', value: 'BTC' },
        { title: 'ETH', value: 'ETH' },
        { title: 'XRP', value: 'XRP' },
        { title: 'TRX', value: 'TRX' }
    ];
    public accountInfo: any;

    public qrElementType = 'url';
    public needCreated = false;

    public tgmMarketPrice = {
        BTC: {symbol: 'BTC', ask: {upbit: 0, bithumb: 0, price: 0}, bid: {upbit: 0, bithumb: 0, price: 0}},
        ETH: {symbol: 'BTC', ask: {upbit: 0, bithumb: 0, price: 0}, bid: {upbit: 0, bithumb: 0, price: 0}},
        XRP: {symbol: 'BTC', ask: {upbit: 0, bithumb: 0, price: 0}, bid: {upbit: 0, bithumb: 0, price: 0}},
        TRX: {symbol: 'BTC', ask: {upbit: 0, bithumb: 0, price: 0}, bid: {upbit: 0, bithumb: 0, price: 0}}
    };

    constructor(
        private accountSvc: AccountService,
        private socket: SocketMultiService,
        private titleSvc: Title,
        private snackbarSvc: SnackbarService,
        private translate: TranslateService
    ) {
        this.titleSvc.setTitle('DEPOSIT');
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

        this.accountInfo = {
            error: false,
            address: null,
            symbol: ''
        };
    }

    public ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    /**
     * 심볼 slelct 변경
     */
    public symbolChange(e: any): void {
        this.symbolInfo = e;
        this.accountSvc.getAddress(this.symbolInfo).then((res: any) => {
            if (res.info === null) {
                this.accountInfo = {
                    error: false,
                    address: null,
                    symbol: ''
                };
                this.needCreated = true;
            } else {
                this.accountInfo = {
                    error: res.error,
                    address: res.info.address,
                    symbol: res.symbol,
                    tag: res.info.tag || ''
                };
                this.needCreated = false;
            }
        });
    }

    /**
     * 주소 생성
     */
    public createAddress(): void {
        if (this.symbolInfo === '') {
            this.snackbarSvc.trans('dep-wdl.deposit.message-symbol-required');
            return;
        }
        const queryParam = {
            symbol: this.symbolInfo
        };
        this.accountSvc.createAddress(queryParam).then((res: any) => {
            this.accountInfo = {
                error: res.error,
                address: res.info.address,
                symbol: res.symbol
            };
        });
    }

    /**
     * 주소 복사
     */
    public copyAddress(str: string): void {
        if (!str) {
            return;
        }
        copyToClipboard(str);
        this.snackbarSvc.show('Copied', { type: 'success', timeout: 1000 });
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
