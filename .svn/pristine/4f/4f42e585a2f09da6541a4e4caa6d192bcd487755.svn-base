import { Injectable } from '@angular/core';
import { HttpService } from './http.service';

@Injectable({
    providedIn: 'root'
})
export class TransactionService {

    constructor(
        private http: HttpService,
    ) { }

    /**
     *  변동 List API
     */
    public changes(params: any): Promise<any> {
        return new Promise((resolve) => {
            this.http.get({ url: 'history/changes', params }).then((res) => {
                resolve(res);
            });
        });
    }

    /**
     *  입금 List API
     */
    public deposit(params: any): Promise<any> {
        return new Promise((resolve) => {
            this.http.get({ url: 'history/deposits', params }).then((res) => {
                resolve(res);
            });
        });
    }

    /**
     *  출금 List API
     */
    public withdrawals(params: any): Promise<any> {
        return new Promise((resolve) => {
            this.http.get({ url: 'history/withdrawals', params }).then((res) => {
                resolve(res);
            });
        });
    }

}
