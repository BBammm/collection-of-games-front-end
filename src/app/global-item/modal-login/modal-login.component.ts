// import { group } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
// import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { EventService } from '../../services/event.service';
import { ModalFindComponent } from '../modal-find/modal-find.component';
import { SnackbarService } from '../../services/snackbar.service';
@Component({
    selector: 'app-modal-login',
    templateUrl: './modal-login.component.html',
    styleUrls: ['./modal-login.component.scss']
})
export class ModalLoginComponent implements OnInit {

    public isPending = false;
    public joinFormGroup = new FormGroup({
        email: new FormControl(undefined, [Validators.email, Validators.required]),
        name: new FormControl(undefined, [Validators.required]),
        password: new FormControl(undefined, [Validators.required]),
        password_check: new FormControl(undefined, [Validators.required]),
        // national_code: new FormControl(undefined, [Validators.required]),
        national_code: new FormControl('82', [Validators.required]),
        phone_number: new FormControl(undefined, [Validators.required]),
        phone_number_check: new FormControl(undefined, [Validators.required]),
        recommender: new FormControl(undefined),
        email_check: new FormControl(false, [Validators.required, Validators.requiredTrue]),
        // email_check: new FormControl(false, [Validators.required, Validators.requiredTrue]),
    });

    public loginFormGroup = new FormGroup({
        email: new FormControl(undefined, [Validators.email, Validators.maxLength(250), Validators.required]),
        password: new FormControl(undefined, [Validators.required])
    });

    constructor(
        private authService: AuthService,
        private router: Router,
        private eventSvc: EventService,
        private dialog: MatDialog,
        private dialogRef: MatDialogRef<ModalLoginComponent>,
        private titleSvc: Title,
        private translate: TranslateService,
        private snackbarSvc: SnackbarService
    ) {
        this.titleSvc.setTitle('LOGIN');
    }

    public ngOnInit(): void {
    }

    /**
     * 로그인 버튼 클릭 시
     */
    public async login(): Promise<string> {
        if (this.loginFormGroup.invalid) {
            this.isPending = false;
            return;
        }
        await this.authService.loginByEmail({
            email: this.loginFormGroup.value.email,
            password: this.loginFormGroup.value.password
        }).then((res: any) => {
        if (res.error) {
            this.snackbarSvc.show(res.error, { timeout: 3000, type: 'danger' }); // danger | success
            // this.systemMessage = res.error;
        } else {
            this.isPending = true;
            if (res.user.google2fa) {
                this.router.navigate(['/auth/otplogin'], { queryParams: { userToken: res.userToken } });
            } else {
                this.eventSvc.setLogStatus(true);
                this.router.navigate(['/'], {
                    skipLocationChange: true,
                });
                this.dialogRef.close();
            }
        }
        }).finally(() => {
            this.isPending = false;
        });
    }

    /**
     * 회원가입 버튼 클릭 시
     */
    public async join(): Promise<void> { // : Promise<string>

        if (!this.joinFormGroup.value.email_check) {
            this.translate.get('auth.messages.mail-dup-check')
                .subscribe((value) => {
                    this.snackbarSvc.show(value, { timeout: 3000, type: 'danger' });
                });
            return;
        }

        if (this.joinFormGroup.invalid) {
            this.isPending = false;
            return;
        }

        await this.authService.register({
            name: this.joinFormGroup.value.name,
            email: this.joinFormGroup.value.email,
            password: this.joinFormGroup.value.password,
            password_confirmation: this.joinFormGroup.value.password_check,
            recommand_code: this.joinFormGroup.value.recommender,
            national_code: parseInt(this.joinFormGroup.value.national_code, 10),
            mobile: this.joinFormGroup.value.phone_number,
            authNo: parseInt(this.joinFormGroup.value.phone_number_check, 10),
        }).then((res: any) => {
            if (res.error) {
                // this.snackbarService.show(res.error);
                this.snackbarSvc.show(res.error, { timeout: 3000, type: 'danger' }); // danger | success
            } else {
                this.isPending = true;
                this.snackbarSvc.show(res.message, { timeout: 3000, type: 'success' }); // danger | success
                this.dialogRef.close();
            }
        }).finally(() => {
            // this.isPending = false;
        });
    }

    /**
     * 이메일 중복검사
     */
    public emailCheck(): void {
        this.authService.checkEmail({
            email: this.joinFormGroup.value.email,
        }).then((res) => {
            if (res.error) {
                this.snackbarSvc.show(res.error, { timeout: 3000, type: 'danger' }); // danger | success
            } else {
                this.snackbarSvc.show(res.message, { timeout: 3000, type: 'success' }); // danger | success
                this.joinFormGroup.get('email_check').setValue(true);
                // console.log(this.joinFormGroup.getRawValue());
            }
        });
    }

    /**
     * 핸드폰 인증번호
     */
    public phoneNumCheck(): void {
        this.authService.checkPhoneNum({
            national_code: this.joinFormGroup.value.national_code,
            mobile: this.joinFormGroup.value.phone_number
        }).then((res) => {
            if (res.error) {
                this.snackbarSvc.show(res.error, { timeout: 3000, type: 'danger' });
            } else {
                this.snackbarSvc.show(res.message, { timeout: 3000, type: 'success' }); // danger | success
            }
        });
    }

    /**
     * 아이디/비밀번호 찾기 모달창 출력
     */
    public openFindModal(type: number): void {
        this.dialogRef.close();
        const dialogFindRef = this.dialog.open(ModalFindComponent, {
            data: { type },
            panelClass: 'sign-modal-container'
        });

        dialogFindRef.afterClosed().subscribe(() => {
            // console.log('The dialog was closed');
        });
    }

}
