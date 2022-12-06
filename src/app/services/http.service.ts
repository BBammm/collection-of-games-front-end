import { Injectable } from '@angular/core';
import { GAMES, httpUrl } from '../../environments/environment';
import { RestHttpClient } from 'ng-rest-http';
import { LocalStorageService } from 'ng-storages';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

    private defaultUrl = '';

    constructor(
        protected http: RestHttpClient,
        private storage: LocalStorageService
    ) {
        this.defaultUrl = httpUrl;
    }

    public post(obj: any): Promise<any> {
        obj.url = this.defaultUrl + obj.url;
        if (typeof obj.headers === 'undefined') {
            obj.headers = {};
        }

        obj.headers.Authorization = 'Bearer ' + this.userToken();
        obj.params.lan = this.lan();
        return new Promise((resolve) => {
            this.http.post(obj).then((res) => {
                resolve(res.body);
            });
        });
    }

    public postOtp(obj: any): Promise<any> {
        obj.url = this.defaultUrl + obj.url;
        if (typeof obj.headers === 'undefined') {
            obj.headers = {};
        }

        obj.headers.Authorization = 'Bearer ' + obj.params.userToken;
        return new Promise((resolve) => {
            this.http.post(obj).then((res) => {
                resolve(res.body);
            });
        });
    }

    public get(obj: any): Promise<any> {
        obj.url = this.defaultUrl + obj.url;
        if (typeof obj.headers === 'undefined') {
            obj.headers = {};
        }
        if (!obj.params) {
            obj.params = {};
        }
        // obj.headers = {'Access-Control-Allow-Origin': '*'};
        obj.headers.Authorization = 'Bearer ' + this.userToken();
        obj.params.lan = this.lan();
        return new Promise((resolve) => {
            this.http.get(obj).then((res) => {
                resolve(res.body);
            });
        });
    }

    public delete(obj: any): Promise<any> {
        obj.url = this.defaultUrl + obj.url;
        if (typeof obj.headers === 'undefined') {
            obj.headers = {};
        }

        obj.headers.Authorization = 'Bearer ' + this.userToken();
        obj.params.lan = this.lan();
        return new Promise(resolve => {
            this.http.delete(obj).then((res) => {
                resolve(res.body);
            });
        });
    }

    public put(obj: any): Promise<any> {
        obj.url = this.defaultUrl + obj.url;
        if (typeof obj.headers === 'undefined') {
            obj.headers = {};
        }

        obj.headers.Authorization = 'Bearer ' + this.userToken();
        obj.params.lan = this.lan();
        return new Promise((resolve) => {
            this.http.put(obj).then((res) => {
                resolve(res.body);
            });
        });
    }

    public requestOtt(game: string, callback: (body: any) => void): any {

        const params = {userId: this.userId(), game};

        const userToken = localStorage.getItem('userToken');
        if (userToken) {
            const userInfo = JSON.parse(this.storage.getItem('user'));
            params.userId = userInfo.encryptedId;
        }

        return this.createOnetimeToken({params}).then((res) => {
            res.body.userId = params.userId;
            callback(res.body);
        });
        //
        // this.storage.getItem('user');
        // this.storage.get('userToken').then((res) => {
        //     if (res) {
        //         this.storage.getObject('user').then((res1) => {
        //             params.userId = res1.encryptedId;
        //         });
        //     }
        // }).then(() => {
        //     this.createOnetimeToken({params}).then((res) => {
        //         res.body.userId = params.userId;
        //         callback(res.body);
        //     });
        // });
    }

    public createOnetimeToken(obj: any): Promise<any> {
        obj.url = GAMES.apiUrl + '/create-onetime-token';
        if (typeof obj.headers === 'undefined') {
            obj.headers = {};
        }
        // obj.headers = {'Access-Control-Allow-Origin': '*'};
        obj.headers.Authorization = 'Bearer ' + this.userToken();
        return new Promise((resolve) => {
            this.http.get(obj).then((res) => {
                resolve(res);
            });
        });
    }

    public getDirect(obj: any): Promise<any> {
        obj.url = obj.url;
        if (typeof obj.headers === 'undefined' ) {
            obj.headers = {};
        }

        return new Promise((resolve) => {
            this.http.get(obj).then((res) => {
                resolve(res);
            });
        });
    }

    private userToken(): string {
        return localStorage.getItem('userToken') || null;
    }

    private userId(): number {
        const userInfo = JSON.parse(localStorage.getItem('user')) || {id: null, name: null, email: null};
        return userInfo.id;
    }

    // 아래는 현재 앱에서 사용하는 모든 http를 정의해 둔다.
    public updateAuthenticate(user: any): Promise<any> {
        return new Promise((resolve) => {
            this.post({url: 'authenticate', params: user}).then((obj) => {
                resolve(obj);
            });
        });
    }

    // payment
    public getDepositAddress(): Promise<any> {
        return new Promise((resolve) => {
            this.get({url: 'payment/get-deposit-address'}).then((obj) => {
                resolve(obj);
            });
        });
    }

    private lan(): string {
        const config = localStorage.getItem('config') ? JSON.parse(localStorage.getItem('config')) : {lan: 'en'};
        return config.lan;
    }
}
