import { Component, Injector, OnInit, HostListener, OnDestroy } from '@angular/core';
import { Game } from '../game';
import { InterfaceJokerGame } from '../../../interface/games/joker.game';
import { InterfaceJokerMyGame } from '../../../interface/games/joker.my.game';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { GAME_JOKER, GAMES } from '../../../../environments/environment';
import { takeUntil } from 'rxjs/operators';
import { forEach } from 'lodash';
import { inArray } from '../../../functions/common';

interface InterfaceCardInfo {
    cardNum: string;
    resultCode: string;
    resultClass: string;
}
// import { ModalJokerFairnessComponent } from '../../../global-item/modal-joker-fairness/modal-joker-fairness.component';

@Component({
    selector: 'app-jocker',
    templateUrl: './joker.component.html',
    styleUrls: ['./joker.component.scss'],
    animations: [
        trigger('cardMovetoListTrigger', [
            state('inactive', style({
                width: '153px',
                height: '229px',
                top: '32px',
                left: '25px',
                fontSize: '100pt',
            })),
            state('active', style({
                width: '36px',
                height: '50px',
                top: '{{animTop}}',
                left: '{{animLeft}}',
                fontSize: '20pt',
            }), { params: { animTop: '-500px', animLeft: '-160px' } }),
            transition('inactive => active', animate('500ms ease-in')),
        ]),
        trigger('cardMovetoListFirstchildTrigger', [
            state('inactive', style({
                opacity: '0'
            })),
            state('active', style({
                opacity: '1',
            })),
            transition('inactive => active', animate('500ms ease-in'))
        ])
    ]
})
export class JokerComponent extends Game implements OnDestroy, OnInit {
    //  {hash: '', id: 0, resultNumber: 0, color: 'zero'} - rfaaling 이 끝날때 업데이트 한다.
    public games: InterfaceJokerGame[] = [];
    private myGames: InterfaceJokerMyGame[] = [];
    // public games = [{ hash: null, salt: null, id: 0, resultNumber: null, resultCode: null, cardNum: null, datetime: ''}];

    // public animPos = { animTop: '-60px', animLeft: '-60px' };
    public animPos = { animTop: '400px', animLeft: '-100%' };
    public roundProgress = { currentValue: 0, color: '#ffd740', duration: 27500 };

    public gameStyles = { currentCardDisplay: { display: 'block' }, roundTimerDisplay: { display: 'block' }, flipAnimDisplay: { display: 'none' } };
    public flipCardStyles = { backgroundPosition: '0px 0px' };
    private setIntervalFlipCardStyles: any;

    public winItems = {
        'LH:H': true, 'LH:L': true,
        'RB:R': true, 'RB:B': true,
        'PA:JO': true, 'PA:D': true, 'PA:H': true, 'PA:S': true, 'PA:C': true,
        'NO:NO': true, 'NO:JQKA': true, 'NO:KA': true, 'NO:A': true
    };

    public nextGameId: number;
    public currentCardInfo: InterfaceCardInfo = { cardNum: '', resultCode: '', resultClass: 'joker' }; // 카드가 이동될대 변경되므로 이곳에 변수값을 넣어서 활용한다.
    public dividendRate: any = {
        LH: {
            2: { DH: 1.09, DL: 1 },
            3: { DH: 1.2, DL: 12 },
            4: { DH: 1.33, DL: 6 },
            5: { DH: 1.5, DL: 4 },
            6: { DH: 1.71, DL: 3 },
            7: { DH: 2, DL: 2.4 },
            8: { DH: 2.4, DL: 2 },
            9: { DH: 3, DL: 1.71 },
            J: { DH: 4, DL: 1.5 },
            Q: { DH: 6, DL: 1.33 },
            K: { DH: 12, DL: 1.2 },
            A: { DH: 1, DL: 1.09 }
        },
        RB: { R: 2, B: 2 },
        PA: { JO: 24, D: 3.8, H: 3.8, S: 3.8, C: 3.8 },
        NO: { NO: 1.5, JQKA: 3, KA: 6, A: 12 }
    };
    public lowHighDividendRate = { L: 0, H: 0 };
    public lowHighRange = { L: '-', H: '-' };
    public redBlackRate = { r: 0, b: 0, r_ratio: 0, b_ratio: 0, sampling_cnt: 20 }; // sampling_cnt: 20, 50, 100, 200

    public players = [];
    private participants: any = {};
    // resultNum = 0; // resultNum은 소켓에서 받아오고 raffling 이 시작되면 resultNumAttr에 전송된다.
    // resultNumAttr = {hash: null, id: 0, resultNumber: null, resultCode: null, cardNum : null}; // zero, red, balck
    // private gameResult: any = null; // 내 게임 결과

