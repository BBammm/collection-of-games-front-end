import { Component, Inject, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ModalLoginComponent } from '../../global-item/modal-login/modal-login.component';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { SnackbarService } from '../../services/snackbar.service';

@Component({
    selector: 'app-modal-find',
    templateUrl: './modal-find.component.html',
    styleUrls: ['./modal-find.component.scss']
})
export class ModalFindComponent implements OnInit {

    public findEmailGroup = new FormGroup({
        name: new FormControl(undefined, [Validators.maxLength(250), Validators.required]),
        national_code: new FormControl('82', [Validators.required]),
        phone: new FormControl(undefined, [Validators.required])
    });
    public findPwdGroup = new FormGroup({
        email: new FormControl(undefined, [Validators.email, Validators.maxLength(250), Validators.required]),
        name: new FormControl(undefined, [Validators.maxLength(250), Validators.required]),
    });
    public checkCertiGroup = new FormGroup({
        certification_number: new FormControl(undefined, [Validators.required]),
        key_number: new FormControl(undefined, [Validators.required]),
    });
    public resetPwdGroup = new FormGroup({
        password: new FormControl(undefined, [Validators.maxLength(250), Validators.required]),
        password_check: new FormControl(undefined, [Validators.maxLength(250), Validators.required]),
    });

    public step = 1;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: {type: number},
        private dialog: MatDialog,
        private dialogRef: MatDialogRef<ModalFindComponent>,
        private authSvc: AuthService,
        private titleSvc: Title,
        private snackbarSvc: SnackbarService
    ) {
        this.titleSvc.setTitle('Find Email or password');
    }

    public ngOnInit(): void {
    }

    /**
     * openLogin
     */
    public openLogin(): void {
        this.dialogRef.close();
        const dialogRef = this.dialog.open(ModalLoginComponent, {
            data: { name: 'this.name' },
            panelClass: 'sign-modal-container'
        });

        dialogRef.afterClosed().subscribe(() => {
            // console.log('The dialog was closed');
        });
    }

    /**
     *  이메일찾기
     */
    public findEmail(): void {
        const queryParam = {
            name: this.findEmailGroup.value.name,
            national_code: this.findEmailGroup.value.national_code,
            mobile: this.findEmailGroup.value.phone,
        };
        this.authSvc.findEmail(queryParam).then((res: any) => {
            if (!res.error) {
                return this.snackbarSvc.show(res.message, { timeout: 3000, type: 'success' });
            } else {
                return this.snackbarSvc.show(res.error, { timeout: 3000, type: 'danger' });
            }
        });
    }

    /**
     *  인증번호 받기
     */
    public getAuthKey(): void {
        const queryParam = {
            name: this.findPwdGroup.value.name,
            email: this.findPwdGroup.value.email,
        };
        this.authSvc.findPwdGetAuth(queryParam).then((res: any) => {
            if (!res.error) {
                this.step = 2;
                this.checkCertiGroup.patchValue({
                    key_number: res.key,
                });
                this.snackbarSvc.show(res.message, { timeout: 3000, type: 'success' });
            } else {
                this.snackbarSvc.show(res.error, { timeout: 3000, type: 'danger' }); // danger | success
                return;
            }
        });
    }

    /**
     *  인증번호 확인
     */
    public checkAuthNum(): void {
        const queryParam = {
            authKey: this.checkCertiGroup.value.key_number,
            authNo: this.checkCertiGroup.value.certification_number,
        };

        this.authSvc.findPwdCheckAuth(queryParam).then((res: any) => {
            if (!res.error) {
                this.step = 3;
                this.snackbarSvc.show(res.message, { timeout: 3000, type: 'success' });
            } else {
                return this.snackbarSvc.show(res.error, { timeout: 3000, type: 'danger' }); // danger | success
            }
        });
    }

    /**
     *  신규 비밀번호 설정
     */
    public newPwd(): void {
        const queryParam = {
            authKey: this.checkCertiGroup.value.key_number,
            authNo: this.checkCertiGroup.value.certification_number,
            password: this.resetPwdGroup.value.password,
            password_confirmation: this.resetPwdGroup.value.password_check
        };
        this.authSvc.findPwdNewPwd(queryParam).then((res: any) => {
            if (!res.error) {
                this.resetPwdGroup.patchValue({
                    password: '',
                    password_check: ''
                });
                this.step = 1;
                this.snackbarSvc.show(res.message, { timeout: 3000, type: 'success' });
            } else {
                return this.snackbarSvc.show(res.error);
            }
        });
    }

}
