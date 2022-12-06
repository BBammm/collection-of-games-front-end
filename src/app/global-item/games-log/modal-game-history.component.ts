import { Component, OnInit, Inject } from '@angular/core'; // , , EventEmitter, Output ViewChild, ViewContainerRef, TemplateRef AfterViewInit,
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'; // , MatDialog, MatDialogRef
import { GameTransactionService } from '../../services/game-transaction.service';
import { copyToClipboard } from '../../functions/common';
import { SnackbarService } from '../../services/snackbar.service';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-modal-game-history',
    templateUrl: './modal-game-history.component.html',
    styleUrls: ['./modal-game-history.component.scss']
})
export class ModalGameHistoryComponent implements OnInit {
    protected ngUnsubscribe = new Subject();
    public myGamesHistory = [];
    public recentGamesHistory = [];
    public game: string;
    public moreBtn = {gameHis: true, myHis: true};
    // protected gameTranSvc: GameTransactionService;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: {type: number, title: string, list: any},
        private dialogRef: MatDialogRef<ModalGameHistoryComponent>,
        private gameTranSvc: GameTransactionService,
        private snackbarSvc: SnackbarService,
        private translate: TranslateService
    ) {
    }

    public ngOnInit(): void {
        this.setData();
    }

    private setData(): void {
        this.myGamesHistory = this.data.list.my;
        this.recentGamesHistory = this.data.list.recent;
        this.game = this.data.title;
        if ( this.data.list.my.length < 10) {
            this.moreBtn.myHis = false;
        }

        if (this.data.list.recent.length < 10) {
            this.moreBtn.gameHis = false;
        }
    }

    private setChoiceArr(obj: any): void {
        obj.sel_items_arr = [];
        obj.answer_arr = [];
        const sel_arr = obj.sel_items.split(',').map(Number);
        const answer_arr = obj.answer.split(',').map(Number);

        sel_arr.forEach(element => {
            obj.sel_items_arr.push({
                selected: false,
                num: element
            });
        });
        answer_arr.forEach(element => {
            obj.answer_arr.push(element);
        });

        // 맨처음 init시에만 실행
        obj.answer_arr.forEach((x) => {
            obj.sel_items_arr.forEach(y => {
                if (x === y.num) {
                    y.selected = true;
                }
            });
        });
    }

    public more(): void {
        switch (this.data.type) {
            case 0: // 최근 게임
                this.gameTranSvc.gamesLog(this.game, {offset: this.recentGamesHistory.length, take: 10}).then((res) => {
                    switch (this.data.title) {
                        case 'half':
                            res.data.forEach((el: any) => {
                                switch (el.result_number) {
                                    case 10:
                                        el.cardNum = 'J';
                                        break;
                                    case 11:
                                        el.cardNum = 'Q';
                                        break;
                                    case 12:
                                        el.cardNum = 'K';
                                        break;
                                    default:
                                        el.cardNum = el.result_number;
                                        break;
                                   }
                               });
                            break;
                        case 'dice':
                            res.data.forEach((el: any) => {
                                el.sum = el.dice1 + el.dice2;
                                if (el.sum % 2) {
                                    el.oddeven_str = 'games.dice.Odd';
                                } else {
                                    el.oddeven_str = 'games.dice.Even';
                                }

                                if (el.sum === 7) {
                                    el.lowhigh_str = '7';
                                } else if (el.sum < 7) {
                                    el.lowhigh_str = 'L';
                                } else if (el.sum > 7) {
                                    el.lowhigh_str = 'H';
                                }
                            });
                            break;
                        default:
                            break;
                    }
                    this.recentGamesHistory = this.recentGamesHistory.concat(res.data);
                    if (res.data.length < 10) {
                        this.moreBtn.gameHis = false;
                    }
                });
                break;
            case 1: // 마이 게임
                this.gameTranSvc.myGamesLog(this.game, {offset: this.myGamesHistory.length, take: 10}).then(async (res) => {
                    switch (this.data.title) {
                        case 'keno':
                            for (const data of res.data) {
                                this.setChoiceArr(data);
                            }
                            this.myGamesHistory = this.myGamesHistory.concat(res.data);
                            if (res.data.length < 10) {
                                this.moreBtn.myHis = false;
                            }
                            break;
                        case 'slot':

                            for (const obj of res.data) {
                                const cards = JSON.parse(obj.cards);
                                [cards[0], cards[1]] = [cards[1], cards[0]];    // 데이터 순서 변경
                                const select = obj.sel_items.split(',');
                                for (const [i, card] of cards.entries()) {
                                    card.ingame = false;
                                    card.cardArr = [];
                                    for (const c1 of card.cards) {
                                        const cardArr = (c1.card + c1.suit).toLowerCase();
                                        card.cardArr.push(cardArr);
                                    }
                                    select.forEach(y => {
                                        if (i + 1 === parseInt(y, 10)) {
                                            card.ingame = true;
                                        }
                                    });
                                }
                                obj.cardResult = [...cards];
                            }

                            this.myGamesHistory = this.myGamesHistory.concat(res.data);
                            if (res.data.length < 10) {
                                this.moreBtn.myHis = false;
                            }
                            break;
                        default:
                            this.myGamesHistory = this.myGamesHistory.concat(res.data);
                            if (res.data.length < 10) {
                                this.moreBtn.myHis = false;
                            }
                            break;
                    }
                });
                break;
        }

    }

    public selectedIndexChanged(e: number): void {
        this.data.type = e;
    }

    public copyToClipboard(str: string): void {
        if (!str) {
            return;
        }
        copyToClipboard(str);
        // this.snackbarSvc.show('Copied', { type: 'success', timeout: 1000 });
        this.transSystemMessage('system.copied', null, null, 'start', 'success');
        // this.snackbarService.show('copied', { timeout: 1000, type: 'success' });
    }

    public close(): void {
        // 현재 팝업창 닫기 ()
        // 이부분인 BaseFairs 에 들어갈 경우는 에러가 발생함..
        this.dialogRef.close();
    }

    protected systemMessage(str: string, delaytime?: number, sound?: string, snackbarType?: string): void {
        delaytime = delaytime ? delaytime : 800;
        this.snackbarSvc.show(str, { timeout: delaytime, type: snackbarType });
    }

    protected transSystemMessage(str: string, transoption?: any, delaytime?: number, sound?: string, snackbarType?: string): void {
        this.translate.get(str, transoption)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((value) => {
            this.systemMessage(value, delaytime, sound, snackbarType);
        });
    }

}
