import { Injector, EventEmitter, Output } from '@angular/core';
import { SnackbarService } from '../../services/snackbar.service';
import { copyToClipboard } from '../../functions/common';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

export class BaseFairs {
    protected ngUnsubscribe = new Subject();

    // viewFlag = false;
    private snackbarSvc: SnackbarService;
    private translate: TranslateService;
    // @Output() protected popclosed = new EventEmitter();
    constructor(
        protected injector: Injector,
    ) {
        this.snackbarSvc = this.injector.get(SnackbarService);
        this.translate = this.injector.get(TranslateService);
    }
    /**
     * copyHash (추측 Hash에서 아이콘 클릭시)
     */
    public copyToClipboard(str: string): void {
        if (!str) {
            return;
        }
        copyToClipboard(str);
        // this.snackbarSvc.show('Copied', { type: 'success', timeout: 1000 });
        this.transSystemMessage('system.copied');
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


    // public chViewFlag () {
    //     this.viewFlag = !this.viewFlag;
    // }
  }
