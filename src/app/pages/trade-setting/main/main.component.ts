import { Component, OnInit, OnDestroy } from '@angular/core'; // , AfterViewInit
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss']
})
export class MainComponent implements OnInit, OnDestroy { // , AfterViewInit
    public activeLinkIndex = -1;
    private ngUnsubscribe = new Subject();
    public navLinks = [
        {
            tranlate: 'dep-wdl.title-deposit',
            label: '',
            path: `./deposit`,
            index: 1
        }, {
            tranlate: 'dep-wdl.title-withdraw',
            label: '',
            path: `./withdraw`,
            index: 2
        }
    ];

    constructor(
        private translate: TranslateService
    ) { }

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