    private gameStatus = 'play'; // play : 베팅가능, pause: 결과값 수신후 약 4.5초 동안은 게임 중지

    // serviceInfo = jokerGame.serviceInfo;
    // configUserinfo = jokerGame.userinfo;

    public betAmount = 0;
    public betedCount = {
        'LH:L': 0, 'LH:H': 0,
        'RB:R': 0, 'RB:B': 0,
        'PA:JO': 0, 'PA:D': 0, 'PA:H': 0, 'PA:S': 0, 'PA:C': 0,
        'NO:NO': 0, 'NO:JQKA': 0, 'NO:KA': 0, 'NO:A': 0
    }; // for display
    public choice: string = null;

    public cardMovetoListState = 'inactive';
    public cardOpenedListState = 'inactive';

    public openedCardSum = { 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, J: 0, Q: 0, K: 0, A: 0, JO: 0 };

    private serverTime: Date = null; // 서버 시간을 가져와서 세팅시킨다(connection 및 매 게임 결과 전송시 리셋 시킨다.)
    private gameTimer = null;

    public isProgressing: boolean;
    public isBetInit = true;

    private animFrame = {gameterm: 30, lastTime: 0, finalRemain: 0};

    // playpannel = {offsetWidth: 400, offsetHeight: 220};
    public cardHistoryListCnt = 9;
    @HostListener('window:resize', ['$event']) // 아래 onResize 와 붙어 있어야 함
    protected onResize(): void {
        this.setCardHistoryListCnt();
    }

    constructor(
        protected injector: Injector
    ) {
        super(injector);
        this.titleSvc.setTitle('JOKER');
        this.assetsUrl = { images: './assets/games/joker/images/', sounds: './assets/games/joker/sounds/'};
        this.setIcons();
        this.setGameSound();
    }
    private setGameSound(): void {
        this.setDefaultSound();
        this.addSound('cardMove', this.assetsUrl.sounds + 'card-move.mp3');
        this.addSound('cardFlip', this.assetsUrl.sounds + 'card-flip.mp3');
        this.addSound('cardFlipDone', this.assetsUrl.sounds + 'card-flip-done.mp3');
    }

