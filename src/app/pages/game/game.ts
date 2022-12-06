import { Injector } from '@angular/core';

import { Title } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { Globals } from '../../services/globals';
import { InterfaceUserInfo } from '../../interface/game-userinfo';
import { takeUntil } from 'rxjs/operators';
import { copyToClipboard } from '../../functions/common';
import { SnackbarService } from '../../services/snackbar.service';
import { GameTransactionService } from '../../services/game-transaction.service';
import { ModalGameHistoryComponent } from '../../global-item/games-log/modal-game-history.component';
import { SocketMultiService } from 'ng-node-socket';
import { HttpService } from '../../services/http.service';
import { EventService } from '../../services/event.service';
import { FairnessComponent } from '../../global-item/fairness/fairness.module';
import { InterfaceMyGameResult } from '../../interface/games/my.game.result';
import { Howl } from 'howler';
import { ModalManualComponent } from '../../global-item/modal-manual/modal-manual.component';
import { ActivatedRoute } from '@angular/router';
import { ThrowStmt } from '@angular/compiler';
export class Game {

    // audioCoinChange;
    protected gameSound: boolean;
    protected animationFrameId: number;

    protected socket: SocketMultiService;
    protected http: HttpService;
    protected eventSvc: EventService;
    protected titleSvc: Title;
    protected translate: TranslateService;
    protected gameTranSvc: GameTransactionService;

    protected sounds: any = {};
    protected globals: Globals;
    protected ngUnsubscribe = new Subject();

    protected iconRegistry: MatIconRegistry;
    protected sanitizer: DomSanitizer;
    protected dialog: MatDialog;

    public userInfo: InterfaceUserInfo = { id: 0, name: '', point: 0 };
    public displayPoint: number; // 실제 출력단에서 사용할 포인트로 픽 결과 진행완료 후 현재 포인트를 변경한다.
    public betAmount = 0;
    public fixAmountFlag = true;
    public assetsUrl: any;
    public myGamesHistory = []; // 최근 20게임에 대한 List
    public recentGamesHistory = []; // 최근 20게임에 대한 List
    public isSoundOn = true;
    protected myGameResult: InterfaceMyGameResult; // 내 게임 결과

    private snackbarSvc: SnackbarService;

    constructor(
        protected injector: Injector,

    ) {
        this.socket = this.injector.get(SocketMultiService);
        this.http = this.injector.get(HttpService);
        this.eventSvc = this.injector.get(EventService);
        this.titleSvc = this.injector.get(Title);
        this.translate = this.injector.get(TranslateService);
        this.globals = this.injector.get(Globals);
        this.iconRegistry = this.injector.get(MatIconRegistry);
        this.sanitizer = this.injector.get(DomSanitizer);
        this.snackbarSvc = this.injector.get(SnackbarService);
        this.gameTranSvc = this.injector.get(GameTransactionService);
        this.dialog = this.injector.get(MatDialog);
    }

    protected ngInit(): void {
        this.gameSound = this.globals.gameSound;

        // 포인트 변경 처리
        this.eventSvc.getPoint()
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((point: number) => {
            this.userInfo.point = point;
        });

        // 게임사운드 status change detect
        this.eventSvc.getSound()
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((message: any) => {
            this.gameSound = message.gameSound;
            if (!this.gameSound) {
                this.pauseAllSound();
            }
        });

        this.eventSvc.currentAmountFix.subscribe(res => {
            console.log(res);
            this.fixAmountFlag = res;
        });
        this.eventSvc.currentAmount.subscribe(res => {
            if( res.length !== 0 && this.fixAmountFlag) {
                console.log(res);
                this.betAmount = res;
            }
        });
    }

