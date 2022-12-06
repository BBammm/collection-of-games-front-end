import { Injectable } from '@angular/core';
import { HttpService } from './http.service';

const defaultParams = {
    offset: 0,
    take: 10
};

@Injectable({
    providedIn: 'root'
})
export class GameTransactionService {

    constructor(
        private http: HttpService,
    ) { }

    /**
     * 최근 게임 가져오기
     */
    public gamesLog(game: string, params?: any): Promise<any> {
        const url = 'game/' + game + '/transaction';
        params = params || defaultParams;
        return new Promise((resolve) => {
            this.http.get({ url, params }).then((res) => {
                resolve(res);
            });
        });
    }

    /**
     * 마이 게임 가져오기
     */
    public myGamesLog(game: string, params?: any): Promise<any> {
        const url = 'mypage/game/' + game + '/transaction';
        params = params || defaultParams;
        return new Promise((resolve) => {
            this.http.get({ url, params }).then((res) => {
                resolve(res);
            });
        });
    }

    /**
     * joker 마이 게임
     */
     public myJoker(game: string, params?: any): Promise<any> {
        const url = 'mypage/game/' + game + '/transaction';
        params = params || defaultParams;
        return new Promise((resolve) => {
            this.http.get({ url, params }).then((res) => {
                resolve(res);
            });
        });
    }

    /**
     * joker 최근 게임
     */
     public recentJoker(game: string, params?: any): Promise<any> {
        const url = 'mypage/game/' + game + '/transaction';
        params = params || defaultParams;
        return new Promise((resolve) => {
            this.http.get({ url, params }).then((res) => {
                resolve(res);
            });
        });
    }
}
