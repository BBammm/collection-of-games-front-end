import { Injectable } from '@angular/core';
import { HttpService } from './http.service';

interface PreservedSearchState {
    page: number;
}

@Injectable({
    providedIn: 'root'
})
export class BbsService {

    // 리스트에서 페이지를 벗어날경우(view 진입할 경우 리스트의 검색 param등을 보존하기 위해 추가 처리
    private lastSearch: PreservedSearchState;

    get searchState(): PreservedSearchState {
        return this.lastSearch;
    }

    set searchState(lastSearch: PreservedSearchState) {
        this.lastSearch = lastSearch;
    }
    constructor(
        private http: HttpService
    ) { }

    /**
     * bbs 리스트 갖고오기
     */
    public lists(table: string, params: any): Promise<any> {
        return new Promise((resolve) => {
            this.http.get({ url: 'bbs/' + table + '/lists', params }).then((res) => {
                resolve(res);
            });
        });
    }

    /**
     * bbs 디테일 갖고오기
     */
    public view(table: string, id: number): Promise<any> {
        return new Promise((resolve) => {
            this.http.get({ url: 'bbs/' + table + '/show/' + id }).then((res) => {
                resolve(res);
            });
        });
    }

    /**
     * bbs 작성하기
     */
    public write(table: string, params: any): Promise<any> {
        console.log(table, params);
        return new Promise((resolve) => {
            this.http.post({ url: 'bbs/' + table, params }).then((res) => {
                resolve(res);
            });
        });
    }

    /**
     * 카테고리 가져오기
     */
    public category(table: string): Promise<any> {
        return new Promise((resolve) => {
            this.http.get({ url: 'bbs/' + table + '/category' }).then((res) => {
                resolve(res);
            });
        });
    }
}