    protected ngDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
        this.pauseAllSound();

        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }

    protected setDefaultSound(): void {
        const commonSound =  './assets/games/common/sounds/';
        this.addSound('alert', commonSound + 'alert.mp3'); // alert sound
        this.addSound('select', commonSound + 'select.mp3'); // fire when item selected
        this.addSound('chip', commonSound + 'chip.mp3'); // fire when amount selected
        this.addSound('start', commonSound + 'start.mp3'); // fie when betting
    }

    protected addSound(name: string, file: string): void {
        this.sounds[name] = new Howl({
            src: [file],
            preload: true,
        });
    }
    /**
     * @param String sound : play, wailt, alert
     */
    protected playGameSound(sound: string): void {
        if (this.gameSound) {
            this.sounds[sound].play();
        }
    }

    protected pauseGameSound(sound: string): void {
        this.sounds[sound].pause();
    }

    protected pauseAllSound(): void {
        for (const sound in this.sounds) {
            if (this.sounds.hasOwnProperty(sound)) {
                this.sounds[sound].pause();
            }
        }
    }

    /**
     * @param String flag : up, down
     */
    public setBetAmount(amount: number): void {
        this.betAmount = amount;
        this.playGameSound('chip');
    }

    public resetBetAmount(): void {
        this.betAmount = 0;
        this.playGameSound('chip');
    }

    protected systemMessage(str: string, delaytime?: number, sound?: string, snackbarType?: string): void {
        delaytime = delaytime ? delaytime : 800;
        sound = sound ? sound : 'alert';
        this.playGameSound(sound);
        this.snackbarSvc.show(str, { timeout: delaytime, type: snackbarType });
    }

    public opneManual(title: any) {
        const dialogRef = this.dialog.open(ModalManualComponent, {
            data: {
                title,
            },
            panelClass: 'game-manual-modal'
        });
        dialogRef.afterClosed().subscribe(() => {
        });
    }

    /**
     * 고정금액 체크모드
     */
     public autoMode(e: any): void {
        this.eventSvc.setFixAmount(e.checked);
    }

    protected transSystemMessage(str: string, transoption?: any, delaytime?: number, sound?: string, snackbarType?: string): void {
        // console.log(snackbarType);
        this.translate.get(str, transoption)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((value) => {
            this.systemMessage(value, delaytime, sound, snackbarType);
        });
    }

    protected snackbarShow(str: string, snackbarType?: string): void {
        this.snackbarSvc.show(str, { type: snackbarType });
    }

    protected svcMessage(str: string): void {
        switch (str) {
            case 'NO_LOGIN':
                this.transSystemMessage('games.alert.NO_LOGIN');
                break;
            case 'USER_NOT_FOUND':
                this.transSystemMessage('games.alert.USER_NOT_FOUND');
                break;
            case 'NOT_ENOUGH_MONEY':
                this.transSystemMessage('games.alert.NOT_ENOUGH_MONEY');
                break;
            case 'NOT_AVAILABLE_TIME':
                this.transSystemMessage('games.alert.NOT_AVAILABLE_TIME');
                break;
            case 'ALREADY_PLACED_BET':
                this.transSystemMessage('games.alert.ALREADY_PLACED_BET');
                break;
            case 'NEED_TO_BET_OVER_THAN_ZERO':
                this.transSystemMessage('games.alert.selBetAmount');
                break;
            case 'SELECT_TILES':
                this.transSystemMessage('games.alert.SELECT_TILES');
                break;
            default:
                this.systemMessage(str);
                break;
        }
    }

    /**
     * copyHash (추측 Hash에서 아이콘 클릭시)
     */
    public copyToClipboard(str: string): void {
        if (!str) {
            return;
        }
        copyToClipboard(str);
        // this.snackbarSvc.show('Copied', { type: 'success', timeout: 1000 });
        this.transSystemMessage('system.copied', null, null, 'start', 'success');
        // this.snackbarService.show('copied', { timeout: 1000, type: 'success' });
    }

    /**
     * 게임전체 히스토리 모달창
     */
    public openHistoryModal(title: string, type: number): void {
        const dialogRef = this.dialog.open(ModalGameHistoryComponent, {
            data: {
                title,
                type,
                list: {
                    recent: this.recentGamesHistory,
                    my: this.myGamesHistory,
                }
            },
            panelClass: 'game-history-modal'
        });

        dialogRef.afterClosed().subscribe(() => {

        });
    }
    /**
     * 공정성 검사 모달창
     */
    public proveModal(title: string): void {
        const dialogRef = this.dialog.open(FairnessComponent, {
            data: {
                title
            },
            panelClass: 'game-fairness-modal'
        });

        dialogRef.afterClosed().subscribe(() => {

        });
    }

    /**
     * 내 게임 20개 갖고오기 (더보기 클릭 시 전체로 이동)
     */
    protected setMyGameList(games: any): void {
        this.myGamesHistory = [];
        let i = 0;
        for (const game of games) {
            if (i >= 10) {
                return;
            }
            this.myGamesHistory.push(game);
            i++;
         }
    }

    /**
     * 최근 게임 10개 갖고오기 (더보기 클릭 시 전체로 이동)
     */
     protected setRecentGameList(games: any): void {
        this.recentGamesHistory = [];
        let i = 0;
        for (const game of games) {
            if (i >= 10) {
                return;
            }
            this.recentGamesHistory.push(game);
            i++;
        }
    }

    /**
     * 사용자 베팅 결과 출력
     * @param String result : S | F
     */
    protected displayUserGameResult(mygame: InterfaceMyGameResult , callback: () => void): void {
        if (mygame && mygame.result) {
            if (mygame.result === 'F') {
                this.translate.get('games.alert.resultFail', { round: mygame.game_id })
                    .pipe(takeUntil(this.ngUnsubscribe))
                    .subscribe((value) => {
                        this.systemMessage(value, 2000);
                    });
            } else {
                this.translate.get('games.alert.resultSuccess', { round: mygame.game_id  })
                    .pipe(takeUntil(this.ngUnsubscribe))
                    .subscribe((value) => {
                        this.systemMessage(value, 2000, null, 'success');
                    });
            }
            callback();
        }

    }

    /**
     * SoundOnOff
     */
    public soundOnOff(e: boolean): void {
        this.gameSound = e;
        this.globals.gameSound = e;

        if (!this.gameSound) {
            this.pauseAllSound();
        } else {
            this.globals.gameSound = true;
        }
    }

}
