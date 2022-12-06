import { Component, Injector, OnInit, OnDestroy, ViewChild, HostListener } from '@angular/core';
import { Game } from '../game';
import { InterfaceGraphGame } from '../../../interface/games/graph.game';
import { InterfaceGraphMyGame } from '../../../interface/games/graph.my.game';
import { Observable, Subject } from 'rxjs';
import { GAME_GRAPH, GAMES } from '../../../../environments/environment';
import { takeUntil } from 'rxjs/operators';
import { forEach } from 'lodash';
import { GraphLib } from './clib.service';
import { GraphicDisplayService } from './graphicDisplay';

@Component({
    selector: 'app-graph',
    templateUrl: './graph.component.html',
    styleUrls: ['./graph.component.scss']
})

export class GraphComponent extends Game implements OnDestroy, OnInit {
    public betSize = 0;
    public autoCashOut = 2;
    public cashOutEnable = false;

    // from engine.service
    // gameStateDisplay = '게임 진행중';
    public cashedOutMe: any = null; // when cashouted save that info,  whenever gameState is ENDED this is reseted
    public gameButton: string = null;
    // private gameButtonDisplay: string = null; // 버튼 출현 4단계에 대한 속성값을 계산한다.
    // private lastHash: string = null;
    public cashingOut = false; // graphgame에서 사용
    // private countDownIntervalId = null;
    public lastBalance: number;
    // private prevBalance: number;
    // private prevOrderNum = 0;
    public nextGameId: number;

    // trUsersPlaying:string;//우측  베팅 사용자 리스트 출력용
    public trUsersPlaying = []; // 우측  베팅 사용자 리스트 출력용
//    public trHistory = []; // 우측  History
    public tabSel = 'History'; // Playing, History, MyBet
    // private betTabSel = 'manualBet';
    // 우측 users-playing 리스트 하단에 디스플레이되는 베팅 내용
    public betPercentages: any = { cashedWonClass: 0, mePlayingClass: 0, cashedWonAfter: 0, playingLostClass: 0 };

    // private player_bet = false;
    public betMessage: string;
    public playerBet = false; // 베팅 가능 여부

    // Auto betting starting
    private settings: any = {
        autoScript: null, baseBet: 1, baseBetMin: 1, autoCashAt: 2, maxBetStop: 500000,
        onLossSelectedOpt: 'return_to_base', onLossIncreaseQty: 2, onWinSelectedOpt: 'return_to_base',
        onWinIncreaseQty: 2
    };

    private betState = null;
    public isBetInit = false;
    public isProgressing: boolean;

    public innerWidth: number;

    // 아래부터는 engins service에서 넘어온 내용

    // private maxBet = GAMES.maxBet;

    /** Object containing the current game players and their status, this is saved in game history every game crash
     * cleared in game_starting.
     * e.g: { user1: { bet: satoshis, stopped_at: 200 }, user2: { bet: satoshis } }
     */
    public playerInfo = null; // [{bet, name}] graphicDisplay에서 사용

    /**
     * The state of the game
     * Possible states: IN_PROGRESS, ENDED, STARTING
     */
    public gameState = null;

    /* Creation time of current game. This is the server time, not clients.. */
    private created = null;

    /** The game id of the current game */
    private gameId = null;

    /** How much can be won this game */
    // private maxWin = null;

    /**
     * if the game is pending, startTime is how long till it starts
     * if the game is running, startTime is how long its running for
     * if the game is ended, startTime is how long since the game started
     */
    public startTime = null; // graphic Display에서 사용

    /** If you are currently placing a bet
     * True if the bet is queued
     * True if the bet was sent to the server but the server has not responded yet
     *
     * Cleared in game_started, its possible to receive this event before receiving the response of
     */
    // private placingBet = false;

    /** True if cashing out.. */
    // private cashingOut = false;

    private joined = []; // [name1, name2]
    private joinedObj = []; // [{name}, {}] joined를 점차 joinedObj으로 변경예정(서버 파트부터 변경하여야 할 듯)
//    public tableHistory: any; // graphicDisplay에서 사용
    // private lastGameTick;

    /**
     * If a number, how much to bet next round
     * Saves the queued bet if the game is not 'game_starting', cleared in 'bet_placed' by us and 'game_started' and 'cancel bet'
     */
    public nextBetAmount = null;

    /** Complements nextBetAmount queued bet with the queued autoCashOut */
    public nextAutoCashout = null;

    /* Store the id of the timer to check for lag **/
    private tickTimer = null;

    /* Tell if the game is lagging but only  when the game is in progress **/
    private lag = false;
    // set current game properties

    // private lastHash: string;

    public games: InterfaceGraphGame[] = [];
    public myGames: InterfaceGraphMyGame[] = [];

    // trigger:any;//engin server에서 볼수 있는 다양한 트리거 처리

