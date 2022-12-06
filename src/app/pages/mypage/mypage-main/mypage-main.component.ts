import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router'; // , Router
import { AuthService } from '../../../services/auth.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { SnackbarService } from '../../../services/snackbar.service';

@Component({
    selector: 'app-mypage-main',
    templateUrl: './mypage-main.component.html',
    styleUrls: ['./mypage-main.component.scss']
})
export class MypageMainComponent implements OnInit {

    public isPending = false;

    public user: any;
    public pwdObj = {
        current_password: '',
        password: '',
        password_confirmation: ''
    };
    public secetionGroup = new FormGroup({
        password: new FormControl(undefined, [Validators.maxLength(250), Validators.required]),
        reason: new FormControl(undefined)
    });
    public authParam = {
        key: null,
        num: null,
    };

    public isChangePhoneNum = true;
    public isBeforePwd = true;

    constructor(
        private authService: AuthService,
        private readonly route: ActivatedRoute,
        // private readonly router: Router,
        private titleSvc: Title,
        public snackbarSvc: SnackbarService
    ) {
        this.titleSvc.setTitle('MYPAGE');
    }

    public ngOnInit(): void {
        this.route.data.subscribe({
            next: (data) => this.user = data.user.user,
        });
        console.log(this.user);
    }

    private validatePassword(character: string): any {
        return /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/.test(character);
    }

    /**
     * 핸드폰번호 인증번호 받기
     */
    public checkPhoneNum(): void {
        const params = {
            national_code: 82,
            mobile: this.user.mobile
        };
        this.authService.userCheckPhoneNum(params).then((res) => {
            if (res.error) {
                this.snackbarSvc.show(res.error);
            } else {
                this.snackbarSvc.show(res.message, {type: 'success'});
                this.authParam.key = res.id;
            }
        });
    }

    /**
     * 핸드폰번호 입력 후 변경
     */
    public changePhoneNum(): void {
        const params = {
            authKey: this.authParam.key,
            authNo: this.authParam.num,
            mobile: this.user.mobile,
            national_code: 82
        };
        this.authService.userChangePhoneNum(params).then((res) => {
            console.log(res);
            if (res.error) {
                this.snackbarSvc.show(res.error);
                this.isChangePhoneNum = false;
            } else {
                this.snackbarSvc.show(res.message, {type: 'success'});
                this.authParam.num = null;
                this.isChangePhoneNum = true;
            }
        });
    }

    /**
     * 비밀번호 변경
     */
    public changePwd(): void {
        if (!this.pwdObj.current_password) {
            return this.snackbarSvc.trans('mypage.validation.current-password-required');
        }

        if (!this.pwdObj.password) {
            return this.snackbarSvc.trans('mypage.validation.password-required');
        }

        if (this.pwdObj.current_password === this.pwdObj.password) {
            return this.snackbarSvc.trans('mypage.validation.must-diff-newpassword');
        }

        // if (this.pwdObj.password.length < 8) {
        //     alert('패스워드는 최소 8자 이상입니다.');
        //     return;
        // }
        //
        // if (this.pwdObj.password.length > 15) {
        //     alert('패스워드는 최대 15자 미만입니다.');
        //     return;
        // }
        //
        // if (this.pwdObj.password_confirmation !== this.pwdObj.password) {
        //     alert('패스워드가 일치하지 않습니다.');
        //     return;
        // }

        if (!this.validatePassword(this.pwdObj.password) || !this.validatePassword(this.pwdObj.password_confirmation)) {
            return this.snackbarSvc.trans('mypage.validation.password-type-error');
        }

        this.authService.updatePassword(this.pwdObj).then((res: any) => {
            if (res.error) {
                // this.isBeforePwd = false;
                this.snackbarSvc.show(res.error);
            } else {
                // this.isBeforePwd = true;
                this.pwdObj = {
                    current_password: '',
                    password: '',
                    password_confirmation: ''
                };
                this.secetionGroup.reset();
                this.snackbarSvc.show(res.message, {type: 'success'});
            }
        }).finally(() => {

        });
    }

    /*
     * 탈퇴핟기
     */
    public async secetion(): Promise<string> {
        if (this.secetionGroup.invalid) {
            this.isPending = false;
            return;
        }
        await this.authService.secetion({
            password: this.secetionGroup.value.password,
            reason: this.secetionGroup.value.reason,
        }).then((res: any) => {
            if (res.error) {
                this.snackbarSvc.show(res.error);
                // alert(res.error);
            } else {
                this.isPending = true;
                this.snackbarSvc.show(res.message, {type: 'success'});
                this.secetionGroup.reset();
                this.pwdObj = {
                    current_password: '',
                    password: '',
                    password_confirmation: ''
                };
                // alert('탈퇴신청이 완료되었습니다.');
            }
        }).finally(() => {
        });
    }

}
