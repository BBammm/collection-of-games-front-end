import { Injectable } from '@angular/core';
import { HttpService } from './http.service';

@Injectable({
    providedIn: 'root'
})
export class AccountService {

    constructor(
        private http: HttpService,
    ) { }

    /**
     * 입금주소 만들기
     */
    public createAddress(params: any): Promise<any> {
        return new Promise((resolve) => {
            this.http.post({ url: 'account/create', params }).then((res) => {
                resolve(res);
            });
        });
    }

    /**
     * 입금주소 갖고오기
     */
    public getAddress(param: any): Promise<any> {
        return new Promise((resolve) => {
            this.http.get({ url: 'account/address/' + param }).then((res) => {
                resolve(res);
            });
        });
    }

    /**
     * 출금시 인증번호 받기
     */
    public getWithdrawAuthNum(params: any): Promise<any> {
        return new Promise((resolve) => {
            this.http.post({ url: 'sendSmsauth/withdraw', params }).then((res) => {
                resolve(res);
            });
        });
    }

    /**
     * 출금 신청 전처리
     */
    public withdrawCheck(params: any): Promise<any> {
        return new Promise((resolve) => {
            this.http.get({ url: 'withdrawals/pre-check', params }).then((res) => {
                resolve(res);
            });
        });
    }

    /**
     * 출금 신청
     */
    public withdraw(params: any): Promise<any> {
        return new Promise((resolve) => {
            this.http.post({ url: 'withdrawals/withdraw', params }).then((res) => {
                resolve(res);
            });
        });
    }

}
