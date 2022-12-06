import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TransactionService } from '../../../services/transaction.service';
import { copyToClipboard } from '../../../functions/common';
import { SnackbarService } from '../../../services/snackbar.service';
import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-withdraw',
    templateUrl: './withdraw.component.html',
    styleUrls: ['./withdraw.component.scss']
})
export class WithdrawComponent implements OnInit {

    protected ngUnsubscribe = new Subject();
    public withdrawList: any = [];

    /* request param 정의 */
    private requestQuery: any;
    public pagination = { currentPage: 1, collectionSize: 0, pageCount: 0 }; //  pageSize: 0,

    /* pagenation 정의 */
    private listLimit = 10;
    public startNo = 0; // 번호에 표시될 숫자

    public isPending = false;

    constructor(
        private transcSvc: TransactionService,
        private snackbarSvc: SnackbarService,
        private translate: TranslateService,
    //    private route: ActivatedRoute,
        private titleSvc: Title
    ) {
        this.titleSvc.setTitle('WITHDRAWAL');
        this.getList();
    }

    public ngOnInit(): void {
    }

    /**
     * 페이지 변경 시
     */
    public pageChanged(page: number): void {
        // console.log('page - ', page);
        this.pagination.currentPage = page;
        this.getList();
    }

    private getList(): void {
        this.requestQuery = {
            page: this.pagination.currentPage || 1,
            take: this.listLimit
        };

        this.transcSvc.withdrawals(this.requestQuery).then((res) => {
            if (this.isPending) {
                return;
            }

            this.isPending = true;
            this.withdrawList = res.items.data;
            this.pagination = {
                currentPage: res.items.current_page,
                collectionSize: res.items.last_page,
                pageCount: 5
            };

            this.startNo = res.items.total - (res.items.current_page - 1) * this.listLimit;
        }).catch((err) => {
            console.error(err);
        }).finally(() => {
            this.isPending = false;
        });
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
