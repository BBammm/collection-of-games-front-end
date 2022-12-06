import { Component, Injector, OnInit, ViewEncapsulation, OnDestroy, AfterContentInit } from '@angular/core';
import { Game } from '../game';
import { InterfaceMineMyGame } from '../../../interface/games/mine.my.game';
import { GAME_MINE, GAMES } from '../../../../environments/environment';

@Component({
    selector: 'app-mine',
    templateUrl: './mine.component.html',
    styleUrls: ['./mine.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class MineComponent extends Game implements OnInit, OnDestroy, AfterContentInit {
    // private miner_class: string; // mouseover mousedown mouseup

    public cGameInfo = {
        result: null,
        gameId: null,
        level: 1,
        betAmount: 0,
        betHist: [],
        gameTiles: [],
        hash: null,
        salt: null,
        answer: null,
        createdAt: null,
        next: null,
        failNum: null,
        stake: null
    };
    // 현재 게임 진행용 {id, userId, level, result, betAmount, step} 완료된 결과를 기준으로 한다.
    // gameTiles : {pressed: false, bomb: false, reveal: false} pressed : title 선택, bomb 폭탄을 눌렀을 경, revel 단순 폭탄만 보여줌

    // private selTab = 'recents'; // mygame

    public myGames: InterfaceMineMyGame[] = []; // 진행한 게임 리스트 (브라우저 오픈시 부터 시작함) 겜임완료시 이곳에 데이타 들어감
    // public myGamesHistory: InterfaceMineMyGame[] = []; // 최근 20게임에 대한 List
    public recentGame: any = [];
    public answerCode: any;
    public isDone = false;
    public isBet: boolean;
    public isBetInit = false;
    public isProgressing: boolean;
    public betAmount = 0;
    public nextGameId: number;
    private dividendRate: any = { 1: [], 3: [], 5: [], 24: [] }; // 모든 display rate 저장

    constructor(
        protected injector: Injector,
    ) {
        super(injector);
        this.titleSvc.setTitle('MINE');
        this.assetsUrl = { images: './assets/games/mine/images/', sounds: './assets/games/mine/sounds/' };
        this.setGameSound();
    }

    public ngOnInit(): void {
        this.ngInit();
        this.socket.init(GAME_MINE.game, GAME_MINE.socketUrl);

        this.requestOtt();

        this.iconRegistry
            .addSvgIcon('bomb', this.sanitizer.bypassSecurityTrustResourceUrl(this.assetsUrl.images + 'bomb.svg'))
            .addSvgIcon('bomb-b', this.sanitizer.bypassSecurityTrustResourceUrl(this.assetsUrl.images + 'bomb-boom.svg'))
            .addSvgIcon('bomb-b1', this.sanitizer.bypassSecurityTrustResourceUrl(this.assetsUrl.images + 'bomb-boom1.svg'))
            .addSvgIcon('bomb-01', this.sanitizer.bypassSecurityTrustResourceUrl(this.assetsUrl.images + 'bomb-01.svg'))
            .addSvgIcon('bomb-03', this.sanitizer.bypassSecurityTrustResourceUrl(this.assetsUrl.images + 'bomb-03.svg'))
            .addSvgIcon('bomb-05', this.sanitizer.bypassSecurityTrustResourceUrl(this.assetsUrl.images + 'bomb-05.svg'))
            .addSvgIcon('bomb-24', this.sanitizer.bypassSecurityTrustResourceUrl(this.assetsUrl.images + 'bomb-24.svg'))
            .addSvgIcon('bomb-011', this.sanitizer.bypassSecurityTrustResourceUrl(this.assetsUrl.images + 'bomb-011.svg'))
            .addSvgIcon('bomb-031', this.sanitizer.bypassSecurityTrustResourceUrl(this.assetsUrl.images + 'bomb-031.svg'))
            .addSvgIcon('bomb-051', this.sanitizer.bypassSecurityTrustResourceUrl(this.assetsUrl.images + 'bomb-051.svg'))
            .addSvgIcon('bomb-241', this.sanitizer.bypassSecurityTrustResourceUrl(this.assetsUrl.images + 'bomb-241.svg'))
            ;

        // gameTiles 초기화
        this.resetTiles();
    } // end of constructor

    public ngOnDestroy(): void {
        this.ngDestroy();
    }

    private setGameSound(): void {
        this.setDefaultSound();
        this.addSound('bomb', this.assetsUrl.sounds + 'bomb.mp3');
        this.addSound('dig', this.assetsUrl.sounds + 'digging.mp3');
    }

    public ngAfterContentInit(): void {
        // this.a = false;
    }

    private requestOtt(): void {
        // 서버에 접근하여 실제 userinfo를 가져온다.
        this.isBetInit = true;
        this.http.requestOtt(GAME_MINE.game, (paramObj) => {
            if (paramObj.error === false) {
                /*
                *@param resp : user: {}, ingGame: {}, dividend
                */
                this.socket.Emit(GAME_MINE.game, 'join', { ott: paramObj.ott }, (err: string, resp: any) => {
                    if (err) {
                        console.error('Error when joining the game...', err);
                        return;
                    }

                    console.log(resp);
                    this.dividendRate = resp.dividend;
                    // 현재 진행되는 게임정보를 받아와서 초기화 시킨다.
                    // this.serverTime = resp.serverDateTime; // 서버와의 시간동기화를 위한 서버 시간
                    this.dividendRate = resp.dividend;
                    // this.setDisplayDividendRate();

                    // 외부 연동 (게임 리스트 보내기)
                    if (typeof resp === 'undefined') { // 회원정보를 수신 못한 경우
                        return;
                    }

                    if (resp.ingGame) {
                        this.cGameInfo.gameId = resp.ingGame.gameId;
                        this.cGameInfo.level = resp.ingGame.gameLevel;
                        this.cGameInfo.betAmount = resp.ingGame.betAmount;
                        this.cGameInfo.hash = resp.ingGame.hash;
                        this.betAmount = resp.ingGame.betAmount;
                        //                            this.cGameInfo.betHist = resp.ingGame.betHist;
                        for (const betHist of resp.ingGame.betHist) {
                            this.setBetHistories(betHist);
                        }
                        this.isBet = true;
                        this.isProgressing = true;

                        this.createGameDisplay();
                    }

                    if (!resp.user) { // 회원정보를 수신 못한 경우
                        return;
                    }

                    const reversedMyGame = resp.bets.reverse(); // connecDataObj.games 도 동시에 reversㄷ 됨
                    for (const rev of reversedMyGame) {
                        this.addMyGames(rev);
                    }
                    // 모든 게임이 입력된 후 현재 진행중인 게임이 있으면 이것도 추가로 입력한다.
                    if (resp.ingGame) {
                        this.addMyGames({
                            id: resp.ingGame.gameId,
                            // bet_hist: JSON.parse(JSON.stringify(resp.ingGame.betHist)),
                            betHist: resp.ingGame.betHist,
                            bet_hist: resp.ingGame.betHist.toString(),
                            bet_amount: resp.ingGame.betAmount,
                            result: 'R',
                            win_amount: 0,
                            created_at: resp.createdAt
                            }
                        );
                    }

                    this.setMyGameList(this.myGames);

                    // If userName is a falsey value the user is not logged in
                    this.userInfo.name = resp.user.name;
                    this.userInfo.id = resp.user.userId;
                    this.eventSvc.setPoint(resp.user.point);
                    this.recentGame.hash = this.cGameInfo.hash;
                    this.nextGameId = this.cGameInfo.gameId;
                });
            }
        }).finally(() => {
            setTimeout(() => {
                this.isBetInit = false;
            }, 1000);
        });
    }

    /**
     * @param String main : LH, RB, NO
     */
    public createGame(): void {
        this.cGameInfo.betAmount = this.betAmount;
        this.answerCode = null;
        this.isDone = false;
        if (this.userInfo.id === 0 || this.userInfo.point === 0) {
            return this.transSystemMessage('games.alert.NO_LOGIN');
        } else if (this.cGameInfo.gameId !== null) {
            return this.transSystemMessage('games.alert.IN_PROGRESS');
        } else if (this.cGameInfo.betAmount < GAMES.minBet) {
            return this.transSystemMessage('games.alert.minBet', { minBet: GAMES.minBet });
        } else if (this.cGameInfo.betAmount > GAMES.maxBet) {
            return this.transSystemMessage('games.alert.maxBet', { maxBet: GAMES.maxBet });
        } else if (this.cGameInfo.betAmount > this.userInfo.point) {
            return this.transSystemMessage('games.alert.NOT_ENOUGH_MONEY');
        } else {

            this.resetTiles();
            this.isProgressing = true;

            const betObject = { betAmount: this.betAmount, gameLevel: this.cGameInfo.level }; // roundNo 및 userId는 서버측에서 계산
            this.socket.Emit(GAME_MINE.game, 'createGame', betObject, (err: string, resp: any) => {
                if (err) {
                    this.svcMessage(err);
                } else {
                    this.isBet = true;
                    const point = resp.currentPoint - this.cGameInfo.betAmount;
                    this.eventSvc.setPoint(point);

                    this.cGameInfo.gameId = resp.gameId;
                    this.cGameInfo.hash = resp.hash;
                    this.cGameInfo.createdAt = resp.createdAt;

                    this.createGameDisplay();
                    this.playGameSound('start');
                    this.recentGame.hash = this.cGameInfo.hash;
                    this.addMyGames({
                        id: resp.gameId,
                        bet_hist: '',
                        bet_amount: betObject.betAmount,
                        result: 'R',
                        win_amount: 0,
                        created_at: resp.createdAt
                    });
                    this.setMyGameList(this.myGames);

                }
            });
        }
    }

    /**
     * when user digging mine
     */
    public digging(selVal: number): void {
        if (this.cGameInfo.gameId) {
            const betObject = { gameId: this.cGameInfo.gameId, selVal: (selVal + 1) }; // roundNo 및 userId는 서버측에서 계산
            this.socket.Emit(GAME_MINE.game, 'doBet', betObject, (err: string, resp: any) => { // resp {selVal, betResult}
                if (err) {
                    this.svcMessage(err);
                } else {
                    // salt는 fail이 난 경우만 수신됨
                    this.receiveBetResult(resp);
                    this.eventSvc.setAmount(this.betAmount);

                    if (this.myGames[0].id === betObject.gameId) {
                        if (resp.betResult === 0 ) {
                            this.myGames[0].result = 'F';
                        } else {
                            if (this.myGames[0].bet_hist) {
                                const betHist = this.myGames[0].bet_hist.split(',');
                                betHist.push(resp.selVal);
                                this.myGames[0].bet_hist = betHist.toString();
                            } else {
                                this.myGames[0].bet_hist = resp.selVal.toString();
                            }
                        }
                    }
                }
            });
        } else {
            return this.transSystemMessage('games.alert.NOT_START');
        }
    }

    /**
     * @param Object obj {setVal, betResult}; // IF betResult === 1
     * @param Object obj {selVal, betResult, hash, salt, answer
     */
    private receiveBetResult(obj: any): void {

        this.cGameInfo.result = obj.result;
        if (obj.betResult === 0) { // 게임 실패시 초기화
            // myGames 에 history 저장
            // salt // 게임실패시 서버로 부터 salt값 및 결과 array(resultInfo)를 전달 받는다.
            this.cGameInfo.salt = obj.salt;
            this.cGameInfo.answer = obj.answer;

            this.showAll(obj.answer);
            this.setBetHistories(obj.selVal, false);

            // 게임 초기화
            this.addMyGames1();
            this.resetGame();
            this.playGameSound('bomb');
        } else {
            this.setBetHistories(obj.selVal);
            this.createGameDisplay();
            this.playGameSound('dig');
        }
    }

    /**
     * 입력된 값을 이용하여 현재 상세 진행단계의 값을 세팅한다.
     */
    private setBetHistories(val: number, ok?: boolean): void {
        val = val - 1;
        if (ok === false) {
            this.cGameInfo.gameTiles[val].won = null;
            this.cGameInfo.gameTiles[val].bomb = true;

            this.cGameInfo.result = 0;
            this.cGameInfo.failNum = val + 1;
        } else {
            this.cGameInfo.betHist.unshift(val);
        }
        this.cGameInfo.gameTiles[val].pressed = true;
        this.cGameInfo.gameTiles[val].won = this.dividendRate[this.cGameInfo.level][this.cGameInfo.betHist.length - 1] * this.cGameInfo.betAmount;
    }
    /*
        private betHisToArray(his: string) {
            const arr = his.split(',');
            const history = [];
            for (const i in arr) {
                if (arr.hasOwnProperty(i)) {
                    history.push(parseInt(arr[i], 10));
                }
            }
            return history;
        }
        */

    // 게임 마지막 단계 (실패하거나 돈을 획득했을때)
    // 서버로 부터 salt를 획득(결과값도 동시에 획득)후 디스플레이 한다.
    private showAll(answer: number[]): void {
        for (const an of answer) {
            this.cGameInfo.gameTiles[(an - 1)].reveal = true;
        }
    }

    // 포인트 획득하기 (게임 중지)
    public cashOut(): void {
        if (this.cGameInfo.betHist.length === 0) {
            return this.transSystemMessage('games.alert.NOT_START');
        }
        if (this.cGameInfo.gameId !== null) {
            this.isProgressing = false;
            // this.setMyGameList(this.myGames);
            this.socket.Emit(GAME_MINE.game, 'cashOut', this.cGameInfo.gameId, (err: string, resp: any) => {
                /* resp {answer, betHist, betAmount, dividendRate, gameLevel, gameId, hash, id: userId, result,
                    salt, winAmount }
                */
                if (err) {
                    this.svcMessage(err);
                } else {
                    //    const winMessage = resp.winAmount + '(X ' + resp.dividendRate + ') 획득';
                    // this.userInfo.point += resp.winAmount;
                    this.eventSvc.addPoint(resp.winAmount);
                    // stop 후 현재 금액에 획득 금액을 더해서 사용자 포인트를 업데이트 시킨다.

                    this.showAll(resp.answer);

                    this.cGameInfo.answer = resp.answer;
                    this.cGameInfo.salt = resp.salt;
                    this.cGameInfo.result = resp.result;

                    for (const game of this.myGames) {
                        if (game.id === this.cGameInfo.gameId) {
                            game.result = 'S';
                            game.win_amount = resp.winAmount;
                            // this.getMyGameList();
                        }
                    }

                    // 모든 내용을 초기화 시킨다.
                    this.addMyGames1();
                    this.resetGame();
                    this.playGameSound('chip');
                }
            });
        } else if (this.cGameInfo.gameId === null) {
            return this.transSystemMessage('games.alert.NOT_START');
        } else {
            return this.transSystemMessage('games.alert.NO_GAIN_MONEY');
        }
    }

    public setLevel(level: number): void {
        // 난이도는 게임 진행중에는 변경 불가능하므로 먼저 현제 게임이 진행중인지 확인한다.
        if (this.cGameInfo.gameId !== null) {
            return this.transSystemMessage('games.alert.NOT_AVAILABLE_CHANGE_LEVEL');
        } else {
            this.cGameInfo.level = level;
            this.resetTiles(); // 화면 클리어
        }

        this.playGameSound('select');
        // this.setDisplayDividendRate();
    }

    /**
     * cGameInfo 의  next: null, stake: null 를 각각 제어
     */
    private createGameDisplay(): void {
        const g = this.cGameInfo;
        const len = g.betHist.length;

        this.cGameInfo.stake = this.cGameInfo.betAmount;
        this.cGameInfo.next = this.dividendRate[this.cGameInfo.level][len] * this.cGameInfo.betAmount;
        for (let i = 0; i < len; i++) {
            const next = this.dividendRate[this.cGameInfo.level][i] * this.cGameInfo.betAmount;
            this.cGameInfo.stake = this.cGameInfo.stake + next;
        }

    }

    /**
     * @param Object obj {betAmount, createdAt, gameId, gameLevel, hash, result, salt, step
     */
    private addMyGames1(): void {
        // this.myGames.unshift(JSON.parse(JSON.stringify(this.cGameInfo)));
        // if (this.myGames.length > 10) { // front End의 최근 100게임 통계를 위해 200개를 저장해 둔다.
        //     this.myGames.splice(-1, 1);
        // }
        this.recentGame = JSON.parse(JSON.stringify(this.cGameInfo));
        // this.recentGame = this.myGames[0];
        console.log('this.recentGame = ', this.recentGame);
        const answer = this.recentGame.answer.join(',');
        console.log('answer = ', answer);
        this.answerCode = answer + '-' + this.recentGame.salt;
        this.isDone = true;
        this.isProgressing = false;
    }

    /**
     * @param Object obj {gamdId, gameLevel, betAmount, winAmount, bet_hist, result, hash, salt, lastHash, createdAt}
     */
    private addMyGames(obj: any): void {
        this.myGames.unshift(obj);

        if (this.myGames.length > 100) {
            this.myGames.pop();
        }
        this.nextGameId = this.myGames[0].id;
    }

    private resetGame(): void {

        this.cGameInfo.result = null;
        this.cGameInfo.gameId = null;
        this.cGameInfo.betHist = [];
        this.cGameInfo.gameTiles = [];
        this.cGameInfo.hash = null;
        this.cGameInfo.salt = null;
        this.cGameInfo.answer = null;
        // this.cGameInfo.next = null;
        this.cGameInfo.failNum = null;
        // this.cGameInfo.stake = null;
    }

    private resetTiles(): void {
        this.cGameInfo.gameTiles = [];

        for (let i = 0; i < 25; i++) {
            // this.gameTiles.push({step: i, order: null, result: null});
            this.cGameInfo.gameTiles.push({ pressed: false, bomb: false, reveal: false, won: null });
        }
    }
}
