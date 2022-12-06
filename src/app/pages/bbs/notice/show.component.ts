import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BbsService } from '../../../services/bbs.service';
@Component({
  selector: 'app-show',
  templateUrl: './show.component.html',
  styleUrls: ['./show.component.scss']
})
export class NoticeShowComponent implements OnInit {
    public article: any;
    constructor(
        private activatedRoute: ActivatedRoute,
        private bbsSvc: BbsService,
    ) { }

    public ngOnInit(): void {
        this.activatedRoute.params.subscribe((params: any) => {
            this.loadData(params.id);
        });
    }

    private async loadData(id: number): Promise<any> {
        this.article = await this.bbsSvc.view('notice', id)
        .then((res: any) => {
            console.log(res);
            if (res.error) {
                console.error(res.error);
            } else {
                return res.article;
            }
        });
    }

}
