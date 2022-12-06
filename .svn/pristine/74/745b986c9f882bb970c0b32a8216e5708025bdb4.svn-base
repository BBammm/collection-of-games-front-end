import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TransactionService } from '../../../services/transaction.service';
import { ActivatedRoute } from '@angular/router'; // , Router
// import * as moment from 'moment';

@Component({
    selector: 'app-deposit',
    templateUrl: './deposit.component.html',
    styleUrls: ['./deposit.component.scss']
})
export class DepositComponent implements OnInit {

    public depositList: any = [];

    /* request param 정의 */
    private pageParam: any;
    private requestQuery: any;
    public pagination = {currentPage: 0, collectionSize: 0, pageCount: 0}; //   pageSize: 0,
    /* pagenation 정의 */
    private listLimit = 10;
    public startNo = 0; // 번호에 표시될 숫자
    public isPending = false;
    constructor(
        private transcSvc: TransactionService,
        private route: ActivatedRoute,
        private titleSvc: Title
    ) {

        this.route.queryParams.subscribe((params) => {
            this.pageParam = (params.page) ? (params.page) : 1;
        });
        this.getList();
    }

    public ngOnInit(): void {
        this.titleSvc.setTitle('DEPOSIT');
    }

    /**
     * 페이지 변경 시
     */
    public pageChanged(page: number): void {
        this.pageParam = page;
        this.getList();
    }

    private getList(): void {
        this.requestQuery = {
            offset: ((this.pageParam || 1) - 1) * 10,
            take: this.listLimit
        };

        this.transcSvc.deposit(this.requestQuery).then((res) => {
            this.isPending = true;
            this.depositList = res.items.data;
            this.pagination = {
                currentPage: res.items.current_page,
            //    pageSize: this.listLimit,
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

}
