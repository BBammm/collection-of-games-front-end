import { Component, OnInit, Injector, OnDestroy } from '@angular/core'; // , OnChanges, SimpleChange,  ɵɵsetComponentScope
import { Game } from '../game';
import { allocation } from './keno.allocation';
import { GAME_KENO, GAMES } from '../../../../environments/environment';
// import { trigger, state, style, transition, animate } from '@angular/animations';
// import { forEach } from 'lodash';

@Component({
    selector: 'app-keno',
    templateUrl: './keno.component.html',
    styleUrls: ['./keno.component.scss']
})
export class KenoComponent extends Game implements OnInit, OnDestroy {

    public allo = allocation;   // 배당 기본 데이터
    public gameTiles = [];      // 타일 80개
    public selectedTiles = [];  // 선택한 타일배열
    public calcAmount = [];     // display할 예상 배당 금액
    public selectedNumArr = [];
    public winAmountStep = 0;
    public recentGame = {
        hash: null,
        salt: null
    };     // 최근게임

    public isBetInit = false;
    public isProgressing: boolean;
    public isAutoProgressing = false; // 오토모드일 때 버튼 보여지게끔 하는 flag
    public isAutoMode = false;
    public isSpeedMode = false;
    public nextGameId: number;
    public answerCode: any;

    public compareResult: any;

    private myGames: any[] = [];  //
    private amount = 0;
    private timeoutMs = 200;

    constructor(
        protected injector: Injector
    ) {
        super(injector);
        this.titleSvc.setTitle('KENO');
        this.assetsUrl = { images: './assets/games/keno/images/', sounds: './assets/games/keno/sounds/' };
        this.setGameSound();
    }

    ngOnInit(): void {
        this.ngInit();
        this.socket.init(GAME_KENO.game, GAME_KENO.socketUrl);
        this.requestOtt();

        this.resetTiles();
    }

    public ngOnDestroy(): void {
        this.ngDestroy();
        this.isAutoMode = false;
    }

    public setBetAmount(e: any): void {
        this.amount = e;
        this.calcAllo();
    }

    /**
     * 리셋버튼 클릭 시
     */
    public resetGame(): void {
        if (!this.isProgressing) {
            this.resetTiles();
            this.calcAmount = [];
            this.selectedTiles = [];
            this.winAmountStep = 0;
        } else {
            this.transSystemMessage('games.alert.IN_PROGRESS');
        }
    }

    /**
     * 선택한 타일의 배열 세팅 및 타일의 on/off 모드
     */
    public setSelectTileNum(tile: any, index: number): void {
        if (this.isProgressing) { // 진행중일땐 리턴
            return;
        }
        if (this.selectedTiles.length >= 10 && !tile.pressed) {
            return this.transSystemMessage('games.alert.10_LIMIT');
        } else {
            tile.pressed = !tile.pressed;
        }
        this.resetBomb(); // 재시작 할땐 기존 정답타일(?)을 초기화 (View단에서 보기 않좋음)
        if (tile.pressed) {
            this.selectedTiles.push(index);
            this.playGameSound('dig');
        } else {
            for (let i = 0; i < this.selectedTiles.length; i++) {
                if (this.selectedTiles[i] === index) {
                    this.selectedTiles.splice(i, 1);
                    i--;
                }
            }
        }
        this.calcAllo();
    }