    private gamestateObserv = new Subject<any>();
    private lastHashObserv = new Subject<any>();
    private cashingOutObserv = new Subject<any>();
    private triggerObserv = new Subject<any>();

    // protected subject = new Subject<any>();
    /**
     * @param obj:any {state}
     * state : IN_PROGRESS, ENDED, STARTING
     */
    private setGameState(state: string): void {
        this.gameState = state;
        this.gamestateObserv.next(state);
        if (this.gameState === 'ENDED') {
            this.isProgressing = false;
            this.setMyGameList(this.myGames);
            this.setRecentGameList(this.games);
        }
    }
    private getGameState(): Observable<any> {
        return this.gamestateObserv.asObservable();
    }

    private setLastHash(hash: string): void {
        // this.lastHash = hash;
        this.lastHashObserv.next(hash);
    }

    // private getLastHash(): Observable<any> {
    //     return this.lastHashObserv.asObservable();
    // }

    private setCashingOut(cashingOut: boolean): void {
        this.cashingOut = cashingOut;
        this.cashingOutObserv.next(cashingOut);
    }
    // private getCashingOut(): Observable<any> {
    //     return this.cashingOutObserv.asObservable();
    // }

    private setEvents(obj: any): void {
        this.triggerObserv.next(obj);
    }
    private getEvents(): Observable<any> {
        return this.triggerObserv.asObservable();
    }

    // @HostListener('window:resize', ['$event.target'])
    @ViewChild('myCanvas') myCanvas;
    // @ViewChild(myCanvas);
    @ViewChild('playPannel') playPannel;

    @HostListener('window:resize', ['$event']) // 아래 onResize 와 붙어 있어야 함
    protected onResize(): void {
        this.innerWidth = window.innerWidth;
        this.set_ctx();
    }

    constructor(
        protected injector: Injector,

        private clib: GraphLib,

        // private snackbarService: SnackbarService,
        public graphicDisplay: GraphicDisplayService,
        // private eventService: GraphEventService,
    ) {
        super(injector);
        this.titleSvc.setTitle('GRAPH');
        this.assetsUrl = { images: './assets/games/graph/images/', sounds: './assets/games/graph/sounds/'};
        this.setGameSound();
    }

