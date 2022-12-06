import { Component, OnInit, OnDestroy } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy {

    public activeLinkIndex = -1;
    private ngUnsubscribe = new Subject();
    public navLinks = [
        {
            tranlate: 'history.tab-history',
            label: '',
            path: `./transac`,
            index: 1
        },
        {
            tranlate: 'history.tab-deposit',
            label: '',
            path: `./deposit`,
            index: 2
        }, {
            tranlate: 'history.tab-withdraw',
            label: '',
            path: `./withdraw`,
            index: 3
        }
    ];

    constructor(private translate: TranslateService) { }

    public ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    public ngOnInit(): void {
        setTimeout(() => {
            for (const link of this.navLinks) {
                this.translate.get(link.tranlate)
                    .pipe(takeUntil(this.ngUnsubscribe))
                    .subscribe((value) => {
                        link.label = value;
                });
            }
        }, 500);
     }

}
