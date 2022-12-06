import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { TransactionService } from '../../../services/transaction.service';
import { ActivatedRoute} from '@angular/router'; // , Router

@Component({
    selector: 'app-transaction',
    templateUrl: './transaction.component.html',
    styleUrls: ['./transaction.component.scss']
})
export class TransactionComponent implements OnInit {

    public history: any = [];

    /* request param 정의 */
    public pageParam: any;
    public requestQuery: any;
    public pagination = {currentPage: 0, collectionSize: 0, pageCount: 0}; //   pageSize: 0,
    public isPending = false;

    /* pagenation 정의 */
    public listLimit = 10;

    constructor(
        private transcSvc: TransactionService,
        private route: ActivatedRoute,
//        private router: Router,
        private titleSvc: Title
    ) {
        this.titleSvc.setTitle('TRANSACTION');
        this.route.queryParams.subscribe((params) => {
            this.pageParam = (params.page) ? (params.page) : 1;
        });
        this.getList();
    }

    public ngOnInit(): void {

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
            page: this.pageParam || 1,
            take: this.listLimit
        };

        this.transcSvc.changes(this.requestQuery).then((res) => {
            this.isPending = true;
            this.history = res.items.data;
            this.pagination = {
                currentPage: res.items.current_page,
                collectionSize: res.items.last_page,
                pageCount: 3
            };
            this.setIcon(this.history);
        }).catch((err) => {
            console.error(err);
        }).finally(()=>{
            this.isPending = false;
        });
    }

    private setIcon(list: any) {
        list.forEach(el => {
            switch(el.item) {
                case 'dice':
                    el.icon = 'dice-icon.svg'
                    break;
                case 'fifty':
                    el.icon = 'fifty-icon.svg'
                    break;
                case 'fourteen':
                    el.icon = 'fourteen-icon.svg'
                    break;
                case 'graph':
                    el.icon = 'graph-icon.svg'
                    break;
                case 'joker':
                    el.icon = 'joker-icon.svg'
                    break;
                case 'mine':
                    el.icon = 'mine-icon.svg'
                    break;
                case 'mining':
                    el.icon = 'mining-icon.svg'
                    break;
                case 'half':
                    el.icon = 'half-icon.svg'
                    break;
                case 'baccarat':
                    el.icon = 'baccarat-icon.svg'
                    break;
                case 'ladder':
                    el.icon = 'ladder-icon.svg'
                    break;
            }
        });
    }

}
