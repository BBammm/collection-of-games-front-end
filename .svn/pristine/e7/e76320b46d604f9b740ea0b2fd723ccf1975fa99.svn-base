import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { LocalStorageService } from 'ng-storages';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    _user = {
        id: null,
        encryptedId: null,
        name: null,
        email: null,
        level: null,
        point: 0,
//        google2fa: false,
        hold_point: 0
    };
    constructor(
        private http: HttpService,
        private storage: LocalStorageService,
        private jwtHelper: JwtHelperService
    ) {
        this.isAuthenticated(); // 로그인 된 상태인지 확인
    }

    // 현재 유효한 토큰값을 가지고 있는지 확인
    public isAuthenticated(): boolean {
        const token = localStorage.getItem('userToken');
        const tokenExpired = this.jwtHelper.isTokenExpired(token);
        if (tokenExpired) { // 기존의 모든 세션을 삭제
            this.logOut();
        } else {
            const user = localStorage.getItem('user');
            this._user = JSON.parse(user);
        }
        return !tokenExpired;
    }

    /**
     * 로그인 유무 체크
     * @return user | false if isLoggedIn return user else false
     */
    public isLoggedIn(): Promise<any> {
        return new Promise((resolve) => {
            this.storage.get('userToken').then((res) => {
                if (!res) {
                    this.user = null;
                    resolve({ result: false });
                }
            }).then(() => {
                this.storage.getObject('user').then((res1) => {
                    this.user = res1;
                    if (res1) {
                        resolve({ result: true, user: this.user });
                    } else {
                        resolve({ result: false });
                    }
                });
            });
        });
    }

    private clearUser(): void {
        this._user = {
            id: null,
            encryptedId: null,
            name: null,
            email: null,
            point: 0,
            level: null,
//            google2fa: false,
            hold_point: 0
        };

        this.storage.setObject({ user: this._user });
    }

    /**
     * mypage에서 쓰는 유저정보
     */
    public getUserDetail(): Promise<any> {
        return new Promise((resolve) => {
            this.http.get({ url: 'user' }).then((res) => {
                resolve(res);
            });
        });
    }

    /*
     * 전역으로 쓰는 user정보
     */
    get user(): any {
        return this._user;
    }

    set user(user: any) {
        if (user) {
            this._user.id = user.id;
            this._user.encryptedId = user.encryptedId;
            this._user.name = user.name;
            this._user.email = user.email;
            this._user.point = user.point;
            this._user.level = user.level;
//            this._user.google2fa = user.google2fa;
            this._user.hold_point = user.hold_point;

            this.storage.setObject({ user: this._user });
        } else {
            this.clearUser();
        }
    }

    public updateUser(k: string, v: any): void {
        this._user[k] = v;
        this.storage.setObject({ user: this._user });
    }

    /**
     * 로그인 확인인 validate 까지 확인
     */
    public validate(): Promise<any> {
        return new Promise((resolve) => {
            this.storage.get('userToken')
                .then((token) => {
                    if (token === null) {
                        resolve(false);
                    } else {
                        this.tokenValidation().then((res) => {
                            // 유효성 체크
                            if (res.error === false) {
                                resolve(res);
                            } else {
                                resolve(false);
                            }
                        });
                    }
                });
        });
    }

    /**
     * 이메일 중복 체크
     */
    public checkEmail(params: any): Promise<any> {
        return new Promise((resolve) => {
            this.http.get({ url: 'check-user-email', params }).then((res) => {
                resolve(res);
            });
        });
    }

    /**
     * 핸드폰 인증번호 발송
     */
    public checkPhoneNum(params: any): Promise<any> {
        return new Promise((resolve) => {
            this.http.post({ url: 'sendSms/register', params }).then((res) => {
                resolve(res);
            });
        });
    }
    /**
     * 기존 회원 새 핸드폰 인증번호 받기
     */
    public userCheckPhoneNum(params: any): Promise<any> {
        return new Promise((resolve) => {
            this.http.post({ url: 'sendSmsauth/ch-mobile', params }).then((res) => {
                resolve(res);
            });
        });
    }

    /**
     * 기존 회원 핸드폰번호 변경
     */
    public userChangePhoneNum(params: any): Promise<any> {
        return new Promise((resolve) => {
            this.http.put({ url: 'mypage/change-mobile', params }).then((res) => {
                resolve(res);
            });
        });
    }

    public tokenValidation(): Promise<any> {
        return new Promise((resolve) => {
            this.http.get({ url: 'validToken' }).then((res) => {
                resolve(res);
            });
        });
    }

    public register(params: any): Promise<any> {
        return new Promise((resolve) => {
            this.http.post({ url: 'register', params }).then((res) => {
                resolve(res);
            });
        });
    }

    public loginByEmail(params: any): Promise<any> {
        return new Promise((resolve) => {
            this.http.post({ url: 'login', params }).then((res) => {
                if (res.error === false) {
                    this.user = res.user;
                    this.storage.set({ userToken: res.userToken });
                }
                resolve(res);
            });
        });
    }

    public loginByOTP(params: any): Promise<any> {
        return new Promise((resolve) => {
            this.http.postOtp({ url: '2fa-login', params }).then((res) => {
                // {"message":"The given data was invalid.","errors":{"totp":["Not a valid token "]}
                if (res.error === false) {
                    this.user = res.user;
                    this.storage.set({ userToken: res.userToken });
                }
                resolve(res);
            });
        });
    }

    /**
     * 패스워드 변경
     */
    public updatePassword(params: any): Promise<any> {
        return new Promise((resolve) => {
            this.http.put({ url: 'mypage/change-password', params }).then((res) => {
                resolve(res);
            });
        });
    }

    /**
     * 패스워드 찾기 (authKey 획득)
     */
    public findPwdGetAuth(params: any): Promise<any> {
        return new Promise((resolve) => {
            this.http.post({ url: 'find/password/getauth', params }).then((res) => {
                resolve(res);
            });
        });
    }

    /**
     * 패스워드 찾기 (authKey, authNo 체크)
     */
    public findPwdCheckAuth(params: any): Promise<any> {
        return new Promise((resolve) => {
            this.http.post({ url: 'find/password/auth-check', params }).then((res) => {
                resolve(res);
            });
        });
    }

    /**
     * 패스워드 찾기 (신규 패스워드 입력)
     */
    public findPwdNewPwd(params: any): Promise<any> {
        return new Promise((resolve) => {
            this.http.put({ url: 'update/password-by-authkey', params }).then((res) => {
                resolve(res);
            });
        });
    }

    /**
     * 이메일 찾기
     */
    public findEmail(params: any): Promise<any> {
        return new Promise((resolve) => {
            this.http.post({ url: 'find/email', params }).then((res) => {
                resolve(res);
            });
        });
    }

    public logOut(): Promise<any> {
        return new Promise((resolve) => {
            this.storage.clear().then((res) => {
                this.clearUser();
                resolve(res);
            });
        });
    }

    public secetion(params: any): Promise<any> {
        return new Promise((resolve) => {
            this.http.post({ url: 'mypage/rollout', params }).then((res) => {
                resolve(res);
            });
        });
    }

}
