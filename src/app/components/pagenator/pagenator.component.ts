import { Component, Input, OnInit, Output, EventEmitter, OnChanges, SimpleChange } from '@angular/core'; // , NgModule
// import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-pagenator',
    templateUrl: './pagenator.component.html',
    styleUrls: ['./pagenator.component.scss']
})
export class PagenatorComponent implements OnInit, OnChanges {

    @Input() private collectionSize: number; // Number of elements/items in the collection. i.e. the total number of items the pagination should handle. (총 item 수)
//    @Input() private pageSize: number; // Number of elements/items per page. (페이지당 출력되는 item 수)
    @Input() private pageCount: number; // page 출력갯수
    @Input() public currentPage: number; //  현재페이지
    @Output() private currentPageChanged = new EventEmitter<number>(true);

    public pageInfo = { prev: 0, next: 0, total: [], lists: [], pageCount: 0 };

    constructor() { }
    public ngOnInit(): void {
    }

    public ngOnChanges(changes: { [propKey: string]: SimpleChange }): void {
        this.updatePages();
        for (const propName in changes) {
            if (changes.hasOwnProperty(propName)) {
                // const changedProp = changes[propName];
                // if (propName === 'active') {
                //
                // }
            }
        }
    }

    private updatePages(): void { // newPage: number

        const pageCount = this.collectionSize > this.pageCount ? this.pageCount : this.collectionSize;
        const blocks = Math.ceil(this.collectionSize / pageCount);
        const currentblock = Math.ceil(this.currentPage / pageCount);
        // const pageCount = this.collectionSize >

        if (this.currentPage < pageCount) {
            this.pageInfo.prev = 0;
        } else {
            this.pageInfo.prev = currentblock * pageCount - pageCount;
        }

        if (currentblock >= blocks) {
            this.pageInfo.next = 0;
        } else {
            this.pageInfo.next = currentblock * pageCount + 1;
        }

        const start = currentblock * pageCount - pageCount + 1;
        let end = start +  pageCount;

        end = end > this.collectionSize ? this.collectionSize + 1 : end;

        // if (currentblock > blocks) {
        //     end = start + pageCount + 1;
        // }
    //    console.log('currentblock', currentblock, 'blocks', blocks, 'start', start, 'end', end, 'this.pageCount', this.pageCount, 'this.collectionSize', this.collectionSize);

        this.pageInfo.lists = [];
        for (let i = start; i < end; i++) {
            this.pageInfo.lists.push(i);
        }

        // this.pageInfo.lists = this.pageInfo.total.slice(start, end);
/*
        // 총페이지 수
        this.pageInfo.pageCount = this.collectionSize;

        if (!this.isNumber(this.pageInfo.pageCount)) {
            this.pageInfo.pageCount = 1;
        }

        if (this.currentPage === 1 || this.currentPage === 0) {
            this.pageInfo.prev = 1;
        } else {
            this.pageInfo.prev = this.currentPage - 1;
            console.log('pageInfo.prev = ', this.pageInfo.prev);
        }

        if (this.currentPage >= this.collectionSize) {
            this.pageInfo.next = this.currentPage;
        } else {
            this.pageInfo.next = this.currentPage + 1;
        }

        // fill-in model needed to render pages
        this.pageInfo.total.length = 0;
        const pageCount = this.pageCount > this.collectionSize ? this.collectionSize : this.pageCount;
        // console.log(this.pageCount, this.collectionSize, pageCount);
        for (let i = 1; i <= pageCount; i++) {
            this.pageInfo.total.push(i);
        }

        console.log('this.pageInfo.total', this.pageInfo.total);

        const start = Math.ceil(( this.pageCount - 1) * this.pageCount);
        const end = start + this.pageCount;

        this.pageInfo.lists = this.pageInfo.total.slice(start, end);
        console.log(this.pageInfo);
        */
    }

    // private toInteger(value: any): number {
    //     return parseInt(`${value}`, 10);
    // }

    // private isNumber(value: any): value is number {
    //     return !isNaN(this.toInteger(value));
    // }

    public setPage(page: number): void {
        if (page === 0) {
            return;
        }
        this.currentPage = page;
        this.currentPageChanged.emit(page);
        this.updatePages();
    }

}
