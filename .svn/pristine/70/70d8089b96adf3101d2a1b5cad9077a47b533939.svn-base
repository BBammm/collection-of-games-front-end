import { Component, Injector, OnInit, OnDestroy } from '@angular/core';
import { Game } from '../game';
import { InterfaceLadderGame } from '../../../interface/games/ladder.game';
import { InterfaceLadderMyGame } from '../../../interface/games/ladder.my.game';

import { trigger, transition, query, style, animate } from '@angular/animations';

import { GAME_LADDER, GAMES } from '../../../../environments/environment';
import { takeUntil } from 'rxjs/operators';
import { Howl } from 'howler';
import { forEach } from 'lodash';
import { GameTimer } from '../../../services/game-timer';
import { MatDialog } from '@angular/material/dialog';
// import { ModalLadderFairnessComponent } from '../../../global-item/modal-ladder-fairness/modal-ladder-fairness.component';

const gameInterval = 60; // 30초
const aniRunTime = 8000; // 6초 (실제 애니메이션 그리기 시간은 2.3초)
const aniDrawingTime = 2300;

@Component({
    selector: 'app-ladder',
    templateUrl: './ladder.component.html',
    styleUrls: ['./ladder.component.scss', './ladder.animation.scss'],
    animations: [
        trigger('timeBarTrigger', [
            transition('* => init', [
                // animate ('duration delay easing')
                query(':self', style({ width: '{{iniWidth}}%' })),
                query(':self', animate('{{duration}}ms linear', style({ width: '0%' }))),
            ], { params: { duration: 20000, iniWidth: 100 } }),
            transition('* => active', [
                // animate ('duration delay easing')
                query(':self', style({ width: '100%' })),
                query(':self', animate('{{duration}}ms linear', style({ width: '0%' }))),
            ], { params: { duration: 20000 } })
        ])
    ]
})
export class LadderComponent extends Game implements OnDestroy, OnInit {
    //  {hash: '', id: 0, resultCode: 0, color: 'zero'} - rfaaling 이 끝날때 업데이트 한다.
    private games: InterfaceLadderGame[] = [];
    private myGames: InterfaceLadderMyGame[] = [];

    public LatestGames: any = { id: 0, resultCode: '' };
    public nextGameId: number;
    public betInfo = { betted: false, betAmount: 0, betItem: null };

    public dataDepth: string;
    public dataStart: string;
    public animationPlay: string;
    // animState: string; // inprocess | null
    // betAvailable = true;

    public winItems = { 'LR:R': true, 'LR:L': true, 'LI:3': true, 'LI:4': true, 'OE:O': true, 'OE:E': true, 'ALL:L3E': true, 'ALL:L4O': true, 'ALL:R3O': true, 'ALL:R4E': true };

    // public next_roundNo: number;

    public dividendRate = { LI: 0, LR: 0, OE: 0, ALL: 0 };

    public recentAnalysis = {
        sampling_cnt: 20,
        lr: { l: 0, r: 0, l_ratio: 0, r_ratio: 0 },
        oe: { o: 0, e: 0, o_ratio: 0, e_ratio: 0 },
        li: { t: 0, f: 0, t_ratio: 0, f_ratio: 0 },
        all: { l3e: 0, l4o: 0, r3o: 0, r4e: 0, l3e_ratio: 0, l4o_ratio: 0, r3o_ratio: 0, r4e_ratio: 0 }
    }; // sampling_cnt: 20, 50, 100, 200

    public players = [];
    private participants: any = {};
    // resultNum = 0; // resultNum은 소켓에서 받아오고 raffling 이 시작되면 resultNumAttr에 전송된다.
    // resultNumAttr = {hash: null, id: 0, resultCode: null, roundNo: null}; // zero, red, balck
    // private gameResult: any = null; // 내 게임 결과

    public recentGame: any = [];
    public betType = '';
    public isBetInit = false;
    public isProgressing: boolean;

    public gameStatus = 'pause'; // bet : 베팅가능, anim : 애니메이션 플레이, pause: 중지 (create 후 )
    // 결과전송 -> anim: aniRunTime(6초) -> bet -> paus:(결과 전송 2초전 )

