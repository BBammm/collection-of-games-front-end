import { Injectable } from '@angular/core';
import { HttpService } from './http.service';

@Injectable({
    providedIn: 'root'
})
export class MessageService {

    constructor(
        private http: HttpService
    ) { }

    /**
     * 메시지 리스트 갖고오기
     */
    public lists(params: any): Promise<any> {
        return new Promise((resolve) => {
            this.http.get({url: 'messages/body', params}).then((res) => {
                resolve(res);
            });
        });
    }

    /**
     * 읽지않은 메시지 count
     */
    public unreadCount(): Promise<any> {
        return new Promise((resolve) => {
            this.http.get({url: 'messages/unread-count'}).then((res) => {
                resolve(res);
            });
        });
    }

    /**
     * 메시지 읽음 체크
     */
    public checkRead(seq: number): Promise<any> {
        return new Promise((resolve) => {
            this.http.get({url: `messages/${seq}/check-read`}).then((res) => {
                resolve(res);
            });
        });
    }
}