    public ngOnInit(): void {
        this.ngInit();
        this.socket.init(GAME_GRAPH.game, GAME_GRAPH.socketUrl);
        this.settings.baseBet = GAMES.minBet / 100;
        this.settings.baseBetMin = GAMES.minBet / 100;
//        this.cashOutEnable = true;
        this.innerWidth = window.innerWidth;

        this.iconRegistry
            .addSvgIcon('coin-r', this.sanitizer.bypassSecurityTrustResourceUrl(this.assetsUrl.images + 'coin-reset.svg'))
            .addSvgIcon('coin-s', this.sanitizer.bypassSecurityTrustResourceUrl(this.assetsUrl.images + 'coin-stop.svg'))
            .addSvgIcon('coin-v', this.sanitizer.bypassSecurityTrustResourceUrl(this.assetsUrl.images + 'coin-vetting.svg'))
            .addSvgIcon('coin-l', this.sanitizer.bypassSecurityTrustResourceUrl(this.assetsUrl.images + 'coin-login.svg'));
        this.startGraph();
        this.betSize = this.betAmount;

        /**
         * After Connect
         * Set playerInfo if logined
         */
        this.http.requestOtt(GAME_GRAPH.game, (paramObj) => {
            this.isBetInit = true;
            // obj.result is always true. ott is null or ott code if logined
            if (paramObj.error === false) {
                /*
                * point:15000
                * userId:333
                * created:"2018-07-06T06:39:32.772Z"
                * elapsed:35305
                * gameId:1051082
                * joined:[]
                * lastHash:"dcac9f37a42cbde18f1e09f52783e0a9732eeb1cbfe2aa0ad161471daca445d8"
                * max_win:3000000000093795
                * playerInfo:{20: {bet: 10000, stopped_at: 280, name: "4"}
                * roundNo:239
                * state:"IN_PROGRESS"
                * table_history:(21) [{…}, {…}]
                * name:"GraphGame"
                */

                this.socket.Emit(GAME_GRAPH.game, 'join', { ott: paramObj.ott }, (err: string, resp: any) => {

                    if (err) {
                        console.error('Error when joining the game...', err);
                        return;
                    }
                    // Variable to check if we are connected to the server
                    // this.isConnected = true;
                    this.setGameState(resp.state);
                    this.playerInfo = resp.playerInfo; // [{bet, name, stopped_at, userId}]
                    // set current game properties
                    this.gameId = resp.gameId;
                    this.setLastHash(resp.lastHash);
                    this.created = resp.created;
                    this.startTime = new Date(Date.now() - resp.elapsed);
                    this.joined = resp.joined; // 현재 조인 중일 경우만 디스플레이 그래프가 시작되면 [] 초기화 됨

                    // this.tableHistory = resp.table_history;
                    const reversedGame = resp.games.reverse();
                    for (const rev of reversedGame) {
                        rev.game_crash = rev.gameCrash;
                        rev.id = rev.gameId;
                        this.addGames(rev);
                    }

                    this.setRecentGameList(this.games);

                    //    if (this.gameState === 'IN_PROGRESS') {
                    //        this.lastGameTick = Date.now();
                    //    }
                    this.setEvents({ key: 'connected' });

                    if (!resp.user) { // 회원정보를 수신 못한 경우
                        return;
                    }

                    const reversedMyGame = resp.bets.reverse(); //
                    for (const rev of reversedMyGame) {
                        this.addMyGames(rev);
                    }
                    this.setMyGameList(this.myGames);

                    this.userInfo.id = resp.user.id;
                    this.userInfo.name = resp.user.name;
                    this.displayPoint = resp.user.point;
                    // this.userInfo.point = resp.point;
                    this.eventSvc.setPoint(resp.user.point);

                    // player 중에 내 정보가 있는지 확인
                    const playerList = resp.playerInfo;
                    forEach(playerList, (game: any) => {
                        if (game.userId === resp.userId) {
                            this.isProgressing = true;
                        }
                    });
                });
            }
        }).finally(() => {
            setTimeout(() => {
                this.isBetInit = false;
            }, 1000);
        });

        /**
         * Event called each 150ms telling the client the game is still alive
         * @param object data - JSON payload
         * @param number data.elapsed - Time elapsed since game_started
         */
        this.socket.On(GAME_GRAPH.game, 'game_tick')
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(() => {
                /** Time of the last tick received */
                //    this.lastGameTick = Date.now();
                if (this.lag === true) {
                    this.lag = false;
                }

                if (this.tickTimer) {
                    window.clearTimeout(this.tickTimer);
                }
                this.tickTimer = window.setTimeout(() => {
                    this.checkForLag();
                }, GAME_GRAPH.STOP_PREDICTING_LAPSE);
            });

        /** Socket io errors */
        this.socket.On(GAME_GRAPH.game, 'error')
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((params: any) => {
                const obj: any = params[0];
                this.setEvents({ key: 'error', data: obj });
            });

        /** Server Errors */
        this.socket.On(GAME_GRAPH.game, 'err')
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((params: any) => {
                const err: any = params[0];
                console.error('ws.on :: Server sent us the error: ', err);
            });

        /**
         * Event called at game crash
         * @param object data - JSON payload
         * @param number data.elapsed - Total game elapsed time
         * @param number data.gameCrash - Crash payout quantity in percent eg. 200 = 2x. Use this to calculate payout!
         * @param string data.hash - Revealed hash of the game
         */

        this.socket.On(GAME_GRAPH.game, 'game_crash')
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((params: any) => {

                const data: any = params[0];

                if (this.tickTimer) {
                    clearTimeout(this.tickTimer);
                }
                this.setLastHash(data.hash);
                const gameInfo = {
                    created_at: this.created,
                    ended: true,
                    game_crash: data.gameCrash,
                    id: this.gameId,
                    hash: data.hash,
                    salt: data.salt,
                    // playerInfo: this.playerInfo
                };

                // Add the current game info to the game history and if the game history is larger than 40 remove one element
                // if (this.tableHistory.length >= 40) {
                //     this.tableHistory.pop(); // remove end of element
                // }
                // this.tableHistory.unshift(gameInfo);
                this.addGames(gameInfo);

                // 내 베팅정보를 확인하여 cash_out 하지 않았으면 fail로 처리한다.
                if (this.myGames[0] && this.myGames[0].game_id === this.gameId && this.myGames[0].result === 'R') {
                    this.myGames[0].result = 'F';
                }

                // Clear current game properties
                this.setGameState('ENDED');
                this.setCashingOut(false);
                this.lag = false;

                // this.eventService.Events.trigger('gameCrash', data);
                this.setEvents({ key: 'gameCrash', data });
                // this.graphicDisplay.gameCrash(data);
            });

        /**
         * Event called before starting the game to let the client know when the game is going to start
         * @param object info - JSON payload
         * @param number info.gameId - The next game id
         * @param number info.time_till_start - Time lapse for the next game to begin
         */
        this.socket.On(GAME_GRAPH.game, 'game_starting')
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((params: any) => {
                const info: any = params[0];
                // this.joined = [];
                this.joinedObj = [];

                this.setGameState('STARTING');
                this.gameId = info.gameId;
                this.startTime = new Date(Date.now() + info.time_till_start);
                // this.maxWin = info.max_win;

                // Every time the game starts checks if there is a queue bet and send it
                if (this.nextBetAmount) {
                    this.doBet(this.nextBetAmount, this.nextAutoCashout, (err) => {
                        if (err) {
                            console.error('Response from placing a bet: ', err);
                        }
                    });
                }

                this.setEvents({ key: 'game_starting', data: info });
            });

        /**
         * Event called every time a user places a bet
         * the user that placed the bet could be me so we check for that
         * @param object resp - JSON payload
         * @param string resp.name - The player name
         * @param number resp.bet - The player bet in satoshis
         */
        this.socket.On(GAME_GRAPH.game, 'player_bet')
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((params: any) => {
                const data: any = params[0];
                if (this.userInfo.id === data.userId) {
                    //    this.placingBet = false;
                    this.nextBetAmount = null;
                    this.nextAutoCashout = null;
                }
                // replaces 0 element at data.index index // array.splice(start[, deleteCount[, item1[, item2[, ...]]]])
                this.joined.splice(data.index, 0, data.userId);
                this.joinedObj.splice(data.index, 0, { userId: data.userId, name: data.name });
                this.setEvents({ key: 'player_bet', data });
            });

        /**
         * Event called at the moment when the game starts
         * @param Object bets
         * {17 : {autoCashOut:120
         * bet:5000
         * gameId:1051141
         * playId:33728953
         * status:"PLAYING"
         * user:{id: 17, name: "꽃뚜레"}
         * }
         */
        this.socket.On(GAME_GRAPH.game, 'game_started')
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((params: any) => {
                const bets: any = params[0];
                this.joined = [];
                this.joinedObj = [];
                this.setGameState('IN_PROGRESS');
                this.startTime = Date.now();
                //    this.lastGameTick = this.startTime;
                //    this.placingBet = false;
                this.nextBetAmount = null;
                this.nextAutoCashout = null;
                this.playerInfo = {};
                // 게임이 시작되면 bets를 받아서 다시한번 playerInfo를 재 구성한다.
                // bets : [{autoCashOut, bet, gameId, playId, status, user: {id, name, point, tester, userIp}}]
                Object.keys(bets).forEach((userId) => {

                    this.playerInfo[userId] = {
                        bet: bets[userId].bet,
                        name: bets[userId].user.name,
                    };
                });
                this.setEvents({ key: 'game_started', data: this.playerInfo });
            });

        /**
         * Event called every time the server cash out a user
         * if we call cash out the server is going to call this event
         * with our name.
         * @param object resp - JSON payload {id: 226, name: "가문의방광", stopped_at: 260}
         * @param string resp.name - The player name
         * @param number resp.stopped_at -The percentage at which the user cashed out
         */
        this.socket.On(GAME_GRAPH.game, 'cashed_out')
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((params: any) => {

                const resp: any = params[0];

                // Add the cashout percentage of each user at cash out
                if (!this.playerInfo[resp.id]) {
                    return;
                    // return console.warn('UserId not found in playerInfo at cashed_out: ', resp.id);
                }

                this.playerInfo[resp.id].stopped_at = resp.stopped_at;

                if (this.userInfo.id === resp.id) {
                    this.setCashingOut(false);
                    resp.won = this.playerInfo[resp.id].bet * resp.stopped_at;
                    // this.userInfo.point += this.playerInfo[resp.id].bet * resp.stopped_at / 100;
                    this.eventSvc.addPoint(this.playerInfo[resp.id].bet * resp.stopped_at / 100);
                    // 원본은 아래에 설정되어 있어 모든 회원들의 cashed_out 정보를 불러온다.//여기서 설정하는 이유는 나의 cashed-out만 보기 위해서
                    this.setEvents({ key: 'cashed_out_me', data: resp });
                }

                this.setEvents({ key: 'cashed_out', data: resp });
                // this.eventService.Events.trigger('cashed_out', resp);
            });

        /** Triggered by the server to let users the have to reload the page */
        this.socket.On(GAME_GRAPH.game, 'update')
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(() => {
                this.snackbarShow('Please refresh your browser! We just pushed a new update to the server!');
            });

        this.socket.On(GAME_GRAPH.game, 'disconnect').pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
            // this.isConnected = false;
            this.setEvents({ key: 'disconnected' });
            // this.eventService.Events.trigger('disconnected');
        });

    } // ngOnInit

    public ngOnDestroy(): void {
        this.graphicDisplay.cancelAmim();
        this.ngDestroy();
    }

    private setGameSound(): void {
        this.setDefaultSound();
    }

    private startGraph(): void {

        // STARTING  IN_PROGRESS ENDED
        this.getGameState()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((gameState: string) => {
                this.gameState = gameState;
                this.setGameButtonDisplay();
            });

        // return D.span(null, 'The game is starting in ', D.b(null, this.state.countdown), '...');
        // this.enginService.getLastHash()
        // .pipe(takeUntil(this.ngUnsubscribe))
        // .subscribe(lastHash => {
        //    this.lastHash = lastHash;
        // });
        // Cashout : 베팅후 stop을 누른 상태
        // this.enginService.getCashingOut()
        // .pipe(takeUntil(this.ngUnsubscribe))
        // .subscribe(cashingOut => {
        //     this.cashingOut = cashingOut;
        // });

        this.getEvents()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((trigger: any) => {

                if (trigger.key === 'connected') { // 초기화 관련 처리
                    this.graphicDisplay.game_connected();
                //    this.getGameLog();
                    this.set_ctx();
                    this.graphicDisplay.startDraw();
                }
                this.setGameButtonDisplay(trigger);

            });

        this.graphicDisplay.getLastBalance()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((lastBalance: number) => {
                this.lastBalance = lastBalance;
            });
    } // end of constructor

    /**
     * gameButton = 'PlaceBet', CashOut
     * gameCrash : 게임이 끝났을 경우
     * game_starting : 게임시작(0~5초);
     * game_started : 게임 진행중
     */
    private setGameButtonDisplay(...trigger: string[]): void {
        this.getUsersPlay();
        this.getUsersPlayBar();

        let obj: any = null;
        let isBetted = false;

        if (trigger.length === 1) { // getGameState 에서 넘어온 경우
            obj = trigger[0];
        } else { // getEvents 에서 넘오온 경우
            obj = { key: '' };
        }

        const key = obj.key;

        // this.nextBetAmount        = amount;
        // this.nextAutoCashout    = autoCashOut;
        // placing_bet > player_bet > bet _place (STARTING 에서 베팅하는 경우)
        // bet_queued > gameCrash > placing_bet > game_starting > player_bet > bet_placed (IN_PROGRESS에서 베팅되는 경우)
        switch (key) {
            case 'bet_queued': // 진행중인 경우 베팅하면 queue에 쌓인다.
            case 'gameCrash': // 게임이 완료된 경우
            case 'placing_bet': // 베팅을 입력하고 버튼을 눌렀을 경우
            case 'cancel_bet': // 베팅취소(bet_queued 사항에서만 가능)
            // case 'game_starting':
            // case 'player_bet'://중간단계(emit전으로 emit이후 성공결과는 bet_placed에서 처리한다.)
            case 'bet_placed': // 베팅이 성공적으로 입력된 경우
                this.betState = key;
                break;
            case 'cashed_out_me': // {'key':'cashed_out_me', 'data':resp}
                this.betState = key;
                this.cashedOutMe = obj.data;
                // 나의 게임정보를 업데이트 한다.
                this.myGames[0].result = 'S';
                this.myGames[0].win_amount = obj.data.won / 100;
                break;
            case 'timeLeft': // {'key':'cashed_out_me', 'data':resp}
                if (obj.data < 1.5) {
                    this.playerBet = false;
                }
                //    this.cashedOutMe = obj.data;
                break;
        }

        // 게임이 끝났을 경우 현재 게이머의 베팅 상태를 체크 한다.
        if (key === 'gameCrash') {
            isBetted = this.isBetting();
            if (isBetted) {
                this.betState = 'bet_queued';
            }
        }

        this.gameButton = 'PlaceBet';
        if (this.gameState !== 'ENDED') {
            if (this.games.length > 1) {
                this.nextGameId = (this.games[0].id + 1);
            }
        }
        switch (this.gameState) {
            case 'STARTING':
                switch (this.betState) {
                    case 'placing_bet':
                    case 'player_bet':
                    case 'bet_placed':
                        this.gameButton = 'PlaceBettedStarting';
                        break;
                }
                break;
            case 'IN_PROGRESS':
                this.playerBet = true;
                switch (this.betState) {
                    case 'bet_queued':
                        this.gameButton = 'PlaceBettedInProgress';
                        break;
                    case 'bet_placed':
                        this.gameButton = 'CashOut';
                        break;
                    case 'cashed_out_me':
                        if (this.cashedOutMe !== null) {
                            this.gameButton = 'CashOuted';
                        }
                        break;
                }
                break;
            case 'ENDED':
                this.cashedOutMe = null;
                switch (this.betState) {
                    case 'bet_queued':
                        this.gameButton = 'PlaceBettedInProgress';
                        break;
                }

                if (key === '') {
                //    this.getGameLog();
                }
                break;
        }

        // Cashed Out 메시지
        // 게임중 : Cashed Out @ 1.03x / Won:1.03 bits
        // 게임완료 후 : Cashed Out @ 1.03x / Won:1.03 bits (+0.01 bit nonus)
        /*switch (key) {
            case 'game_started': this.gameStateDisplay = '게임 진행중'; clearInterval(this.countDownIntervalId); break;
            case 'gameCrash': this.gameStateDisplay = '결과 @ ' + obj.data.gameCrash / 100 + 'X'; break;
            case 'cashed_out_me': this.gameStateDisplay = '출금 @ ' + (obj.data.stopped_at / 100) + 'x / Won:'
                + (obj.data.won / 100) + ' point'; break;
            // case 'game_starting':this.gameStartCountdown();break;
        }
        */
    }

    private set_ctx(): void {
        const canvas = this.myCanvas.nativeElement;
        canvas.width = 0;
        canvas.height = 0;
        canvas.width = this.myCanvas.nativeElement.parentNode.offsetWidth;
        canvas.height = this.myCanvas.nativeElement.parentNode.offsetHeight;
        const ctx: CanvasRenderingContext2D = canvas.getContext('2d');
        this.graphicDisplay.set_ctx(ctx, canvas, this);
    }

    public calBetSize(bet: number): void {
        this.betSize = bet;
        this.playGameSound('chip');
        this.betMessage = '';
    }

    /**
     * Button Action
     */
    public placeBet(): boolean {
        const betSize: number = this.betSize;
        const isInteger = this.clib.is_integer(betSize / 100);
        if (this.playerBet === false) { return; }
        if (isInteger === false) {
            this.transSystemMessage('games.alert.OVER_THAN_100');
            return false;
        } else if (betSize <= 0) {
            this.transSystemMessage('games.alert.OVER_THAN_100');
            return false;
        } else if (betSize > this.userInfo.point) {
            this.transSystemMessage('games.alert.NOT_ENOUGH_MONEY');
            return false;
        } else if (betSize < GAMES.minBet) {
            this.transSystemMessage('games.alert.minBet', { minBet: GAMES.minBet });
            return false;
        } else if (betSize > GAMES.maxBet) {
            // this.betMessage = '베팅금액은 최대 ' + GAMES.maxBet + ' 이하입니다.';
            this.transSystemMessage('games.alert.maxBet', { maxBet: GAMES.maxBet });
            return false;
        }
        this.betMessage = null;
        const autoCashOut = this.cashOutEnable ? this.autoCashOut : 10000000;
        this.bet(betSize, autoCashOut * 100, () => { });
        this.playGameSound('start');
        return true;
    }

    /**
     * Request the server to cash out
     * @param function callback - The callback to handle cash_out request errors
     */
    public cashOut(): void {
        this.setCashingOut(true);

        this.socket.Emit(GAME_GRAPH.game, 'cash_out', (error: string) => {
            if (error) {
                this.cashingOut = false;
                console.error(error);
                this.setEvents({ key: 'cashing_out' });
                // this.eventService.Events.trigger('cashed_out', resp);

            }
            this.playGameSound('start');
        });
    }

    /**
     * Cancels a bet, if the game state is able to do it so
     */
    public cancelBet(): void {
        if (!this.nextBetAmount) {
            return console.error('Can not cancel next bet, wasn\'t going to make it...');
        }
        this.nextBetAmount = null;
        //    this.placingBet = false;
        this.setEvents({ key: 'cancel_bet' });
    }

    /**
     * copyHash (추측 Hash에서 아이콘 클릭시)
     */
    public copyToClipboard(item: string): void {
        document.addEventListener('copy', (e: ClipboardEvent) => {
            e.clipboardData.setData('text/plain', (item));
            e.preventDefault();
            document.removeEventListener('copy', null);
        });
        document.execCommand('copy');
        // this.snackbarService.show('copied', { timeout: 1000, type: 'success' });
    }

    /**
     * 우측 user play list
     */
    private getUsersPlay(): void {

        // Users Playing and users cashed
        const usersWonCashed = [];
        let usersLostPlaying = [];

        // const game = this.enginService;
        let trUsersLostPlaying = [];
        let trUsersWonCashed = [];

        // Separate and sort the users depending on the game state
        // this.joinedObj : {userId, name}
        if (this.gameState === 'STARTING') {
            // The list is already ordered by engine given an index
            // game.joined : ['달팽이한마리', '낼시더']
            // game.joinedObj [{userId: 555, name: "바람의점심"}]
            usersLostPlaying = this.joinedObj.map((player) => {
                let bet: number; // can be undefined
                if (player.userId === this.userInfo.id) {
                    bet = this.nextBetAmount;
                }
                return { userId: player.userId, name: player.name, bet };
            });

        } else {
            forEach(this.playerInfo, (player: any, userId: string) => {
                player.userId = parseInt(userId, 10);

                if (player.stopped_at) {
                    usersWonCashed.push(player);
                } else {
                    usersLostPlaying.push(player);
                }
            });

            usersWonCashed.sort((a, b) => {
                const r = b.stopped_at - a.stopped_at;
                if (r !== 0) { return r; }
                return a.userId < b.userId ? 1 : -1;
            });

            usersLostPlaying.sort((a, b) => {
                const r = b.bet - a.bet;
                if (r !== 0) { return r; }
                return a.userId < b.userId ? 1 : -1;
            });

        }

        if (this.gameState === 'IN_PROGRESS' || this.gameState === 'STARTING') {
            let i: number;
            let length: number;

            trUsersLostPlaying = []; // 아직 베팅 전인 사용자

            for (i = 0, length = usersLostPlaying.length; i < length; i++) {
                const user = usersLostPlaying[i];
                const meclass = this.userInfo.id === user.userId ? ' me' : '';
                const bet = user.bet ? this.clib.formatDecimals(user.bet, 0) : '?';
                trUsersLostPlaying.push({
                    meclass: 'user-playing' + meclass, name: user.name, userId: user.userId,
                    stopped_at: '-', bet, profit: '-'
                });
            }

            trUsersWonCashed = [];
            for (i = 0, length = usersWonCashed.length; i < length; i++) {
                const user = usersWonCashed[i];
                const profit = this.clib.calcProfit(user.bet, user.stopped_at);
                const meclass = this.userInfo.id === user.userId ? ' me' : '';
                const bet = this.clib.formatDecimals(user.bet, 0);
                trUsersWonCashed.push({
                    meclass: 'user-cashed' + meclass, name: user.name, userId: user.userId,
                    stopped_at: (user.stopped_at / 100) + 'x', bet, profit: this.clib.formatDecimals(profit, 0)
                });
            }
            const tmp = trUsersLostPlaying.concat(trUsersWonCashed);

            this.trUsersPlaying = tmp;
            // Users Lost and users Won
        } else if (this.gameState === 'ENDED') {
            trUsersLostPlaying = []; // 아직 베팅 전인 사용자
            usersLostPlaying.map((entry) => {
                const bet = entry.bet;
                const profit = -bet;

                const strProfit = this.clib.formatDecimals(profit);
                const meclass = this.userInfo.id === entry.userId ? ' me' : '';
                trUsersLostPlaying.push({
                    meclass: 'user-lost' + meclass, name: entry.name, userId: entry.userId,
                    stopped_at: '-', bet: this.clib.formatDecimals(entry.bet, 0), profit: strProfit
                });
            });

            trUsersWonCashed = [];
            usersWonCashed.map((entry) => {
                const bet = entry.bet;
                const stopped = entry.stopped_at;
                const profit = bet * (stopped - 100) / 100;
                const strProfit = this.clib.formatDecimals(profit, 0);

                const meclass = this.userInfo.id === entry.userId ? ' me' : '';
                trUsersWonCashed.push({
                    meclass: 'user-won' + meclass, name: entry.name, userId: entry.userId,
                    stopped_at: (stopped / 100) + 'x', bet: this.clib.formatDecimals(bet), profit: strProfit
                });
            });

            const tmp = trUsersLostPlaying.concat(trUsersWonCashed);
            this.trUsersPlaying = tmp;
        }
    }

    // Bet bar 에 관한 계산
    private getUsersPlayBar(): void {
        // const engine = this.enginService;
        const betPercentages = this.calculatePlayingPercentages();
        //    let playingLostClass: string, cashedWonClass: string, mePlayingClass: string;

        if (this.gameState === 'ENDED') {
            //    playingLostClass = 'bet-bar-lost';
            //    cashedWonClass = 'bet-bar-won';
            //    mePlayingClass = engine.currentlyPlaying() ? 'bet-bar-me-lost' : 'bet-bar-me-won';
        } else {
            //    playingLostClass = 'bet-bar-playing';
            //    cashedWonClass = 'bet-bar-cashed';
            //    mePlayingClass = engine.currentlyPlaying() ? 'bet-bar-me-playing' : 'bet-bar-me-cashed';
        }
        this.betPercentages = {
            cashedWonClass: betPercentages.cashedWon, mePlayingClass: betPercentages.me,
            cashedWonAfter: betPercentages.cashedWonAfter, playingLostClass: betPercentages.playingLost
        };
    }

    /**
     * bitsPlaying: The total amount of bits playing(not cashed) minus your qty if you are playing
     * bitsCashedOut: The total amount of bits cashed before you if you are playing,
     * if you are not its the total cashed out amount minus your qty
     * bitsCashedOutAfterMe: If you are playing...
     * myBet: guess!
     */
    private calculatePlayingPercentages(): any {

        //    const engine = this.enginService;
        // If there are no players
        if (this.playerInfo === null || Object.getOwnPropertyNames(this.playerInfo).length <= 0) {
            return {
                playingLost: 0,
                cashedWon: 0,
                cashedWonAfter: 0,
                me: 0
            };
        }

        let bitsPlaying = 0;
        let bitsCashedOut = 0;
        let bitsCashedOutAfterMe = 0;

        const currentPlay = this.currentPlay();

        const myBet = currentPlay ? currentPlay.bet : 0;
        const myStop = (currentPlay && currentPlay.stopped_at) ? currentPlay.stopped_at : 0;

        forEach(this.playerInfo, (player: any, userId: string) => {
            if (!this.userInfo.id
                || parseInt(userId, 10) !== this.userInfo.id) {
                if (player.stopped_at) {
                    if (player.stopped_at > myStop) {
                        bitsCashedOutAfterMe += player.bet;
                    } else {
                        bitsCashedOut += player.bet;
                    }
                } else {
                    bitsPlaying += player.bet;
                }
            }
        });

        const totalAmountPlaying = bitsPlaying + bitsCashedOut + bitsCashedOutAfterMe + myBet;

        return {
            playingLost: bitsPlaying / totalAmountPlaying * 100,
            cashedWon: bitsCashedOut / totalAmountPlaying * 100,
            cashedWonAfter: bitsCashedOutAfterMe / totalAmountPlaying * 100,
            me: myBet / totalAmountPlaying * 100
        };
    }

    public resetCashOuted(): void {
        this.cashedOutMe = null;
        this.gameButton = 'PlaceBet';
        this.gameState = 'IN_PROGRESS';
    }

    /**
     * 0.01씩 auto cash out 조절
     */
    public setAutoCashOut(type: string): void {
        if (type === 'u') {
            this.autoCashOut = parseFloat((this.autoCashOut + 0.01).toFixed(2));
        } else {
            this.autoCashOut = parseFloat((this.autoCashOut - 0.01).toFixed(2));
        }
    }

    /* If the user is currently playing return and object with the status else null **/
    private currentPlay(): any {
        if (!this.playerInfo) {
            return null;
        }
        if (!this.userInfo.id) {
            return null;
        } else {
            return this.playerInfo[this.userInfo.id];
        }
    }

    /* True if you are playing and haven't cashed out **/
    public currentlyPlaying(): boolean { // graphicDisplay 에서 호출 됨
        const currentPlay = this.currentPlay();
        return currentPlay && currentPlay.bet && !currentPlay.stopped_at;
    }

    /* To Know if the user is betting **/
    private isBetting(): boolean {
        if (!this.userInfo.id) { return false; }
        if (this.nextBetAmount) { return true; }
        for (const join of this.joined) {
            if (join === this.userInfo.id) {
                return true;
            }
        }
        return false;
    }

    /**
     * STOP_PREDICTING_LAPSE milliseconds after game_tick we put the game in lag state
     */
    private checkForLag(): void {
        this.lag = true;
    }

    /**
     * Places a bet with a giving amount.
     * @param Number amount   - Bet amount in bits
     * @param Number autoCashOut  - Percentage of self cash out
     * @param function callback(err, result)
     */
    private bet(amount: number, autoCashOut: number, callback: (err: string, body?: any) => void): any {
        if (typeof amount !== 'number') {
            amount = parseInt(amount, 10);
        }
        if (typeof autoCashOut !== 'number') {
            autoCashOut = parseInt(autoCashOut, 10);
        }

        if (!this.clib.isInteger(amount) || !((amount % 100) === 0)) {
            return console.error('The bet amount should be integer and divisible by 100');
        }

        //    this.placingBet = true;
        if (this.gameState === 'STARTING') {
            return this.doBet(amount, autoCashOut, callback);
        }

        // 게임이 진행중이지 않을 경우 next에 값을 세팅해 둔다.
        this.nextBetAmount = amount;
        this.nextAutoCashout = autoCashOut;

        // otherwise, lets queue the bet
        if (callback) {
            callback(null, 'WILL_JOIN_NEXT');
        }

        this.setEvents({ key: 'bet_queued' });
    }

    // Actually bet. Throw the bet at the server.
    private doBet(amount: number, autoCashOut: number, callback: (err: string) => void): void {
        this.setEvents({ key: 'placing_bet' }); //
        this.isProgressing = true;
        // this.ws.emit('place_bet', amount, autoCashOut, function(error) {
        this.socket.Emit(GAME_GRAPH.game, 'place_bet', amount, autoCashOut, (err: string, resp: any) => {
            if (err) {
                console.warn('place_bet error: ', err);
                if (err !== 'GAME_IN_PROGRESS' && err !== 'ALREADY_PLACED_BET') {
                    console.error(err);
                }
                if (callback) {
                    callback(err);
                }
                return;
            }
            // this.userInfo.point = resp.point;
            this.eventSvc.setPoint(resp.point);
            this.eventSvc.setAmount(resp.betAmount);
            this.setEvents({ key: 'bet_placed' });

            // 배팅완료된 정보 디스플레이
            this.addMyGames({
                game_id: resp.gameId,
                bet_amount: resp.betAmount,
                result: 'R',
                win_amount: 0,
                created_at: new Date()
            });
            this.setMyGameList(this.myGames);

            if (callback) {
                callback(null);
            }
        });
    }

    /**
     * 모든 게임을 이곳에 저장해 둔다.
     * @param Object obj hash: "87407746a124ed77b38ecd2c9ed2f18b84c6d8eec4bfa854625b99a00f2dee9b", id: 1000090, result_number: 13}
     */
    private addGames(obj: any): void {
        // if (obj.result_number === null) { return; }
        // obj.color = this.raffleNumsAttr[obj.result_number].color;
        this.games.unshift(obj);

        if (this.games.length > 100) {
            this.games.pop();
        }
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

}
