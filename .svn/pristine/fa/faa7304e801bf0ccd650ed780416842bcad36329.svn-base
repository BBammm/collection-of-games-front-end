import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { AuthService } from './auth.service';
import { MessageService } from './message.service';

@Injectable({
    providedIn: 'root'
})
export class EventService {
    private sound = new Subject<any>();
    private logStatus = new Subject<any>();
    private point = new Subject<number>();
    private readCnt = new Subject<number>();
    private userPoint: number;
    private subject = new Subject<any>();
    private ticktock = new Subject<any>();

    public ngUnsubscribes = { baccarat: new Subject() };
    // public ngUnsubscribes = {baccarat: Subscription };
    // for dice start
    private gameResult = new Subject<any>();
    private gameStatus = new Subject<string>();
    // for dice end

    public amountSbj = new Subject<number>();
    public amount: any = [];
    public amountSource = new BehaviorSubject(this.amount);
    currentAmount = this.amountSource.asObservable();

    public amountFixSbj = new Subject<number>();
    public amountFix: any = [];
    public amountFixSource = new BehaviorSubject(this.amount);
    currentAmountFix = this.amountFixSource.asObservable();


    /**
     * 게임 사운드 변경용
     * @params Object obj {gameSound: bool}
     */
    public setSound(obj: any): void {
        this.sound.next(obj);
    }
    public getSound(): Observable<any> {
        return this.sound.asObservable();
    }

    /**
     * 게임 사운드 변경용
     * @params Object obj {gameSound: bool}
     */
    public setLogStatus(bool: boolean): void {
        this.logStatus.next(bool);
    }
    public getLogStatus(): Observable<boolean> {
        return this.logStatus.asObservable();
    }

    /**
     * 포인트 변경
     * @params Object obj {gameSound: bool}
     */
    public setPoint(point: number): void {
        this.userPoint = point;
        this.authSvc.updateUser('point', point);
        this.point.next(point);
    }
    public getPoint(): Observable<any> {
        return this.point.asObservable();
    }
    public addPoint(point: number): void {
        this.point.next(this.userPoint + point);
    }

    /**
     * 베팅금액 변경
     */
    public setAmount(amount: number): void {
        this.amountSource.next(amount);
    }
    public getAmount(): Observable<any> {
        return this.amountSbj.asObservable();
    }

    /**
     * 베팅금액 고정
     */
    public setFixAmount(fix: number): void {
        this.amountFixSource.next(fix);
    }
    public getFixAmount(): Observable<any> {
        return this.amountFixSbj.asObservable();
    }

    /**
     * setReadCount
     */
    public setReadCount(count: number): void {
        this.readCnt.next(count);
    }
    public getReadCount(): Observable<any> {
        return this.readCnt.asObservable();
    }


    /**
     * @param Object obj {key, value}
     * key : gameStatus, value : start:플레이진행, ing:플레이진행중, end:플레이끝, ready:대기중 : 현재 진행 status bar show;
     */
    public sendMessage(obj: any): void {
        this.subject.next(obj);
    }

    public clearMessage(): void {
        this.subject.next();
    }

    public getMessage(): Observable<any> {
        return this.subject.asObservable();
    }

    public setTicktock(obj: any): void {
        this.ticktock.next(obj);
    }

    public getTicktock(): Observable<any> {
        return this.ticktock.asObservable();
    }

    // for dice start
    public setDiceGameResult(obj: any): void {
        this.gameResult.next(obj);
    }

    public getDiceGameResult(): Observable<any> {
        return this.gameResult.asObservable();
    }

    public setDiceGameStatus(str: string): void {
        this.gameStatus.next(str);
    }

    public getDiceGameStatus(): Observable<any> {
        return this.gameStatus.asObservable();
    }

    constructor(
        public authSvc: AuthService,
        public messageSvc: MessageService,
    ) { }
}