    private setIcons(): void {
        this.iconRegistry
            .addSvgIcon('crown', this.sanitizer.bypassSecurityTrustResourceUrl(this.assetsUrl.images + 'jokersm.svg'))// 왕관 (추후 경로 dynamic 하게 변경)
            .addSvgIcon('ci-clover', this.sanitizer.bypassSecurityTrustResourceUrl(this.assetsUrl.images + 'icons-clover.svg'))
            .addSvgIcon('ci-diamond', this.sanitizer.bypassSecurityTrustResourceUrl(this.assetsUrl.images + 'icons-diamond.svg'))
            .addSvgIcon('ci-heart', this.sanitizer.bypassSecurityTrustResourceUrl(this.assetsUrl.images + 'icons-heart.svg'))
            .addSvgIcon('ci-spade', this.sanitizer.bypassSecurityTrustResourceUrl(this.assetsUrl.images + 'icons-spade.svg'))
            .addSvgIcon('ci-joker', this.sanitizer.bypassSecurityTrustResourceUrl(this.assetsUrl.images + 'icon_joker_color.svg'))
            .addSvgIcon('ci-joker2', this.sanitizer.bypassSecurityTrustResourceUrl(this.assetsUrl.images + 'icon_joker_black.svg'))
            .addSvgIcon('lh-lo', this.sanitizer.bypassSecurityTrustResourceUrl(this.assetsUrl.images + 'LoHi-Lo.svg'))
            .addSvgIcon('lh-hi', this.sanitizer.bypassSecurityTrustResourceUrl(this.assetsUrl.images + 'LoHi-Hi.svg'))
            .addSvgIcon('lh-eq', this.sanitizer.bypassSecurityTrustResourceUrl(this.assetsUrl.images + 'LoHi-equal.svg'))
            .addSvgIcon('i-clover', this.sanitizer.bypassSecurityTrustResourceUrl(this.assetsUrl.images + 'icons-clover.svg'))
            .addSvgIcon('i-diamond', this.sanitizer.bypassSecurityTrustResourceUrl(this.assetsUrl.images + 'icons-diamond.svg'))
            .addSvgIcon('i-heart', this.sanitizer.bypassSecurityTrustResourceUrl(this.assetsUrl.images + 'icons-heart.svg'))
            .addSvgIcon('i-spade', this.sanitizer.bypassSecurityTrustResourceUrl(this.assetsUrl.images + 'icons-spade.svg'))
            .addSvgIcon('i-joker', this.sanitizer.bypassSecurityTrustResourceUrl(this.assetsUrl.images + 'icons-joker.svg'))
            .addSvgIcon('l-joker', this.sanitizer.bypassSecurityTrustResourceUrl(this.assetsUrl.images + 'logo-joker.svg'))
            ;
    }
    public ngOnInit(): void {
        this.ngInit();
        this.socket.init(GAME_JOKER.game, GAME_JOKER.socketUrl);
        this.requestOtt();

        // this.playpannel = {offsetWidth: window.innerWidth, offsetHeight: window.innerHeight};
        this.setCardHistoryListCnt();

        // this.socket.On('connection') 아래에 다른 On 을 둘 경우 서버 connection이  재 실행될 경우 여러개가 호출됨
        /**
         * @param Object data[0] {id, hash, salt, resultCode, resultNumber, datetime}
         */
        this.socket.On(GAME_JOKER.game, 'game_created')
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((data: any) => {
                const obj: any = data[0];

                this.gameStatus = 'pause';
                this.roundProgress.currentValue = 0;
                this.roundProgress.color = '#ffd740';
                this.roundProgress.duration = 27500;
                // 시간 보정
                if (this.gameTimer) {
                    this.gameTimer.refresh_nowDateTime(obj.serverDateTime);
                }
                // this.resultNum = obj.resultNumber;
                // this.resultNumAttr = {number: this.resultNum, color: this.raffleNumsAttr[this.resultNum].c};
                obj.result_code = obj.resultCode;
                obj.result_number = obj.resultNumber;
                this.addGames(obj);

                this.cardOpenedListState = 'inactive';
                this.setOpendCardSum();
                setTimeout(() => {
                    this.getLowHighDividendRate();
                }, 4500);
                // this.calredBlackRatio();

                // [0] 카드 이동 및 리스트의 카드를 아래로 밀기
                setTimeout(() => {
                    this.cardMovetoListState = 'active';
                    this.cardOpenedListState = 'active';
                    this.playGameSound('cardMove');
                }, 0);

                // [500] 카드 이동 끝 및 카드플립애니메이션 시작, 프론트 데이타 변경
                setTimeout(() => {
                    this.cardFlipAnim(); // 2초간 실행
                    this.cardMovetoListState = 'inactive';
                    this.gameStyles.currentCardDisplay = { display: 'none' };
                    this.currentCardInfo = {
                        cardNum: this.getCardNum(obj.resultCode),
                        resultCode: this.games[0].result_code,
                        resultClass: this.getCardclass(this.games[0].result_code, true)
                    };
                    this.playGameSound('cardFlip');
                }, 500);

                setTimeout(() => {
                    this.playGameSound('cardFlipDone');
                }, 2000);
                /*
                            setTimeout(() => {
                                this.cardFlipAnim(); // 2초간 실행
                                this.cardMovetoListState = 'inactive';
                                this.gameStyles.currentCardDisplay = {'display': 'none'};
                                this.currentCardInfo = {'cardNum': this.getCardNum(obj.resultCode), 'resultCode': this.games[0].resultCode, 'resultClass': this.getCardclass(this.games[0].resultCode, true)};
                            }, 500);
                            */

                // [2500] 카드플립 애니메이션 끝 타이머 시작, 프론트 디스플레이
                this.roundProgress.currentValue = 0;
                this.gameStyles.roundTimerDisplay = { display: 'none' };
                setTimeout(() => {
                    // this.currentCardInfo = this.games[0];
                    this.roundProgress.currentValue = 100;
                    this.gameStyles.roundTimerDisplay = { display: 'block' };
                    this.gameStyles.currentCardDisplay = { display: 'block' };
                    this.inActivateLooseButon(); // 선택이 안될 경우 inactivate 시킨다 (게임 겨로가 발료후 in activate 3초후 원상복구)

                    // this.gameResult = data[0];
                    if (this.myGameResult) {
                        this.displayUserGameResult(this.myGameResult, () => {
                            // 포인트 변경
                            if (this.myGameResult && this.myGameResult.result === 'S') {
                                const point = this.userInfo.point + this.myGameResult.win_amount;
                                this.displayPoint = point;
                                this.eventSvc.setPoint(point);
                                }
                            this.myGameResult = null;
                        }); // 사용자 베팅결과 출력
                    }
                }, 2500);

                // [4500] 게임 시작전 모든 것을 초기화 한다.
                setTimeout(() => {
                    this.gameStatus = 'play';
                    this.roundProgress.color = '#7fff00';
                    this.players = [];
                    this.participants = {};
                    this.setMyGameList(this.myGames);
                    this.setRecentGameList(this.games);
                    this.displayPoint = this.userInfo.point;
                    this.winItems = {
                        'LH:H': true, 'LH:L': true,
                        'RB:R': true, 'RB:B': true,
                        'PA:JO': true, 'PA:D': true, 'PA:H': true, 'PA:S': true, 'PA:C': true,
                        'NO:NO': true, 'NO:JQKA': true, 'NO:KA': true, 'NO:A': true
                    };

                }, 4500);

                this.setNextGameId();
            });

        /**
         * 모든 게임참여자 정보
         * [{betAmount, selVal, gameId, userInfo: {id, name, point}}]
         */
        this.socket.On(GAME_JOKER.game, 'player_bet')
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((data: any) => {
                const participant = data[0].participant;
                this.participants[participant.userInfo.id] = participant;

                this.showPlayers(this.participants);
                // print bet list
            });

        /*
         * 자신이 참여한 게임 결과 (실제적으로는 게임 create 시 받아오나 애니메이션상 결과가 공개될때 메시지 출력(displayUserGameResult()))
         * betAmount, choice, created_at, dividendRate, gameId, id, result, user_id, winAmount}
         */
        this.socket.On(GAME_JOKER.game, 'game_result')
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((data: any) => {
            this.myGameResult = {game_id: data[0].gameId, result: data[0].result, win_amount: data[0].winAmount};
            if (this.myGames && this.myGames[0].game_id === data[0].gameId) {
                this.myGames[0].result = data[0].result;
                this.myGames[0].win_amount = data[0].winAmount;
            }

        });
    } // end of constructor

