import { Component, Injector, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { Game } from '../game';
import { InterfaceBaccaratMyGame } from '../../../interface/games/baccarat.my.game';
import { InterfaceBaccaratGame } from '../../../interface/games/baccarat.game';
import { forEach } from 'lodash';
import { GAME_BACCARAT, GAMES } from '../../../../environments/environment';
import { takeUntil } from 'rxjs/operators';
import { BaccratLib } from './baccarat.lib';
import { CLib } from '../../../services/common.lib';
import { CardsMoveAnimations } from './card/cards.move.animation';

@Component({
    selector: 'app-baccarat',
    templateUrl: './baccarat.component.html',
    styleUrls: ['./baccarat.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: [
        CardsMoveAnimations
    ]
})
export class BaccaratComponent extends Game implements OnDestroy, OnInit {
    // private ngUnsubscribe = new Subject();
      // node에서 받아오는 시스템 정보

    //  {hash: '', id: 0,  color: 'zero'} - rfaaling 이 끝날때 업데이트 한다.
    private games: InterfaceBaccaratGame[] = []; // {hash: null, salt: null, id: 0, resultCards: null,resultCodes: null, datetime: null}
    private myGames: InterfaceBaccaratMyGame[] = [];
    // public myGamesHistory: InterfaceBaccaratMyGame[] = []; // 참여내역 10게임에 대한 List
    public playCards = { player1: null, player2: null, banker1: null, banker2: null, playerMore: null, bankerMore: null };

    public nextGameId: number;
    // true : back, false: front;
    public cardFlips = { player1: true, player2: true, banker1: true, banker2: true, playerMore: true, bankerMore: true };
    public cardMoveState = { player1: 'inactive', player2: 'inactive', banker1: 'inactive', banker2: 'inactive', playerMore: 'inactive', bankerMore: 'inactive' };
    private playCardsSum = { player: 0, banker: 0 };
    public displayPlayCardsSum = { player: 0, banker: 0 };
    // 이겼을 경우 class 활성
    public gameStatus = 'ready'; // play : 애니메이션 시작(베팅안됨-gamecreate시), bet: 게임 베팅, ready : default;
    public roundProgress = { currentValue: 0, color: '#ffd740', duration: 25000 };

    public histories: any[] = [];
    public historyCnt = 200;
    public historySummary = { player: 0, tie: 0, banker: 0, pp: 0, pb: 0, playerPer: 0, tiePer: 0, bankerPer: 0 };
    public styles = { countDown: 'none' };

    /**
     * 초기는 PLAYER, BANKER, TIE 활성화
     * open 시 PAIR 존재시 활성화
     * 모두 오픈 후는 PLAYER, BANKER, TIE 중 선택된 것만 활성화
     */
    public boardActiveClass = { PLAYER: true, BANKER: true, TIE: true, PPAIR: true, BPAIR: true };
    public dividendRate: any = { player: null, banker: null, tie: null, pair: null };

    public players = [];
    private participants: any = {};
    // resultNum = 0; // resultNum은 소켓에서 받아오고 raffling 이 시작되면 resultNumAttr에 전송된다.
    // resultNumAttr = {hash: null, id: 0, resultCards: null}; // zero, red, balck
    // private gameResult: any = null; // 내 게임 결과
    // animationStartTime = {cardOpen: 0; bettingTime: 1500};

    // serviceInfo = baccaratGame.serviceInfo;
    // configUserinfo = baccaratGame.userinfo;

    public betedCount = { PLAYER: 0, BANKER: 0, TIE: 0, PPAIR: 0, BPAIR: 0 }; // for display
    private choice: string = null;

    //    private openedCardSum = {'2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, 'J': 0, 'Q': 0, 'K': 0, 'A': 0, 'JO': 0};
    private serverTime: Date = null; // 서버 시간을 가져와서 세팅시킨다(connection 및 매 게임 결과 전송시 리셋 시킨다.)
    // private gameTimer = null;

    public ticktock = 25;
    public isBetInit = false;
    public isBetted = false;
    public choiceColor: string;
    public isProgressing: boolean;
    public gameResult: any = {
        hash: null,
        salt: null
    };

    constructor(
        protected injector: Injector,
        private clib: CLib,
        private baccaratlib: BaccratLib
    ) {
        super(injector);
        this.titleSvc.setTitle('BACCARAT');
        this.assetsUrl = { images: './assets/games/baccarat/images/', sounds: './assets/games/baccarat/sounds/' };
        this.setGameSound();
    }

    public ngOnInit(): void {
        this.ngInit();
        this.socket.init(GAME_BACCARAT.game, GAME_BACCARAT.socketUrl);

        this.requestOtt();

        this.iconRegistry
            .addSvgIcon('clover', this.sanitizer.bypassSecurityTrustResourceUrl(this.assetsUrl.images + 'icons-clover.svg'))
            .addSvgIcon('diamond', this.sanitizer.bypassSecurityTrustResourceUrl(this.assetsUrl.images + 'icons-diamond.svg'))
            .addSvgIcon('heart', this.sanitizer.bypassSecurityTrustResourceUrl(this.assetsUrl.images + 'icons-heart.svg'))
            .addSvgIcon('spade', this.sanitizer.bypassSecurityTrustResourceUrl(this.assetsUrl.images + 'icons-spade.svg'))
            ;

        // this.games[0] = {hash: null, salt: null, id: 0, result_cards: null, result_codes: null, datetime: null};

        /**
         * @param Object data[0] {hash: "a8e36959c0012f24984ad75ee63031a17e315d60aa456c783e5a787ab9c9d1fc", id: 1000078}
         */
        this.socket.On(GAME_BACCARAT.game, 'game_created')
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((data: any) => {
                const obj: any = data[0];
                const natural = [8, 9];
                const playerStand = [6, 7];

                this.gameStatus = 'ready';
                this.roundProgress.currentValue = 0;
                this.roundProgress.duration = 0;
                this.roundProgress.color = '#ffd740';

                obj.result_codes = obj.resultCodes.toString();
                obj.result_cards = obj.resultCards.toString();
                this.addGames(obj);
                this.displayHistories();
                this.playCards = obj.resultCards;
                this.playCards.player1 = obj.resultCards[0];
                this.playCards.banker1 = obj.resultCards[1];
                this.playCards.player2 = obj.resultCards[2];
                this.playCards.banker2 = obj.resultCards[3];

                const playMoreCard1 = obj.resultCards[4]; // 이후 순서에 따라 playCards에 담음
                const playMoreCard2 = obj.resultCards[5];

                const playerCard1 = this.baccaratlib.CardSNum(this.playCards.player1);
                const playerCard2 = this.baccaratlib.CardSNum(this.playCards.player2);
                const bankerCard1 = this.baccaratlib.CardSNum(this.playCards.banker1);
                const bankerCard2 = this.baccaratlib.CardSNum(this.playCards.banker2);
                const moreCard1 = this.baccaratlib.CardSNum(playMoreCard1);
                const moreCard2 = this.baccaratlib.CardSNum(playMoreCard2);

                this.gameResult = {hash: this.games[0].hash, salt: this.games[0].salt};

                this.playCardsSum.player = this.baccaratlib.sumCardNum(playerCard1, playerCard2);
                this.playCardsSum.banker = this.baccaratlib.sumCardNum(bankerCard1, bankerCard2);
                //            let player_final_cards_sum = this.playCardsSum.player;
                //            let banker_final_cards_sum = this.playCardsSum.banker;

                this.styles.countDown = 'none';

                // 시간 보정
                // if (this.gameTimer) {
                //     this.gameTimer.refresh_nowDateTime(obj.serverDateTime);
                // }
                // playerMore: null, bankerMore: null};
                // 게임이 시작되면 player 및  banker에 카드를 전달한다. (각각 0.5)

                // 카드 오픈 (각각 0.2) player1 > banker1 > player2 > banker2
                // 카드이동

                // 카드 플립 (처음 카드(player banker 동시 오픈))
                const cardMoveTime = [0, 300, 600, 900]; // player | banker | player | banker
                const cardOpenTime = [1500, 2500, 3500, 5500, 6500]; // player, banker | player | banker | spare1 | spair2
                const cardAnimDoneTime = [6500, 9000, 10000]; // // 카드 오픈 시점에서 2초 후에 게임 죵료, 추가 카드가 존재 하지 않을 경우 종료 시점, spare 1, spare2 cardOpenTime 이후 3초후에 끝냄

                setTimeout(() => {
                    this.isProgressing = true;
                    this.cardMoveState.player1 = 'active';
                    this.playGameSound('cardMove');
                }, cardMoveTime[0]);
                setTimeout(() => {
                    this.isProgressing = true;
                    this.cardMoveState.banker1 = 'active';
                    this.playGameSound('cardMove');
                }, cardMoveTime[1]);
                setTimeout(() => {
                    this.isProgressing = true;
                    this.cardMoveState.player2 = 'active';
                    this.playGameSound('cardMove');
                }, cardMoveTime[2]);
                setTimeout(() => {
                    this.isProgressing = true;
                    this.cardMoveState.banker2 = 'active';
                    this.playGameSound('cardMove');
                }, cardMoveTime[3]);

                setTimeout(() => {
                    this.isProgressing = true;
                    this.cardFlips.player1 = false;
                    this.displayPlayCardsSum.player = this.baccaratlib.sumCardNum(this.displayPlayCardsSum.player, playerCard1);
                    this.playGameSound('cardFlip');
                }, cardOpenTime[0]);
                setTimeout(() => {
                    this.isProgressing = true;
                    this.cardFlips.player2 = false;
                    this.displayPlayCardsSum.player = this.baccaratlib.sumCardNum(this.displayPlayCardsSum.player, playerCard2);
                    this.playGameSound('cardFlip');
                }, cardOpenTime[1]);
                setTimeout(() => {
                    this.isProgressing = true;
                    this.cardFlips.banker1 = false;
                    this.displayPlayCardsSum.banker = this.baccaratlib.sumCardNum(this.displayPlayCardsSum.banker, bankerCard1);
                    this.playGameSound('cardFlip');
                }, cardOpenTime[0]);
                setTimeout(() => {
                    this.isProgressing = true;
                    this.cardFlips.banker2 = false;
                    this.displayPlayCardsSum.banker = this.baccaratlib.sumCardNum(this.displayPlayCardsSum.banker, bankerCard2);
                    this.playGameSound('cardFlip');
                }, cardOpenTime[2]);

                // 추가 카드 여부를 체크한다.
                // natural 일경우 더 이상 카드 받지 않고 play 중지
                //    let winner: string;

                // natural 일경우 더 이상 카드 받지 않고 게임 종료
                if (this.clib.inArray(this.playCardsSum.player, natural) || this.clib.inArray(this.playCardsSum.banker, natural)) { // natural
                    //     winner = this.clib.getWinner(player_final_cards_sum, banker_final_cards_sum);
                    this.resultBoardActiveClassTrigger(obj.resultCodes, cardAnimDoneTime[0]); // 첫번째 onemorecard
                } else { // natural 이 아닐경우 다음 카드를 받을지 선택
                    let playerrOneMoreCard: number;
                    let bankerOneMoreCard: number;

                    // 플레이어가 스탠드(6, 7) 일경우 뱅크가 원모어 카드 받을 조건
                    if (this.clib.inArray(this.playCardsSum.player, playerStand)) {
                        bankerOneMoreCard = moreCard1;
                        if (this.clib.inArray(this.playCardsSum.banker, [0, 1, 2, 3, 4, 5])) { // 뱅크가 원모어 카드를 받을 경우
                            // 뱅크 오픈
                            //                        banker_final_cards_sum = this.clib.sumCardNum(this.playCardsSum.banker, bankerOneMoreCard);
                            //    winner = this.clib.getWinner(player_final_cards_sum, banker_final_cards_sum);
                            this.playCards.bankerMore = playMoreCard1;
                            this.moveAndFlipAnimation(cardOpenTime[3], 'bankerMore', bankerOneMoreCard);
                            this.resultBoardActiveClassTrigger(obj.resultCodes, cardAnimDoneTime[1]); // 두번째 onemorecard
                        } else { // 아닐경우 게임 종료
                            this.resultBoardActiveClassTrigger(obj.resultCodes, cardAnimDoneTime[0]); // 두번째 onemorecard
                        }
                    } else { // player가 3번째 카드를 받을 경우 [0, 1, 2, 3, 4, 5]
                        // first player turn
                        // 플레이어 스탠드가 아닐경우 플레이어는 한장의 카드를 더 받음
                        playerrOneMoreCard = moreCard1;
                        this.playCards.playerMore = playMoreCard1;
                        //                    player_final_cards_sum = this.clib.sumCardNum(this.playCardsSum.player, playerrOneMoreCard);
                        this.moveAndFlipAnimation(cardOpenTime[3], 'playerMore', playerrOneMoreCard);
                        //     this.resultBoardActiveClassTrigger(obj.resultCodes, defaultFlipDoneTime + 1500); // 첫번째 onemorecard

                        // 플레이어 측이 원모어 카드를 받았고 이것을 바탕으로 뱅커측이 원모어 카드를 받을지 계산한다.

                        if (!this.clib.inArray(this.playCardsSum.player, playerStand)) {
                            //                        player_final_cards_sum = this.clib.sumCardNum(this.playCardsSum.player, moreCard1);
                        }

                        // 뱅커 원모어 카드 조건 계산
                        bankerOneMoreCard = moreCard2;
                        if (this.clib.inArray(this.playCardsSum.banker, [0, 1, 2])
                            || (this.playCardsSum.banker === 3 && this.clib.inArray(playerrOneMoreCard, [0, 1, 2, 3, 4, 5, 6, 7, 9]))
                            || (this.playCardsSum.banker === 4 && this.clib.inArray(playerrOneMoreCard, [2, 3, 4, 5, 6, 7]))
                            || (this.playCardsSum.banker === 5 && this.clib.inArray(playerrOneMoreCard, [4, 5, 6, 7]))
                            || (this.playCardsSum.banker === 6 && this.clib.inArray(playerrOneMoreCard, [6, 7]))
                        ) { // 뱅크가 원모어 카드를 받을 경우
                            //                        banker_final_cards_sum = this.clib.sumCardNum(this.playCardsSum.banker, bankerOneMoreCard);
                            this.playCards.bankerMore = playMoreCard2;
                            this.moveAndFlipAnimation(cardOpenTime[4], 'bankerMore', bankerOneMoreCard);
                            this.resultBoardActiveClassTrigger(obj.resultCodes, cardAnimDoneTime[2]); // 두번째 onemorecard
                        } else { // 게임종료 (player 만 받은 상태)
                            this.resultBoardActiveClassTrigger(obj.resultCodes, cardAnimDoneTime[2]); // 두번째 onemorecard
                        }
                    }
                }
                // 결과에 따라 player, banker, tie를 활성화 시킨다.

                // [20000] 초기화 및 베팅시간 디스플레이
                setTimeout(() => {
                    this.gameStatus = 'bet';
                    this.isProgressing = false;
                    this.cardFlips = { player1: true, player2: true, banker1: true, banker2: true, playerMore: true, bankerMore: true };
                    this.cardMoveState = { player1: 'inactive', player2: 'inactive', banker1: 'inactive', banker2: 'inactive', playerMore: 'inactive', bankerMore: 'inactive' };
                    this.boardActiveClass = { PLAYER: true, BANKER: true, TIE: true, PPAIR: true, BPAIR: true };
                    this.playCardsSum = { player: 0, banker: 0 };
                    this.displayPlayCardsSum = { player: 0, banker: 0 };
                    this.players = [];
                    this.participants = {};
                    this.displayPoint = this.userInfo.point;
                    this.roundProgress.currentValue = 100;
                    this.roundProgress.duration = 25000;
                    this.ticktock = 25;
                    this.countDown();
                    this.setNextGameId();
                    this.setRecentGameList(this.games);
                    this.setMyGameList(this.myGames);
                    this.styles.countDown = '';
                }, 15000);
            });

        /**
         * 모든 게임참여자 정보
         * [{betAmount, selVal, gameId, userInfo: {id, name, point}}]
         */
        this.socket.On(GAME_BACCARAT.game, 'player_bet')
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
        this.socket.On(GAME_BACCARAT.game, 'game_result')
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => {
            // this.gameResult = data[0];

            this.myGameResult = {game_id: data[0].gameId, result: data[0].result, win_amount: data[0].winAmount};
            // 현재 내게임 결과에 대해 업데이트
            if (this.myGames && this.myGames[0].game_id === data[0].gameId) {
                this.myGames[0].result = data[0].result;
                this.myGames[0].win_amount = data[0].winAmount;
            }
        });
    }

    public ngOnDestroy(): void {
        this.ngDestroy();
    }

    private setGameSound(): void {
        this.setDefaultSound();
        this.addSound('cardMove', this.assetsUrl.sounds + 'card-move.mp3');
        this.addSound('cardFlip', this.assetsUrl.sounds + 'card-flip.mp3');
    }

    private requestOtt(): void {
        // 서버에 접근하여 실제 userinfo를 가져온다.
        this.http.requestOtt(GAME_BACCARAT.game, (paramObj: any) => {

            this.isBetInit = true;
            if (paramObj.error === false) {
                this.socket.Emit(GAME_BACCARAT.game, 'join', { ott: paramObj.ott }, (err: string, resp: any) => {
                    if (err) {
                        console.error('Error when joining the game...', err);
                        return;
                    }

                    // 현재 진행되는 게임정보를 받아와서 초기화 시킨다.
                    this.serverTime = resp.serverDateTime; // 서버와의 시간동기화를 위한 서버 시간
                    // this.startTimer();
                    this.initProgressBar();

                    // this.games = connecDataObj.games;
                    const reversed = resp.games.reverse(); // connecDataObj.games 도 동시에 reversㄷ 됨
                    this.games = [];
                    for (const rv of reversed) {
                        rv.result_codes = rv.resultCodes.toString();
                        rv.result_cards = rv.resultCards.toString();
                        this.addGames(rv);
                    }
                    this.displayHistories();
                    this.setRecentGameList(this.games);
                    this.setNextGameId();
                    // this.calredBlackRatio();

                    this.dividendRate = resp.dividend;
                    this.participants = resp.participants;
                    this.showPlayers(resp.participants);
                    if (!resp.user) { // 회원정보를 수신 못한 경우
                        return;
                    }

                    this.myBetInfo(resp.participants, resp.user.id);

                    const reversedMyGame = resp.bets.reverse(); // connecDataObj.games 도 동시에 reversㄷ 됨
                    for (const rev of reversedMyGame) {
                        this.addMyGames(rev);
                    }
                    this.setMyGameList(this.myGames);
                    // If username is a falsey value the user is not logged in
                    this.userInfo.name = resp.user.name;
                    this.userInfo.id = resp.user.id;
                    // this.displayPoint = this.userInfo.point = resp.user.point;
                    this.displayPoint = resp.user.point;
                    this.eventSvc.setPoint(resp.user.point);
                });
            }
        }).finally(() => {
            setTimeout(() => {
                this.isBetInit = false;
            }, 1000);
        });
    }

    /**
     * 초기 접속시 현재 게임에 대한 나의 베팅 내역을 가져와 디스플레이 하기
     */
    private myBetInfo(players: any, userId: number): void {
        // {betAmount: 10000 gameId: 255401 playdId: 0 selVal: "g"}
        if (players[userId]) {
            this.isBetted = true;
            const betinfo = players[userId];
            this.choice = betinfo.selVal;
            this.betAmount = betinfo.betAmount;
            this.isProgressing = true;
        }
    }

    private setNextGameId(): void {
        this.nextGameId = this.games[0].id + 1;
    }

    private countDown(): void {
        if (this.gameStatus === 'bet') {
            setTimeout(() => {
                this.ticktock--;
                this.countDown();
            }, 1000);
        }
    }
    /**
     * Pair 선정후 최종 결과 나올때 초기화(기존 설정된 pair값은 그대로 보존)
     */
    private initBoardActiveClass(): void {
        this.boardActiveClass.PLAYER = false;
        this.boardActiveClass.BANKER = false;
        this.boardActiveClass.TIE = false;
        this.boardActiveClass.PPAIR = false;
        this.boardActiveClass.BPAIR = false;
    }

    /**
     *
     * @param card: String {player1:, player2:, banker1: , banker2: , playerMore: , bankerMore: };
     */
    private moveAndFlipAnimation(timer: number, card: string, cardNum: number): void {
        let sumCard: string;
        switch (card) {
            case 'player1':
            case 'player2':
            case 'playerMore':
                sumCard = 'player';
                break;
            case 'banker1':
            case 'banker2':
            case 'bankerMore':
                sumCard = 'banker';
                break;
        }
        // 카드애니메이션 시작
        setTimeout(() => { // 플레이어 카드받기
            this.cardMoveState[card] = 'active';
            this.playGameSound('cardMove');
        }, timer);
        setTimeout(() => { // 플레이어 카드 플립
            this.cardFlips[card] = false;
            this.displayPlayCardsSum[sumCard] = this.baccaratlib.sumCardNum(this.displayPlayCardsSum[sumCard], cardNum);
            this.playGameSound('cardFlip');
        }, timer + 500);
    }
    private resultBoardActiveClassTrigger(resultCodes: any, timer: number): void {
        setTimeout(() => {
            this.resultBoardActiveClass(resultCodes);

            if (this.isBetted) {
                this.displayUserGameResult(this.myGameResult, () => {
                    // 포인트 변경
                    if (this.myGameResult && this.myGameResult.result === 'S') {
                        const point = this.userInfo.point + this.myGameResult.win_amount;
                        this.displayPoint = point;
                        this.eventSvc.setPoint(point);
                        this.myGameResult = null;
                    }
                }); // 사용자 베팅결과 출력
            }
            this.isBetted = false;
        }, timer);
    }

    private resultBoardActiveClass(resultCode: string[]): void {
        this.initBoardActiveClass();
        for (const result of resultCode) {
            switch (result) {
                case 'PLAYER':
                    this.boardActiveClass.PLAYER = true;
                    break;
                case 'BANKER':
                    this.boardActiveClass.BANKER = true;
                    break;
                case 'TIE':
                    this.boardActiveClass.TIE = true;
                    break;
                case 'PPAIR':
                    this.boardActiveClass.PPAIR = true;
                    break;
                case 'BPAIR':
                    this.boardActiveClass.BPAIR = true;
                    break;
            }
        }
    }
    /**
     * @param Object obj { hash: "87407746a124ed77b38ecd2c9ed2f18b84c6d8eec4bfa854625b99a00f2dee9b", id: 1000090}
     */
    private addGames(obj: any): void {
        if (!obj.id) { return; }

        this.games.unshift(obj);

        if (this.games.length > 200) {
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

    private initProgressBar(): void {

        const nowTime = new Date(Date.parse(this.serverTime.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }))); // .toLocaleString('en-US', {timeZone: 'Asia/Seoul'});
        const gameterm = 40; // 20 sec
        const passSeconds = nowTime.getTime() % (gameterm * 1000);

        const remainSeconds = Math.ceil(((gameterm * 1000) - passSeconds) / 1000);
        let finalRemain = remainSeconds; // 15초는 카드애니메이션 타임

        let lastTime = (new Date()).getTime();
        // remain  second 가 25초보다 크면 현재 카드 애니메이션 중이고 25초보다 작으면 타임 처리가 되어야 한다.
        this.roundProgress.duration = 1000; // 1초단위로 duration 처리

        if (finalRemain < 25) {
            this.gameStatus = 'bet';
        }
        const Render = () => {
            const currentTime = (new Date()).getTime();
            if (currentTime - lastTime >= 1000) {
                lastTime = currentTime;
                finalRemain--;
            }

            // (100 / gameterm)
            const currentValue = (100 / gameterm) * (gameterm - finalRemain);
            if (finalRemain >= 0 || currentValue <= 100) {
                this.animationFrameId = requestAnimationFrame(() => Render());

                if (finalRemain <= 25) {
                    this.styles.countDown = '';
                    this.ticktock = finalRemain;
                    this.roundProgress.currentValue = currentValue;
                }
            } else {
                this.roundProgress.currentValue = 0;
                this.roundProgress.duration = 0;
                this.styles.countDown = 'none';
            }
        };

        Render();
    }

    public setBet(flag: string): void {
        this.choice = flag;
        this.choiceColor = flag;
        this.playGameSound('select');
    }

    /**
     * @param String main : LH, RB, NO
     */
    public doBet(): void {
        this.choiceColor = this.choice;

        if (this.userInfo.id === 0) {
            return this.transSystemMessage('games.alert.NO_LOGIN');
        } else if (this.betAmount < GAMES.minBet) {
            return this.transSystemMessage('games.alert.minBet', { minBet: GAMES.minBet });
        } else if (this.betAmount > GAMES.maxBet) {
            return this.transSystemMessage('games.alert.maxBet', { maxBet: GAMES.maxBet });
        } else if (this.betAmount > this.userInfo.point || this.userInfo.point === 0) {
            return this.transSystemMessage('games.alert.NOT_ENOUGH_MONEY');
        } else if (this.gameStatus !== 'bet') {
            return this.transSystemMessage('games.alert.NOT_AVAILABLE_TIME');
        } else if (!this.choiceColor) {
            return this.transSystemMessage('games.alert.selBetItem');
        } else {
            // gameId 는 서버에 저장시 별도로 저장됨
            // this.setbetedCount();
            this.isProgressing = true;
            const betObject = {
                betAmount: this.betAmount,
                selVal: this.choice,
                gameId: null,
                dividendRate: this.calDividenRate(this.choice)
            }; // ruser_id는 서버측에서 계산
            this.socket.Emit(GAME_BACCARAT.game, 'doBet', betObject, (err: string, resp: any) => {
                if (err) {
                    this.svcMessage(err);
                } else {
                    const point = resp.currentPoint - this.betAmount;
                    this.displayPoint = point; // 실제 업체측 데이타와 동기화
                    this.eventSvc.setPoint(point);
                    this.eventSvc.setAmount(this.betAmount);

                    this.transSystemMessage('games.alert.BETTED', null, null, 'start', 'success');
                    this.isBetted = true;
                    betObject.gameId = resp.gameInfo.id + 1;

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
        switch (choice) {
            case 'PPAIR':
            case 'BPAIR':
                return this.dividendRate.pair;
            default:
                return this.dividendRate[choice.toLowerCase()];
        }
    }

    public setHistoryCnt(cnt: number): void {
        this.historyCnt = cnt;
        this.displayHistories();
    }

    private displayHistories(): void {
        this.histories = [];

        const games = this.games.slice(0, this.historyCnt);
        this.historySummary = { player: 0, tie: 0, banker: 0, pp: 0, pb: 0, playerPer: 0, tiePer: 0, bankerPer: 0 };

        for (const game of games) {
            // win : player, banker, tie
            // pair : banker[player, tie] visible or null null
            // gmes.resultCodes :  ["PLAYER"] or ['PPAIR','BANKER']
            let winner: string = null;
            let value: string = null;
            if (game.resultCodes.indexOf('PLAYER') !== -1) {
                winner = 'player';
                value = 'P';
                this.historySummary.player++;
            } else if (game.resultCodes.indexOf('BANKER') !== -1) {
                winner = 'banker';
                value = 'B';
                this.historySummary.banker++;
            } else if (game.resultCodes.indexOf('TIE') !== -1) {
                winner = 'tie';
                value = 'T';
                this.historySummary.tie++;
            }

            // let pair = {pairWinner: null, visiable: null};
            let pair = 'null null';
            if (game.resultCodes.indexOf('PPAIR') !== -1) {

                // pair = {pairWinner: 'player', visiable: 'visible'};
                pair = 'player visible';
                this.historySummary.pp++;
            }

            if (game.resultCodes.indexOf('BPAIR') !== -1) {
                // pair = {pairWinner: 'banker', visiable: 'visible'};
                pair = 'banker visible';
                this.historySummary.pb++;
            }
            const total = this.historySummary.player + this.historySummary.tie + this.historySummary.banker;
            this.historySummary.playerPer = this.historySummary.player / total * 100;
            this.historySummary.tiePer = this.historySummary.tie / total * 100;
            this.historySummary.bankerPer = this.historySummary.banker / total * 100;
            const items = { winner, value, pair, id: game.id };

            this.histories.unshift(items);
        }
    }

    /**
     * 참여자 리스트 디스플레이
     * @param Object players [{user_id : {betAmount, selVal, gameId, userInfo: {id, name, point}}}]
     */
    private showPlayers(players: any): void {
        this.players = [];
        this.betedCount = { PLAYER: 0, BANKER: 0, TIE: 0, PPAIR: 0, BPAIR: 0 };

        forEach(players, (player: any) => {
            const tmp = { betAmount: player.betAmount, bet_result: null, dividendRate: player.dividendRate, selVal: player.selVal, userName: player.userInfo.name };
            this.betedCount[player.selVal]++;
            this.players.push(tmp);
        });
    }

    public roundProgressBarRenderer(e: number): void {
        if (e >= 95) {
            this.gameStatus = 'ready';
            this.roundProgress.color = 'red';
        } else {
            this.roundProgress.color = '#ffd740';
        }
    }
}