    public betAmount = 0;
    public betedCount = { 'LR:L': 0, 'LR:R': 0, 'LI:3': 0, 'LI:4': 0, 'OE:O': 0, 'OE:E': 0, 'ALL:L3E': 0, 'ALL:L4O': 0, 'ALL:R3O': 0, 'ALL:R4E': 0 }; // for display
    public choice: string = null;
    public systemMessageState = 'inactive';
    public copyMessageState = 'inactive';

    public systemMessageString = '';

    private serverTime: Date = null; // 서버 시간을 가져와서 세팅시킨다(connection 및 매 게임 결과 전송시 리셋 시킨다.)
    private gameTimer = null;
    public timerInfo: any = { next_no: 0, countdown_ii: 0, countdown_ss: 0, remainsecond: 0, remainTime: '-', ramainTimeGraph: 0, c_datetime: '-' };
    public timeBarState = 'inactive';
    public timeBarParams = { duration: 20000, iniWidth: 100 }; // delay: 0,

    constructor(
        protected injector: Injector,
        public dialog: MatDialog,
    ) {
        super(injector);
        this.titleSvc.setTitle('LADDER');
        this.assetsUrl = { images: './assets/games/ladder/images/', sounds: './assets/games/ladder/sounds/' };
        this.setGameSound();
    }

    public ngOnInit(): void {
        this.ngInit();

        this.socket.init(GAME_LADDER.game, GAME_LADDER.socketUrl);
        this.requestOtt();

        this.timeBarParams.duration = gameInterval * 1000;

        // this.socket.On('connection') 아래에 다른 On 을 둘 경우 서버 connection이  재 실행될 경우 여러개가 호출됨
        /**
         * @param Object data[0] {hash: "a8e36959c0012f24984ad75ee63031a17e315d60aa456c783e5a787ab9c9d1fc", id: 1000078, resultCode: 4, roundNo}
         */
        this.socket.On(GAME_LADDER.game, 'game_created')
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((data: any) => {
                const obj: any = data[0];

                console.log('game_created...');

                // 시간 보정
                if (this.gameTimer) {
                    this.gameTimer.refreshNowDateTime(obj.serverDateTime);
                }

                obj.result_code = obj.resultCode;
                this.addGames(obj);
                this.animationStart();
                this.latestGame(obj);

                this.timeBarParams.duration = gameInterval * 1000;
                this.timeBarState = 'inactive';

                setTimeout(() => {
                    this.timeBarState = 'active';
                }, 100);
            });

        /**
         * 모든 게임참여자 정보
         * [{betAmount, selVal, gameId, userInfo: {id, name, point}}]
         */
        this.socket.On(GAME_LADDER.game, 'player_bet')
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((data: any) => {
                const participant = data[0].participant;
                this.participants[participant.userInfo.id] = participant;
                this.showPlayers(this.participants);
                // print bet list
            });

        /**
         * 자신이 참여한 게임 결과 (실제적으로는 게임 create 시 받아오나 애니메이션상 결과가 공개될때 메시지 출력(displayUserGameResult()))
         * betAmount, choice, created_at, dividendRate, gameId, id, result, user_id, winAmount}
         */
        this.socket.On(GAME_LADDER.game, 'game_result')
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((data: any) => {
                this.myGameResult = {game_id: data[0].gameId, result: data[0].result, win_amount: data[0].winAmount};
                if (this.myGames[0].game_id === data[0].gameId) {
                    this.myGames[0].result = data[0].result;
                    this.myGames[0].win_amount = data[0].winAmount;
                }
            });
    }

    public ngOnDestroy(): void {
        this.ngDestroy();
        this.gameTimer.stopTimer();
    }

    private setGameSound(): void {
        this.setDefaultSound();
        this.addSound('beep', this.assetsUrl.sounds + 'beep.mp3');
    }