    /**
     * 게임시작 및 결과 받기
     */
    public doBet(): void {
        if (this.isProgressing) {
            return;
        }
        this.resetBomb();

        const betObj = {
            betAmount: this.amount,
            selectTile: this.selectedTiles
        };

        if (this.userInfo.id === 0) {
            return this.transSystemMessage('games.alert.NO_LOGIN');
        } else if (betObj.betAmount < GAMES.minBet) {
            return this.transSystemMessage('games.alert.minBet', { minBet: GAMES.minBet });
        } else if (betObj.betAmount > GAMES.maxBet) {
            return this.transSystemMessage('games.alert.maxBet', { maxBet: GAMES.maxBet });
        } else if (betObj.betAmount > this.userInfo.point || this.userInfo.point === 0) {
            return this.transSystemMessage('games.alert.NOT_ENOUGH_MONEY');
        }

        this.socket.Emit(GAME_KENO.game, 'doBet', betObj, async (err: string, resp: any) => { // resp {selVal, betResult}
            if (err) {
                this.svcMessage(err);
            } else {
                this.isProgressing = true;
                this.isAutoProgressing = true;
                const betPoint = resp.currentPoint - this.amount;
                this.eventSvc.setPoint(betPoint);
                this.eventSvc.setAmount(resp.gameInfo.betAmount);
                const point = betPoint + resp.gameInfo.winAmount;

                this.addMyGames({
                    id: resp.gameInfo.gameId,
                    hash:  resp.gameInfo.hash,
                    bet_amount: resp.gameInfo.betAmount,
                    sel_items: resp.gameInfo.selItems,
                    result: 'R',
                    answer: resp.gameInfo.answer,
                    win_amount: 0,
                    created_at: new Date()
                }, false);

                this.setMyGameList(this.myGames);
                this.recentGame.hash = resp.gameInfo.hash;
                this.recentGame.salt = resp.gameInfo.salt;
                this.answerCode = resp.gameInfo.answer + '-' + resp.gameInfo.salt;

                await this.setAnimationClass(resp.gameInfo, point, resp.gameInfo.winAmount, this.isAutoMode);
            }
        });
    }

    /**
     * 게임 그만하기 버튼 클릭 시
     */
    public stopBet(): void {
        this.isAutoMode = false;
        if (!this.isProgressing) {
            this.isAutoProgressing = false;
        }
    }

    /**
     * 퀵모드
     */
    public speedMode(e: any): void {
        const checked = e.checked;
        if (checked) {
            this.timeoutMs = 50;
            this.isSpeedMode = true;
        } else {
            this.timeoutMs = 200;
            this.isSpeedMode = false;
        }
    }

    /**
     * 오토모드
     */
    public autoMode(e: any): void {
        this.isAutoMode = e.checked;
    }

    /*
        타일 초기화
    */
    private resetTiles(): void {
        this.gameTiles = [];
        for (let i = 0; i < 80; i++) {
            this.gameTiles.push({ pressed: false, bingo: false, bomb: false });
        }
    }

    /**
     * 선택된 타일들만 리셋
     */
    private resetBomb(): void {
        this.gameTiles.forEach(res => {
            res.bomb = false;
        });
    }

    /**
     * 배당 계산
     */
    private calcAllo(): void {
        this.calcAmount = [];
        if (this.selectedTiles.length === 0 || this.amount === 0) {
            return;
        }
        const arr = this.allo[this.selectedTiles.length - 1];

        // for (let i = 0; i < arr.length; i++) {
        //     const allo = arr[i] * this.amount;
        //     this.calcAmount.push(allo);
        // }
        for (const a of arr) {
            const al = a * this.amount;
            this.calcAmount.push(al);
        }
    }

    private setGameSound(): void {
        this.setDefaultSound();
        this.addSound('bomb', this.assetsUrl.sounds + 'check-sound.wav');
        this.addSound('dig', this.assetsUrl.sounds + 'click-sound.wav');
        this.addSound('speed', this.assetsUrl.sounds + 'check-speed.wav');
    }

    private requestOtt(): void {
        this.isBetInit = true;
        // 서버에 접근하여 실제 userinfo를 가져온다.
        this.http.requestOtt(GAME_KENO.game, (paramObj) => {
            if (paramObj.error === false) {
                /*
                *@param resp : user: {}, ingGame: {}, dividend
                */
                this.socket.Emit(GAME_KENO.game, 'join', { ott: paramObj.ott }, (err: string, resp: any) => {
                    if (err) {
                        console.error('Error when joining the game...', err);
                        return;
                    }

                    this.allo = resp.dividend;
                    // 외부 연동 (게임 리스트 보내기)
                    // if (typeof resp === 'undefined') { // 회원정보를 수신 못한 경우
                    //     return;
                    // }
                    if (!resp.user) { // 회원정보를 수신 못한 경우
                        return;
                    }

                    const reversedMyGame = resp.myGames.reverse(); // connecDataObj.games 도 동시에 reversㄷ 됨
                    for (const rev of reversedMyGame) {
                        this.addMyGames(rev, true);
                    }

                    this.setMyGameList(this.myGames);

                    // this.setMyGameList(this.myGames);
                    this.userInfo.name = resp.user.name;
                    this.userInfo.id = resp.user.userId;
                    this.eventSvc.setPoint(resp.user.point);
                    this.nextGameId = null;
                    // this.recentGame.hash = this.cGameInfo.hash;
                });
            }
        }).finally(() => {
            setTimeout(() => {
                this.isBetInit = false;
            }, 1000);
        });
    }

