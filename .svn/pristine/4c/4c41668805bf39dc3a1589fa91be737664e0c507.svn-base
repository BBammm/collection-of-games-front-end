import { Component, OnInit, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router'; // , Router
import { BbsService } from '../../../services/bbs.service';

@Component({
    selector: 'app-notice',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss']
})
export class NoticeListComponent implements OnInit, OnDestroy {
    public articles: any = [];
    private pageParam: any;
    private requestQuery: any;
    public pagination = {currentPage: 0, collectionSize: 0, pageCount: 0}; // pageSize: 0,
    private listLimit = 10;
    public startNo = 0; // 번호에 표시될 숫자
    constructor(
        private bbsSvc: BbsService,
        private route: ActivatedRoute,
        private titleSvc: Title
    ) {
        this.titleSvc.setTitle('NOTICE');
        this.route.queryParams.subscribe((params) => {
            this.pageParam = (params.page) ? (params.page) : 1;
        });
    }

    public ngOnInit(): void {
        this.recoverLastSearchValue();
        this.getList();
    }

    public ngOnDestroy(): void {
        this.bbsSvc.searchState = {
            page: this.pagination.currentPage
        };
    }

    /**
     * 페이지 변경 시
     */
    public pageChanged(page: number): void {
        this.pageParam = page;
        this.getList();
    }

    /**
     * 데이터 갖고오기
     */
    public getList(): void {
        this.requestQuery = {
            // page: ((this.pageParam || 1) - 1) * 10,
            page: this.pageParam || 1,
            take: this.listLimit
        };

        this.bbsSvc.lists('notice', this.requestQuery).then((res: any) => {
            this.articles = res.articles.data;

            this.pagination = {
                currentPage: res.articles.current_page, // 현재 페이지
                collectionSize: res.articles.last_page, // 총 page 수
                pageCount: 5 // (display 페이지수)
            };

            this.startNo = res.articles.total - (res.articles.current_page - 1) * this.listLimit;
        }).catch((err) => {
            console.log(err);
        });
    }

    private recoverLastSearchValue(): void {
        const lastSearch = this.bbsSvc.searchState;
        if (lastSearch) {
            this.pageParam = lastSearch.page;
        }
    }
}