    private requestOtt(): void {

        this.isBetInit = true;
        // 서버에 접근하여 실제 userInfo 가져온다.
        // paramObj : {result: boolean, "code"=>number as string, "ott": string, "tester"=>0|1
        this.http.requestOtt(GAME_LADDER.game, (paramObj: any) => {
            if (paramObj.error === false) {
                this.socket.Emit(GAME_LADDER.game, 'join', { ott: paramObj.ott }, (err: any, resp: any) => {
                    if (err) {
                        console.error('Error when joining the game...', err);
                        return;
                    }
                    // 현재 진행되는 게임정보를 받아와서 초기화 시킨다.
                    this.serverTime = resp.serverDateTime; // 서버와의 시간동기화를 위한 서버 시간
                    this.startTimer();

                    // const reversed = resp.games.reverse(); // connecDataObj.games 도 동시에 reversㄷ 됨

                    this.games = [];
                    for (const entry of resp.games) {
                        entry.result_code = entry.resultCode;
                        this.addGames(entry, 'reverse');
                    }

                    this.setRecentGameList(this.games);

                    this.latestGame(resp.games[0]);
                    // this.initSpriteStyle();
                    this.setHistorySum();

                    this.setNextGameId();
                    // this.calredBlackRatio();

                    this.dividendRate = resp.dividend;
                    this.participants = resp.participants;
                    this.showPlayers(resp.participants);
                    if (!resp.user) { // 회원정보를 수신 못한 경우
                        return;
                    }

                    const reversedMyGame = resp.bets.reverse(); // connecDataObj.games 도 동시에 reversㄷ 됨
                    for (const rev of reversedMyGame) {
                        this.addMyGames(rev);
                    }

                    this.setMyGameList(this.myGames);
                    // If username is a falsey value the user is not logged in
                    this.userInfo.name = resp.user.name;
                    this.userInfo.id = resp.user.id;
                    this.displayPoint = resp.user.point;
                    this.eventSvc.setPoint(resp.user.point);

                    if (resp.bets[0]) {
                        this.searchBetinfo(resp.bets[0]);
                    }
                });
            } else {
                console.warn(paramObj.message);
            }
        }).finally(() => {
            setTimeout(() => {
                this.isBetInit = false;
            }, 1000);
        });
    }

    /**
     * L4O: 좌4홀, L3E: 좌3짝, R4E: 우4짝, R3O: 우3홀
     */
    private animationStart(): void {
        console.log('animationStart');
        // .cw01[data-depth='3'][data-start='1'] .ele_1{animation:trans_colorOdd2 100ms forwards ease-out;}
        // this.dataDepth = '3';
        // this.dataStart = '1';
        // 애니메이션 시간 : 2.3초
        this.gameStatus = 'anim';
        const resultCode = this.games[0].result_code;
        const LR = resultCode.substr(0, 1);
        const LI = resultCode.substr(1, 1);
        const OE = resultCode.substr(2, 1);

        this.isProgressing = true;

        switch (resultCode) {
            case 'L4O':
                this.dataDepth = '4';
                this.dataStart = '1';
                break;
            case 'L3E':
                this.dataDepth = '3';
                this.dataStart = '1';
                break;
            case 'R4E':
                this.dataDepth = '4';
                this.dataStart = '2';
                break;
            case 'R3O':
                this.dataDepth = '3';
                this.dataStart = '2';
                break;

        }
        // 애니메이션 드로잉 종료 : 결과 출력
        setTimeout(() => {

            console.log('aniDrawingTime start', aniDrawingTime);
            this.winItems = { 'LR:R': false, 'LR:L': false, 'LI:3': false, 'LI:4': false, 'OE:O': false, 'OE:E': false, 'ALL:L3E': false, 'ALL:L4O': false, 'ALL:R3O': false, 'ALL:R4E': false };
            this.winItems['LR:' + LR] = true;
            this.winItems['LI:' + LI] = true;
            this.winItems['OE:' + OE] = true;
            this.winItems['ALL:' + resultCode] = true;
            this.choice = '';

            this.displayUserGameResult(this.myGameResult, () => {
                // 포인트 변경
                if (this.myGameResult && this.myGameResult.result === 'S') {
                    const point = this.userInfo.point + this.myGameResult.win_amount;
                    this.displayPoint = point;
                    this.eventSvc.setPoint(point);
                }
                this.myGameResult = null;
            }); // 사용자 베팅결과 출력
        }, aniDrawingTime);

        // 총애니메이션 끝
        setTimeout(() => {
            // 현재 cardAnim은 "?" 나오게
            this.animationEnd();
            this.setHistorySum();
            this.setRecentGameList(this.games);
            this.setMyGameList(this.myGames);
            this.setNextGameId();
            this.isProgressing = false;
        }, aniRunTime);
    }

