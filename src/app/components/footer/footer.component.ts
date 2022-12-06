import { Component, OnInit } from '@angular/core';
import { ModalQnaComponent } from '../../global-item/modal-qna/modal-qna.component';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../services/auth.service';
import { InterfaceUserInfo } from '../../interface/game-userinfo';
import { ModalLoginComponent } from '../../global-item/modal-login/modal-login.component';
import { SnackbarService } from '../../services/snackbar.service';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

    private userInfo: InterfaceUserInfo;
    protected ngUnsubscribe = new Subject();

    constructor(
        public dialog: MatDialog,
        public authSvc: AuthService,
        public snackbarSvc: SnackbarService,
        public translate: TranslateService,
    ) { }

    public ngOnInit(): void {
        this.getUserInfo();
    }

    private getUserInfo(): void {
        this.userInfo = this.authSvc.user;
    }

    protected systemMessage(str: string, delaytime?: number, sound?: string, snackbarType?: string): void {
        delaytime = delaytime ? delaytime : 800;
        sound = sound ? sound : 'alert';
        this.snackbarSvc.show(str, { timeout: delaytime, type: snackbarType });
    }

    /**
     * qna모달창 출력
     */
    public qna(): void {
        this.getUserInfo();
        if (this.userInfo.id) {
            const qnaDialogRef = this.dialog.open(ModalQnaComponent, {
                panelClass: 'qna-modal-container'
            });

            qnaDialogRef.afterClosed().subscribe(() => {
            });
        } else {
            const loginDialogRef = this.dialog.open(ModalLoginComponent, {
                data: { name: 'this.name' },
                panelClass: 'sign-modal-container'
            });

            loginDialogRef.afterClosed().subscribe(() => {
                this.getUserInfo();
            });
        }
    }
}