    public ngOnDestroy(): void {
        this.ngDestroy();
    }

    private requestOtt(): void {
        this.isBetInit = true;
        // 서버에 접근하여 실제 userinfo를 가져온다.
        this.http.requestOtt(GAME_JOKER.game, (paramObj) => {
            if (paramObj.error === false) {
                this.socket.Emit(GAME_JOKER.game, 'join', { ott: paramObj.ott }, (err: string, resp: any) => {
                    if (err) {
                        console.error('Error when joining the game...', err);
                        return;
                    }

                    // 현재 진행되는 게임정보를 받아와서 초기화 시킨다.
                    this.serverTime = resp.serverDateTime; // 서버와의 시간동기화를 위한 서버 시간
                    this.initProgressBar();

                    // this.games = connecDataObj.games;
                    const reversed = resp.games.reverse(); // connecDataObj.games 도 동시에 reversㄷ 됨
                    this.games = [];
                    for (const rev of reversed) {
                        rev.result_code = rev.resultCode;
                        rev.result_number = rev.resultNumber;
                        this.addGames(rev);
                    }

                    this.setRecentGameList(this.games);
                    this.setOpendCardSum();
                    this.getLowHighDividendRate();
                    this.currentCardInfo = {
                        cardNum: this.getCardNum(this.games[0].result_code),
                        resultCode: this.games[0].result_code,
                        resultClass: this.getCardclass(this.games[0].result_code, true)
                    };
                    this.cardOpenedListState = 'active';

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
                        const obj = resp.bets[0];
                        if (obj.gameId === this.games[0].id + 1) {
                            this.isProgressing = true;
                            this.choice = obj.choice;
                        }
                    }

                });
            }
        }).finally(() => {
            setTimeout(() => {
                this.isBetInit = false;
            }, 1000);
        });
    }

    /**
     * @param Object obj {hash: "87407746a124ed77b38ecd2c9ed2f18b84c6d8eec4bfa854625b99a00f2dee9b", id: 1000090, resultNumber: 13}
     */
    private addGames(obj: any): void {
        if (obj.result_number === null) { return; }
        // obj.color = this.raffleNumsAttr[obj.resultNumber].c;
        obj.cardNum = this.getCardNum(obj.result_code);
        obj.cardClass = this.getCardclass(obj.result_code);
        obj.cardSvg = this.getCardSvg(obj.result_code);

        // get lo-hi class
        if (this.games.length === 0) {
            obj.lohiClass = '';
        } else {
            obj.lohiClass = this.getLohiClass(this.games[0].cardNum, obj.cardNum);
        }

        this.games.unshift(obj);

        if (this.games.length > 200) {
            this.games.pop();
        }
        // this.games[0].cardNum = 'JO';
        // this.games[0].cardSvg = 'ci-joker2';
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

    /**
     * 1. 현재것이 Joker 면 배팅을 죽임
     * 2. 이전것이 Joker 면 현재값을 기준으로 7이하 low 8이상 high
     */
    private getLohiClass(pre: string, cur: string): string {
        const preNum = this.codeToNum(pre);
        const curNum = this.codeToNum(cur);

        if (curNum === 'JO') {
            return 'lh-eq';
        } else if (preNum === 'JO') {
            if (curNum <= 7) {
                return 'lh-lo';
            } else {
                return 'lh-hi';
            }
        } else {
            if (curNum < preNum) {
                return 'lh-lo';
            } else if (curNum > preNum) {
                return 'lh-hi';
            } else {
                return 'lh-eq';
            }
        }

    }

    private codeToNum(code: string): number | string {
        switch (code) {
            case 'J':
                return 10;
            case 'Q':
                return 11;
            case 'K':
                return 12;
            case 'A':
                return 13;
            case 'JO':
                return code;
            default:
                return parseInt(code, 10);
        }
    }

    private getCardNum(resultcode: string): string {
        if (resultcode === 'JO') {
            return resultcode;
        } else {
            return resultcode.substr(1, 1);
        }
    }

    /**
     * @param Boolean onlyCard : 카드 클래스만 리턴 할 것인지 숫자클래스까지 포함 할 것인지
     */
    private getCardclass(resultcode: string, onlyCard?: boolean): string {
        let cardClass: string;
        if (resultcode === 'JO') {
            cardClass = 'joker';
        } else {
            const cardtype = resultcode.substr(0, 1);
            const cardNum = resultcode.substr(1, 1);
            switch (cardtype) {
                case 'D':
                    cardClass = 'diamond';
                    break;
                case 'S':
                    cardClass = 'spade';
                    break;
                case 'H':
                    cardClass = 'heart';
                    break;
                case 'C':
                    cardClass = 'clover';
                    break;
            }
            if (!onlyCard) {
                cardClass = cardClass + '-' + cardNum.toLowerCase();
            }
        }

        return cardClass;
    }

    private getCardSvg(resultCode: string): string {
        let cardClass: string;
        if (resultCode === 'JO') {
            cardClass = 'ci-joker';
        } else {
            const cardtype = resultCode.substr(0, 1);
            switch (cardtype) {
                case 'D':
                    cardClass = 'ci-diamond';
                    break;
                case 'S':
                    cardClass = 'ci-spade';
                    break;
                case 'H':
                    cardClass = 'ci-heart';
                    break;
                case 'C':
                    cardClass = 'ci-clover';
                    break;
            }
        }

        return cardClass;
    }

    private setOpendCardSum(): void {

        this.openedCardSum = { 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, J: 0, Q: 0, K: 0, A: 0, JO: 0 };
        const tmpRedBlackRate = { r: 0, b: 0, r_ratio: 0, b_ratio: 0 };

        forEach(this.games, (game: any, i) => {
            if (i >= this.redBlackRate.sampling_cnt) {
                return false;
            }
            this.openedCardSum[game.cardNum]++;
            if (game.resultCode) {
                const cardtype = game.resultCode.substr(0, 1);
                switch (cardtype) {
                    case 'D':
                    case 'H':
                        tmpRedBlackRate.r++;
                        break;
                    case 'S':
                    case 'C':
                        tmpRedBlackRate.b++;
                        break;
                }
            }
        });

        const total = tmpRedBlackRate.r + tmpRedBlackRate.b;

        this.redBlackRate.r = tmpRedBlackRate.r;
        this.redBlackRate.b = tmpRedBlackRate.b;
        this.redBlackRate.r_ratio = parseInt((tmpRedBlackRate.r / total * 100).toString(), 10);
        this.redBlackRate.b_ratio = parseInt((tmpRedBlackRate.b / total * 100).toString(), 10);
    }

    private initProgressBar(): void {

        const nowTime = new Date(Date.parse(this.serverTime.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }))); // .toLocaleString('en-US', {timeZone: 'Asia/Seoul'});
        // const gameterm = 30; // 30 sec
    //    const gameterm = 30; // 30 sec
        const passSeconds = nowTime.getTime() % (this.animFrame.gameterm * 1000);
        const remainSeconds = Math.ceil(((this.animFrame.gameterm * 1000) - passSeconds) / 1000);
        this.animFrame.finalRemain = remainSeconds;

        this.animFrame.lastTime = (new Date()).getTime();
        this.roundProgress.duration = 1000;

        this.anim();
    }

    private anim(): void {
        const currentTime = (new Date()).getTime();
        if (currentTime - this.animFrame.lastTime >= 1000) {

            this.animFrame.lastTime = currentTime;
            this.animFrame.finalRemain--;
        }
        // (100 / gameterm)
        this.roundProgress.currentValue = (100 / this.animFrame.gameterm) * (this.animFrame.gameterm - this.animFrame.finalRemain);

        if (this.animFrame.finalRemain >= 0 || this.roundProgress.currentValue <= 100) {
            this.animationFrameId = requestAnimationFrame(this.anim.bind(this));
        } else {
            this.roundProgress.currentValue = 0;
            this.roundProgress.duration = 27500;
        }
    }

    /**
     * @param String main : LH, RB, NO
     */
    public doBet(): void {
        // this.choice = main + ':' + sub;

        console.log(this.choice);
        if (!this.choice) {
            return this.transSystemMessage('games.alert.selBetItem');
        }
        const choiceArr = this.choice.split(':');
        const main = choiceArr[0];
        const sub = choiceArr[1];

        if (this.lowHighDividendRate.H === 1 && main === 'LH' && sub === 'H') {
            return;
        }
        if (this.lowHighDividendRate.L === 1 && main === 'LH' && sub === 'L') {
            return;
        }

        if (this.userInfo.id === 0) {
            return this.transSystemMessage('games.alert.NO_LOGIN');
        } else if (this.gameStatus !== 'play') {
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
                betAmount: this.betAmount,
                selVal: this.choice,
                gameId: null,
                dividendRate: this.calDividenRate(this.choice)
            }; // roundNo 및 user_id는 서버측에서 계산
            this.socket.Emit(GAME_JOKER.game, 'doBet', betObject, (err: string, resp: any) => {
                if (err) {
                    this.svcMessage(err);
                } else {
                    const point = resp.currentPoint - this.betAmount;
                    this.displayPoint = point; // 실제 업체측 데이타와 동기화
                    this.eventSvc.setPoint(point);
                    this.eventSvc.setAmount(this.betAmount);

                    this.transSystemMessage('games.alert.BETTED', null, null, 'start', 'success');
                    betObject.gameId = resp.gameInfo.id + 1;
                    // betObject.roundNo = resp.gameInfo.roundNo + 1;
                    // 배팅완료된 정보 디스플레이
                    // this.dp_betInfo(betObject);

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

    private calDividenRate(choice: string): number {
        const tmp = choice.split(':');
        if (tmp[0] === 'LH') {
            switch (tmp[1]) {
                case 'L':
                    return this.dividendRate.LH[this.games[0].cardNum].DL;
                case 'H':
                    return this.dividendRate.LH[this.games[0].cardNum].DH;
            }
        } else {
            return this.dividendRate[tmp[0]][tmp[1]];
        }
    }

    /**
     * 참여자 리스트 디스플레이
     * @param Object players [{user_id : {betAmount, selVal, gameId, userInfo: {id, name, point}}}]
     */
    private showPlayers(players: any): void {
        this.players = [];
        this.betedCount = {
            'LH:L': 0, 'LH:H': 0,
            'RB:R': 0, 'RB:B': 0,
            'PA:JO': 0, 'PA:D': 0, 'PA:H': 0, 'PA:S': 0, 'PA:C': 0,
            'NO:NO': 0, 'NO:JQKA': 0, 'NO:KA': 0, 'NO:A': 0
        };

        forEach(players, (player: any) => { // , user_id: string

            //    if (!this.clib.diplayUser(jokerGame.serviceInfo.gamblerDisplay)) {
            //        return;
            //    }

            const tmpsp = player.selVal.split(':');
            let betInfo: string;
            switch (tmpsp[0]) {
                case 'LH':
                    switch (tmpsp[1]) {
                        case 'L':
                            // betInfo = '로우';
                            this.translate.get('games.joker.low')
                                .pipe(takeUntil(this.ngUnsubscribe))
                                .subscribe((value) => {
                                    betInfo = value;
                                });
                            break;
                        case 'H':
                            // betInfo = '하이';
                            this.translate.get('games.joker.high')
                                .pipe(takeUntil(this.ngUnsubscribe))
                                .subscribe((value) => {
                                    betInfo = value;
                                });
                            break;
                    }
                    break;
                case 'RB':
                    switch (tmpsp[1]) {
                        case 'R':
                            // betInfo = '레드';
                            this.translate.get('games.joker.red')
                                .pipe(takeUntil(this.ngUnsubscribe))
                                .subscribe((value) => {
                                    betInfo = value;
                                });
                            break;
                        case 'B':
                            // betInfo = '블랙';
                            this.translate.get('games.joker.black')
                                .pipe(takeUntil(this.ngUnsubscribe))
                                .subscribe((value) => {
                                    betInfo = value;
                                });
                            break;
                    }
                    break;
                case 'PA':
                    switch (tmpsp[1]) {
                        case 'JO':
                            // betInfo = '조커';
                            this.translate.get('games.joker.joker')
                                .pipe(takeUntil(this.ngUnsubscribe))
                                .subscribe((value) => {
                                    betInfo = value;
                                });
                            break;
                        case 'D':
                            // betInfo = '다이아몬드';
                            this.translate.get('games.joker.diamond')
                                .pipe(takeUntil(this.ngUnsubscribe))
                                .subscribe((value) => {
                                    betInfo = value;
                                });
                            break;
                        case 'H':
                            // betInfo = '하트';
                            this.translate.get('games.joker.heart')
                                .pipe(takeUntil(this.ngUnsubscribe))
                                .subscribe((value) => {
                                    betInfo = value;
                                });
                            break;
                        case 'S':
                            // betInfo = '스페이드';
                            this.translate.get('games.joker.spade')
                                .pipe(takeUntil(this.ngUnsubscribe))
                                .subscribe((value) => {
                                    betInfo = value;
                                });
                            break;
                        case 'C':
                            // betInfo = '클로버';
                            this.translate.get('games.joker.clover')
                                .pipe(takeUntil(this.ngUnsubscribe))
                                .subscribe((value) => {
                                    betInfo = value;
                                });
                            break;
                    }
                    break;
                case 'NO':
                    switch (tmpsp[1]) {
                        case 'NO':
                            betInfo = '2-9';
                            break;
                        case 'JQKA':
                            betInfo = 'JQKA';
                            break;
                        case 'KA':
                            betInfo = 'KA';
                            break;
                        case 'A':
                            betInfo = 'A';
                            break;
                    }
                    break;
            }
            const tmp = { betAmount: player.betAmount, bet_result: null, dividendRate: player.dividendRate, betInfo, selVal: player.selVal, userName: player.userInfo.name };
            this.betedCount[player.selVal]++;
            this.players.push(tmp);
        });
    }

    /*
    * 사용자 베팅 결과 출력
    * this.gameResult = {betAmount, choice, created_at, dividendRate, gameId, id, result, user_id, winAmount}}

    private displayUserGameResult() {
        if ( this.gameResult ) {
            // 포인트 변경
            if (this.gameResult.result === 'S') {
                this.userInfo.point += this.gameResult.winAmount;
            }
        }
    }
*/
    private setNextGameId(): void {
        this.nextGameId = this.games[0].id + 1;
        // this.nextGameId = this.games[0].roundNo + 1;
    }

    /**
     * 이전 카드가 Joker 일경우 2배 제공
     */
    private getLowHighDividendRate(): void {

        const cardNum = this.games[0].cardNum;
        if (cardNum === 'JO') {
            this.lowHighDividendRate.L = 2;
            this.lowHighDividendRate.H = 2;
            this.lowHighRange.L = '2-7';
            this.lowHighRange.H = '8-A';
        } else {
            this.lowHighDividendRate.L = this.dividendRate.LH[cardNum].DL;
            this.lowHighDividendRate.H = this.dividendRate.LH[cardNum].DH;

            // const orderCard = {'0': '2',  '1': '3',  '2': '4',  '3': '5',  '4': '6',  '5': '7',  '6': '8',  '7': '9',  '8': 'J',  '9': 'Q',  '10': 'K',  '11': 'A' };
            const orderCard = ['2', '3', '4', '5', '6', '7', '8', '9', 'J', 'Q', 'K', 'A'];
            const orderCardNum = { 2: 0, 3: 1, 4: 2, 5: 3, 6: 4, 7: 5, 8: 6, 9: 7, J: 8, Q: 9, K: 10, A: 11 };

            const lowRangeNum = orderCardNum[cardNum] - 1;
            const highRangeNum = orderCardNum[cardNum] + 1;
            if (lowRangeNum < 0) {
                this.lowHighRange.L = '-';
            } else if (lowRangeNum === 0) {
                this.lowHighRange.L = orderCard[0];
            } else {
                this.lowHighRange.L = orderCard[0] + '-' + orderCard[lowRangeNum];
            }

            if (highRangeNum > 11) {
                this.lowHighRange.H = '-';
            } else if (highRangeNum === 11) {
                this.lowHighRange.H = orderCard[11];
            } else {
                this.lowHighRange.H = orderCard[highRangeNum] + '-' + orderCard[11];
            }
        }
    }

    public roundProgressBarRenderer(e: number): void {
        if (e >= 95) {
            this.gameStatus = 'ready';
            this.roundProgress.color = '#ffd740';
            this.isProgressing = false;
            this.choice = '';
        }
    }

    public cardFlipAnim(): void {
        let counter = 0;
        clearInterval(this.setIntervalFlipCardStyles);
        this.setIntervalFlipCardStyles = setInterval(() =>
            this.getSpriteStyle(counter++), 50);
    }

    // total 40 frame (common 20, target 20)
    private getSpriteStyle(counter: number): void {
        // width: 200px;
        // height: 305px;
        let xP = '0px';
        let yP = '0px';

        const cardtype = this.games[0].result_code.substr(0, 1);

        if (counter < 13) {
            yP = '0px';
        } else if (counter < 26) {
            yP = '-305px';
        } else if (counter < 39) {
            switch (cardtype) {
                case 'D':
                    yP = '-610px';
                    break;
                case 'H':
                    yP = '-915px';
                    break;
                case 'S':
                    yP = '-1220px';
                    break;
                case 'C':
                    yP = '-1525px';
                    break;
                case 'J':
                    yP = '-1830px';
                    break;
            }
        } else {
            clearInterval(this.setIntervalFlipCardStyles);
        }

        const absPosition = counter % 13;
        xP = -(absPosition * 200) + 'px';
        this.flipCardStyles = { backgroundPosition: xP + ' ' + yP };
    }

    private inActivateLooseButon(): void {
        const lastGameinfo = this.games[0];
        const lastCardtype = lastGameinfo.result_code.substr(0, 1);
        const lastCardNum = lastGameinfo.result_code.substr(1, 1);
        const lastCardIntNum = this.codeToNum(lastCardNum);

        const prevGameinfo = this.games[1]; // 로하이의 경우 이전과 비교하여야 하므로 필요
        const prevCardNum = prevGameinfo.result_code.substr(1, 1);
        const prevCardIntNum = this.codeToNum(prevCardNum);

        // lastGameinfo.resultCode 를 이용하여 각각에 대한 결과 값을 도출한다.
        let Wins = [];
        if (lastGameinfo.result_code === 'JO') {
            // JO 선택 (RB:JO)을 제외한 모든 것은 실패
            Wins = ['PA:JO'];
        } else {
            switch (lastCardtype) {
                case 'D':
                    Wins.push('RB:R');
                    Wins.push('PA:D');
                    break;
                case 'H':
                    Wins.push('RB:R');
                    Wins.push('PA:H');
                    break;
                case 'S':
                    Wins.push('RB:B');
                    Wins.push('PA:S');
                    break;
                case 'C':
                    Wins.push('RB:B');
                    Wins.push('PA:C');
                    break;
            }
            switch (lastCardNum) {
                case 'A':
                    Wins.push('NO:A');
                    Wins.push('NO:KA');
                    Wins.push('NO:JQKA');
                    break;
                case 'K':
                    Wins.push('NO:KA');
                    Wins.push('NO:JQKA');
                    break;
                case 'J':
                case 'Q':
                    Wins.push('NO:JQKA');
                    break;
                default:
                    Wins.push('NO:NO');
                    break;
            }

            // 이전 카드가 Joker이면 7을 기준으로 L, H를 정의한다.
            if (prevGameinfo.result_code === 'JO') {
                if (lastCardIntNum > 7) {
                    Wins.push('LH:H');
                } else {
                    Wins.push('LH:L');
                }
            } else {
                if (lastCardIntNum > prevCardIntNum) {
                    Wins.push('LH:H');
                } else if (lastCardIntNum < prevCardIntNum) {
                    Wins.push('LH:L');
                }
            }
        }

        this.winItems = {
            'LH:H': false,
            'LH:L': false,
            'RB:R': false,
            'RB:B': false,
            'PA:JO': false,
            'PA:D': false,
            'PA:H': false,
            'PA:S': false,
            'PA:C': false,
            'NO:NO': false,
            'NO:JQKA': false,
            'NO:KA': false,
            'NO:A': false
        };
        for (const win of Wins) {
            this.winItems[win] = true;
        }

        forEach(this.players, (game: any) => {
            game.bet_result = inArray(game.selVal, Wins) ? 1 : 0;
        });
    }

    // private in_array(needle: number | string, haystack: any): boolean {
    //     for (const i in haystack) {
    //         if (haystack[i] === needle) { return true; }
    //     }
    //     return false;
    // }

    public setHistoryCnt(cnt: number): void {
        this.redBlackRate.sampling_cnt = cnt;

        this.setOpendCardSum();
    }

    private setCardHistoryListCnt(): void {
        if (window.innerWidth > 800) {
            this.cardHistoryListCnt = 11;
        } else if (window.innerWidth > 700) {
            this.cardHistoryListCnt = 10;
        } else {
            this.cardHistoryListCnt = 9;
        }
    }

    public setBet(main: string, sub: string): void {
        const flag = main + ':' + sub;
        this.choice = flag;
        console.log('setBet', this.choice);
        this.playGameSound('select');
    }
}