    private animationEnd(): void {
        this.gameStatus = 'bet';
        this.dataDepth = null;
        this.dataStart = null;
        this.winItems = { 'LR:R': true, 'LR:L': true, 'LI:3': true, 'LI:4': true, 'OE:O': true, 'OE:E': true, 'ALL:L3E': true, 'ALL:L4O': true, 'ALL:R3O': true, 'ALL:R4E': true };
        this.betInfo = { betted: false, betAmount: 0, betItem: null };
        this.players = [];
        this.participants = {};
        this.displayPoint = this.userInfo.point;

    }

    /**
     * @param Object obj {hash: "87407746a124ed77b38ecd2c9ed2f18b84c6d8eec4bfa854625b99a00f2dee9b", id: 1000090, resultCode: 13}
     */
    private addGames(obj: any, direct?: string): void {
        if (obj.resultCode === null) { return; }
        obj.resultCode = obj.resultCode;
        if (direct === 'reverse') { // 초기 데이타 최근에서 -> older
            this.games.push(obj);
        } else {
            this.games.unshift(obj);
        }

        if (this.games.length > 200) {
            this.games.pop();
        }
        this.isProgressing = false;
    }

    /**
     * 내가 참여했던 게임 결과를 이곳에 저장해 둔다.
     */
    private addMyGames(obj: any): void {
        this.myGames.unshift(obj);

        if (this.myGames.length > 100) {
            this.myGames.pop();
        }
    }

    private latestGame(obj: any): void {
        // let resultStr: string;
        // this.LatestGames.roundNo = obj.roundNo;
        this.LatestGames.id = obj.id;
        this.LatestGames.resultCode = obj.resultCode;
    }

    private setHistorySum(): void {
        const tmpRecentAnalysis = {
            lr: { l: 0, r: 0, l_ratio: 0, r_ratio: 0 },
            oe: { o: 0, e: 0, o_ratio: 0, e_ratio: 0 },
            li: { t: 0, f: 0, t_ratio: 0, f_ratio: 0 },
            all: { l3e: 0, l4o: 0, r3o: 0, r4e: 0, l3e_ratio: 0, l4o_ratio: 0, r3o_ratio: 0, r4e_ratio: 0 }
        };

        forEach(this.games, (game: any, i: number) => {
            if (i >= this.recentAnalysis.sampling_cnt) {
                return false;
            }

            const LR = game.resultCode.substr(0, 1);
            const LI = game.resultCode.substr(1, 1);
            const OE = game.resultCode.substr(2, 1);

            if (LR === 'L') {
                tmpRecentAnalysis.lr.l++;
            } else {
                tmpRecentAnalysis.lr.r++;
            }

            if (LI === '3') {
                tmpRecentAnalysis.li.t++;
            } else {
                tmpRecentAnalysis.li.f++;
            }

            if (OE === 'E') {
                tmpRecentAnalysis.oe.e++;
            } else {
                tmpRecentAnalysis.oe.o++;
            }

            switch (game.resultCode) {
                case 'L3E':
                    tmpRecentAnalysis.all.l3e++;
                    break;
                case 'L4O':
                    tmpRecentAnalysis.all.l4o++;
                    break;
                case 'R3O':
                    tmpRecentAnalysis.all.r3o++;
                    break;
                case 'R4E':
                    tmpRecentAnalysis.all.r4e++;
                    break;
            }
        });

        const total = { lr: 0, li: 0, oe: 0, all: 0 };
        total.lr = tmpRecentAnalysis.lr.l + tmpRecentAnalysis.lr.r;
        total.li = tmpRecentAnalysis.li.t + tmpRecentAnalysis.li.f;
        total.oe = tmpRecentAnalysis.oe.e + tmpRecentAnalysis.oe.o;
        total.all = tmpRecentAnalysis.all.l3e + tmpRecentAnalysis.all.l4o + tmpRecentAnalysis.all.r3o + tmpRecentAnalysis.all.r4e;

        this.recentAnalysis.lr = tmpRecentAnalysis.lr;
        this.recentAnalysis.lr.l_ratio = parseInt((tmpRecentAnalysis.lr.l / total.lr * 100).toString(), 10);
        this.recentAnalysis.lr.r_ratio = parseInt((tmpRecentAnalysis.lr.r / total.lr * 100).toString(), 10);

        this.recentAnalysis.li = tmpRecentAnalysis.li;
        this.recentAnalysis.li.t_ratio = parseInt((tmpRecentAnalysis.li.t / total.li * 100).toString(), 10);
        this.recentAnalysis.li.f_ratio = parseInt((tmpRecentAnalysis.li.f / total.li * 100).toString(), 10);

        this.recentAnalysis.oe = tmpRecentAnalysis.oe;
        this.recentAnalysis.oe.o_ratio = parseInt((tmpRecentAnalysis.oe.o / total.oe * 100).toString(), 10);
        this.recentAnalysis.oe.e_ratio = parseInt((tmpRecentAnalysis.oe.e / total.oe * 100).toString(), 10);

        this.recentAnalysis.all = tmpRecentAnalysis.all;
        this.recentAnalysis.all.l3e_ratio = parseInt((tmpRecentAnalysis.all.l3e / total.all * 100).toString(), 10);
        this.recentAnalysis.all.l4o_ratio = parseInt((tmpRecentAnalysis.all.l4o / total.all * 100).toString(), 10);
        this.recentAnalysis.all.r3o_ratio = parseInt((tmpRecentAnalysis.all.r3o / total.all * 100).toString(), 10);
        this.recentAnalysis.all.r4e_ratio = parseInt((tmpRecentAnalysis.all.r4e / total.all * 100).toString(), 10);
    }

