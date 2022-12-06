import { Component, OnInit, ViewChild } from '@angular/core'; // , AfterViewInit
import { MatDrawer } from '@angular/material/sidenav';
import { Event, Router, NavigationEnd } from '@angular/router'; // NavigationCancel, NavigationEnd, NavigationError, NavigationStart,
import { Title } from '@angular/platform-browser';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
// import { fadeAnimation } from './animations/route-animation';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatomoInjector, MatomoTracker } from './components/matomo/public-api';
import { AuthService } from './services/auth.service';
import { EventService } from './services/event.service';
import { SocketMultiService } from 'ng-node-socket';
import { MAIN_SERVER } from '../environments/environment';
import { navigatorLanguage } from './functions/common';
import { MatDialog } from '@angular/material/dialog';
import { ModalLoginComponent } from './global-item/modal-login/modal-login.component';
import { InterfaceUserInfo } from './interface/game-userinfo';
import { HttpService } from './services/http.service';
import { MessageService } from './services/message.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
    private ngUnsubscribe = new Subject();

    @ViewChild('leftDrawer') public leftDrawer: MatDrawer;
    @ViewChild('rightDrawer') public rightDrawer: MatDrawer;

    public isPending = false;
    public userInfo: InterfaceUserInfo = {id: null, name: '', point: 0};

    constructor(
        public dialog: MatDialog,
        private router: Router,
        private authService: AuthService,
        private msgService: MessageService,
        private eventSvc: EventService,
        private matomoInjector: MatomoInjector,
        private matomoTracker: MatomoTracker,
        private titleSvc: Title,
        private socket: SocketMultiService,
        private translate: TranslateService,
        private http: HttpService
    ) {
        this.socket.init(MAIN_SERVER.socketName, MAIN_SERVER.socketUrl);
        this.matomoInjector.init('//mtm.koption.com/', 3);

        this.router.events.subscribe((routerEvent: Event) => {
            // this.checkRouterEvent(routerEvent);
            if (routerEvent instanceof NavigationEnd) {
                const user = this.authService.user;
                const url = window.location.href;
                // 접속사용자 정보 변경(For 관리자단)
                this.socket.Emit(MAIN_SERVER.socketName, 'setUser', {
                    id: this.authService.user.id,
                    name: this.authService.user.name,
                    email: this.authService.user.email,
                    url
                }, () => {
                    this.socket.On(MAIN_SERVER.socketName, 'clientAction')
                    .pipe(takeUntil(this.ngUnsubscribe))
                    .subscribe((data: any) => {
                        const obj = data[0];
                        switch (obj.actionType) {
                            case 'logout':
                                this.logout();
                                break;
                            case 'deposit':
                            case 'withdrawal':
                                this.http.get({ url: 'user' }).then((res) => {
                                    this.eventSvc.setPoint(res.user.point);
                                });
                                break;
                            case 'note':
                                console.log(obj);
                                this.msgService.unreadCount().then((res) => {
                                    this.eventSvc.setReadCount(res.unread);
                                });
                                // 관리자에서 메시지를 수신했을 경우 카운트를 변경하시면 됩니다.
                                break;
                        }

                    });
                });

                // mamoto 관련 업데이트 (For 방문자 통계)
                const title = this.titleSvc.getTitle();
                this.matomoTracker.setUserId(user.email);
                this.matomoTracker.setCustomUrl(url);
                // this.matomoTracker.setDocumentTitle(title);
                this.matomoTracker.trackPageView(title);
            }
        });
    }

    public ngOnInit(): void {
        this.authService.isAuthenticated();
        this.getUserInfo();
        this.initTranslate();
        this.eventSvc.getLogStatus()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(() => {
            this.getUserInfo();
        });


    }

    /**
     * isOpen
     */
    public menuToggle(ev: string): void {
        if (ev === 'l') {
            this.leftDrawer.toggle();
        } else if (ev === 'r') {
            this.rightDrawer.toggle();
        }
    }

    /**
     * lnb 닫기
     */
    public lnbClose(): void {
        this.leftDrawer.toggle();
    }

    /**
     * openLogin
     */
     public openLogin(): void {
        const dialogRef = this.dialog.open(ModalLoginComponent, {
            data: { name: 'this.name' },
            panelClass: 'sign-modal-container'
        });

        dialogRef.afterClosed().subscribe(() => {
            // console.log('The dialog was closed');
        });
    }

    /**
     * 로그아웃
     */
    public logout(): void {
        this.authService.logOut();
        location.href = '/';
    }

    // private checkRouterEvent(routerEvent: Event): void {
    //     if (routerEvent instanceof NavigationStart) {
    //         this.isPending = true;
    //     }
    //
    //     if (routerEvent instanceof NavigationEnd ||
    //         routerEvent instanceof NavigationCancel ||
    //         routerEvent instanceof NavigationError) {
    //             setTimeout(() => {
    //                 this.isPending = false;
    //             }, 500);
    //     }
    // }

    private getUserInfo(): void {
        this.userInfo = this.authService.user;
    }

    private initTranslate(): void {
        const userLang = navigatorLanguage();
        // Set the default language for translation strings, and the current language.
        this.translate.addLangs(['en', 'ko']);
        this.translate.setDefaultLang('ko'); // 이것을 로딩해 두지 않으면 가져오지를 못한다.?
        this.translate.setDefaultLang('en');
        // this.translate.use('en');
        const config = localStorage.getItem('config') ? JSON.parse(localStorage.getItem('config')) : {lan: userLang};

        this.translate.use(config.lan);
        // this.currentLang = this.translate.currentLang;
        this.translate.onLangChange.subscribe((e: LangChangeEvent) => {
            config.lan = e.lang;
            this.translate.use(config.lan);
            localStorage.setItem('config', JSON.stringify(config));
        });
    }

}
