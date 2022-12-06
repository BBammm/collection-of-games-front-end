import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BbsService } from '../../services/bbs.service';
import { SnackbarService } from '../../services/snackbar.service';

@Component({
  selector: 'app-modal-qna',
  templateUrl: './modal-qna.component.html',
  styleUrls: ['./modal-qna.component.scss']
})
export class ModalQnaComponent implements OnInit {

    public selectedTabIndex: number;
    public bbsFormGroup: FormGroup;
    public category: any;
    public articles: any[] = [];
    public article: any;
    public comment: any;
    public isDetail = false;
    public isModified = false;

    constructor(
        private fb: FormBuilder,
        private bbsSvc: BbsService,
        private snackbarSvc: SnackbarService
    ) { }

    public ngOnInit(): void {
        this.bbsFormGroup = this.fb.group({
            category: ['', Validators.required],
            title: ['', [Validators.required]],
            content: ['', [Validators.required, Validators.maxLength(4000)]]
        });

        // 카테고리 가져오기
        this.getCategory();

    }

    public onTabChanged($ev: any): void {
        switch ($ev.index) {
            case 0: // !:1 문의 (작성하기)
                this.isDetail = false;
                break;
            case 1: // 문의내역 보기
                this.getList();
                break;
        }
    }

    private async getCategory(): Promise<any> {
        const resp = await this.bbsSvc.category('qna');
        this.category = resp.category;
    }

    public async submit(): Promise<any> {
        if (this.bbsFormGroup.invalid) {
            return this.snackbarSvc.trans('bbs.qna.some-required');
        }
        let body = {};
        body = {
            category: this.bbsFormGroup.get('category').value,
            title: this.bbsFormGroup.get('title').value,
            content: this.bbsFormGroup.get('content').value,
        };

        try {
            await this.bbsSvc.write('qna', body).then((res: any) => {
                if (!res.error) {
                    this.snackbarSvc.trans('bbs.qna.done-message');
                    this.bbsFormGroup.reset();
                } else {
                    return this.snackbarSvc.show(res.error);
                }
            });
        } catch (error) {
            return this.snackbarSvc.show(error);
        } finally {

        }
    }

    /**
     * 내용가져오기
     */
    private async getList(): Promise<any> {
        const resp = await this.bbsSvc.lists('qna', {offset: 0, take: 10});
        this.articles = resp.articles;
    }

    /**
     * 내용가져오기
     */
    public async viewDetail(id: number): Promise<void> {
        this.isDetail = true;
        const resp = await this.bbsSvc.view('qna', id);
        this.article = resp.article;
        this.comment = resp.comment[0];
    }

    public async closeDetail(): Promise<void> {
        this.isDetail = false;
    }

}