    private startTimer(): void { // 초기 1회 세팅
        if (this.gameTimer != null) {
            return;
        }
        //    this.gameStatus = 'bet';
        let firstReceive = false;
        const gamePlaytime = gameInterval - (aniRunTime / 1000);
        // this.gameTimer = this.timerService.gameTimer({timeInterval: gameInterval}).getInstance();
        this.gameTimer = new GameTimer({ timeInterval: gameInterval });
        this.gameTimer.countdownStart(this.serverTime, (obj: any) => { // Object {next_no: 178, countdown_ii: 3, countdown_ss: 33}
            this.timerInfo = obj;
            if (this.timerInfo.remainsecond <= 2) {
                this.gameStatus = 'pause';
            } else if (this.timerInfo.remainsecond < gamePlaytime) {
                this.gameStatus = 'bet';
            }

            if (this.timerInfo.remainsecond <= 4 || this.timerInfo.remainsecond >= 53) {
                if (this.timerInfo.remainsecond === 4) {
                    this.playGameSound('beep');
                }
                this.animationPlay = 'on';
            } else {
                this.animationPlay = null;
            }

            this.timerInfo.remainTime = obj.countdown_ss + '초';
            if (!firstReceive) {
                firstReceive = true;

                this.timeBarParams.duration = obj.countdown_ss * 1000;
                this.timeBarParams.iniWidth = this.timeBarParams.duration * 100 / (gameInterval * 1000);
                this.timeBarState = 'init';
            }
        });
        // this.initBetButtonAvailable();
    }
    /*
        private initBetButtonAvailable() {
            if (this.timerInfo.remainsecond) {
                if (this.timerInfo.remainsecond > 10 || this.timerInfo.remainsecond < 100) {
                 //  this.betAvailable = true;
                }
            } else {
                setTimeout(() => {
                    this.initBetButtonAvailable();
                }, 500);
            }
        }
    */
    /**
     * @param String main : LH, RB, NO
     */
    public doBet(): void {
        // this.choice = main + ':' + sub;
        if (!this.userInfo.id) {
            return this.transSystemMessage('games.alert.NO_LOGIN');
        } else if (this.choice === null) {
            return this.transSystemMessage('games.alert.selBetItem');
        } else if (this.gameStatus !== 'bet') {
            return this.transSystemMessage('games.alert.NOT_AVAILABLE_TIME');
        } else if (this.betAmount < GAMES.minBet) {
            return this.transSystemMessage('games.alert.minBet', { minBet: GAMES.minBet });
        } else if (this.betAmount > GAMES.maxBet) {
            return this.transSystemMessage('games.alert.maxBet', { maxBet: GAMES.maxBet });
        } else if (this.betAmount > this.userInfo.point || this.userInfo.point === 0) {
            return this.transSystemMessage('games.alert.NOT_ENOUGH_MONEY');
        } else {
            // gameId 및 roundNo는 서버에 저장시 별도로 저장됨
            // this.setbetedCount();
            this.isProgressing = true;
            const betObject = {
                betAmount: this.betAmount, selVal: this.choice,
                gameId: null, roundNo: 0, dividendRate: this.calDividenRate(this.choice)
            }; // roundNo 및 user_id는 서버측에서 계산
            this.socket.Emit(GAME_LADDER.game, 'doBet', betObject, (err: string, resp: any) => {

                if (err) {
                    this.svcMessage(err);
                } else {
                    const point = resp.currentPoint - this.betAmount; // 실제 업체측 데이타와 동기화
                    this.displayPoint = point; // 실제 업체측 데이타와 동기화
                    this.eventSvc.setPoint(point);
                    this.eventSvc.setAmount(this.betAmount);
                    this.transSystemMessage('games.alert.BETTED', null, null, 'start', 'success');
                    betObject.gameId = resp.gameInfo.id + 1;
                    betObject.roundNo = resp.gameInfo.roundNo + 1;
                    this.setBetInfo({ betted: true, betAmount: this.betAmount, betItem: this.choice });

                    this.addMyGames({
                        game_id: betObject.gameId,
                        choice: betObject.selVal,
                        bet_amount: betObject.betAmount,
                        result: 'R',
                        win_amount: 0,
                        created_at: new Date()
                    });
                    this.setMyGameList(this.myGames);
                }
            });
        }
    }