    /**
     * @param Object obj {betAmount, createdAt, gameId, gameLevel, hash, result, salt, step, winAmount}
     */
    private addMyGames(obj: any, isInit?: boolean): void {
        obj.sel_items_arr = [];
        obj.answer_arr = [];
        const selArr = obj.sel_items.split(',').map(Number);
        const answerArr = obj.answer.split(',').map(Number);

        selArr.forEach((element: number) => {
            obj.sel_items_arr.push({
                selected: false,
                num: element
            });
        });
        answerArr.forEach((element: number) => {
            obj.answer_arr.push(element);
        });

        // 맨처음 init시에만 실행
        if (isInit) {
            obj.answer_arr.forEach((x: number) => {
                obj.sel_items_arr.forEach((y: any) => {
                    if (x === y.num) {
                        y.selected = true;
                    }
                });
            });
        }

        this.myGames.unshift(obj); // {userId, name, betAmount, incom, level, step, step} // player, Bet, winAmount Step

        if (this.myGames.length > 10) {
            this.myGames.splice(-1, 1);
        }
        this.nextGameId = this.myGames[0].id;
    }

    /*
        게임 결과 번호 노출 (여기서 내게임에서 정답 색변화가 같이 일어나야될듯..?)
    */
    private async setAnimationClass(resultObj: any, point: number, windAmount?: number, isAuto?: boolean): Promise<any> {
        const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
        this.winAmountStep = 0;
        const answer = resultObj.answer.split(',').map(Number);

        this.gameTiles.forEach(async (tile, i) => {
            await answer.forEach((result: number, index: number) => {
                if (i + 1 === result) {
                    wait(this.timeoutMs * (index)).then(() => {
                        if (this.isSpeedMode) {
                            if (index === 0) {
                                this.playGameSound('speed');
                            }
                        } else {
                            this.playGameSound('bomb');
                        }
                        tile.bomb = true;
                        if (tile.bomb && tile.pressed) {
                            this.winAmountStep += 1;
                        }

                        // 선택번호와 정답이 맞을 시 내 게임의 번호에 색상변화 로직 시작
                        if (this.myGames[0].id === resultObj.gameId) {
                            this.myGames[0].sel_items_arr.forEach((el: any) => {
                                if (el.num === result) {
                                    el.selected = true;
                                }
                            });
                        }
                    }).then(() => {
                        // 마지막 한번만 실행 함수들
                        if (answer.length === index + 1) {
                            if (!this.isAutoMode) {
                                this.isAutoProgressing = false;
                            }
                            this.isProgressing = false;
                            this.eventSvc.setPoint(point);
                            if (this.myGames[0].id === resultObj.gameId) {
                                this.myGames[0].result = resultObj.result;
                                this.myGames[0].win_amount = resultObj.winAmount;
                            }
                            if (this.winAmountStep > 0) {
                                this.transSystemMessage('games.alert.WIN_AMOUNT', {amount: windAmount}, null, 'start', 'success');
                                // this.transSystemMessage(`${windAmount}원 획득하셨습니다.`, null, null, 'start', 'success');
                            } else {
                                this.transSystemMessage('games.alert.WIN_AMOUNT', {amount: windAmount});
                                // this.transSystemMessage(`${windAmount}원 획득하셨습니다.`);
                            }
                            if (isAuto) {
                                setTimeout(() => {
                                    if ( !this.isAutoMode ) {
                                        this.isAutoProgressing = false;
                                        return;
                                    }
                                    this.doBet();
                                }, 2000);
                            }
                        }
                    });
                }
            });
        });
    }
}