    private calDividenRate(choice: string): void {
        const tmp = choice.split(':');
        return this.dividendRate[tmp[0]];

    }

    /**
     * 참여자 리스트 디스플레이
     * @param Object players [{user_id : {betAmount, selVal, gameId, userInfo: {id, name, point}}}]
     */
    private showPlayers(players: any): void {
        this.players = [];
        this.betedCount = { 'LR:L': 0, 'LR:R': 0, 'LI:3': 0, 'LI:4': 0, 'OE:O': 0, 'OE:E': 0, 'ALL:L3E': 0, 'ALL:L4O': 0, 'ALL:R3O': 0, 'ALL:R4E': 0 };

        forEach(players, (player: any) => {
            const tmpsp = player.selVal.split(':');
            const betInfo = tmpsp[1];
            const tmp = { betAmount: player.betAmount, bet_result: null, dividendRate: player.dividendRate, betInfo, selVal: player.selVal, userName: player.userInfo.name };
            this.betedCount[player.selVal]++;
            this.players.push(tmp);
        });
    }

    private setNextGameId(): void {
        this.nextGameId = this.games[0].id + 1;
    }

    public setHistoryCnt(cnt: number): void {
        this.recentAnalysis.sampling_cnt = cnt;

        this.setHistorySum();
    }

    /**
     * @param Object obj {betted: true, betAmount: this.betAmount, betItem: this.choice})
     */
    private setBetInfo(obj: any): void {
        if (obj.betted) {
            this.betInfo = obj;
            this.winItems = { 'LR:R': false, 'LR:L': false, 'LI:3': false, 'LI:4': false, 'OE:O': false, 'OE:E': false, 'ALL:L3E': false, 'ALL:L4O': false, 'ALL:R3O': false, 'ALL:R4E': false };
            this.winItems[obj.betItem] = true;
        }
    }

    /**
     * 내가 베팅 한 정보 중에서 현재 게임아이디가 있는지 체크
     */
    private searchBetinfo(obj: any): void {
        if (obj && obj.gameId === (this.games[0].id + 1)) {
            // 베팅이 된상태 유지
            this.betAmount = obj.betAmount;
            this.setBetInfo({ betted: true, betAmount: obj.betAmount, betItem: obj.choice });
            this.isProgressing = true;
        }

    }

    /**
     * 어디에 걸지 셋팅
     */
     public setBetType(main: string, sub: string): void {
        this.choice = main + ':' + sub;
    }
}
