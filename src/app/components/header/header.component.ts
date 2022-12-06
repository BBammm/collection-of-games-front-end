import { Component, EventEmitter, OnInit, Output, OnDestroy, Injector } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/services/auth.service';
import { ModalLoginComponent } from '../../global-item/modal-login/modal-login.component';
import { ModalInboxComponent } from '../../global-item/modal-inbox/modal-inbox.component';
import { EventService } from '../../services/event.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { navigatorLanguage } from '../../functions/common';
import { MessageService } from '../../services/message.service';
import { Howl } from 'howler';
import { Globals } from '../../services/globals';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
    private ngUnsubscribe = new Subject();

    @Output() private menuEvent = new EventEmitter();
    public userInfo: any = {id: null, name: '', point: 0};
    public currentLang = {
        lan: null
    };
    public unreadCnt: number;
    protected sounds: any = {};
    // soundFlag를 추후 global에서 사운드 on/off을 넣어줘야함
    protected soundFlag: boolean = true;
    protected globals: Globals;

    constructor(
        public dialog: MatDialog,
        private authService: AuthService,
        private messageSvc: MessageService,
        private eventSvc: EventService,
        private translate: TranslateService,
        // 추후 소리 on/off시 필요
        // protected injector: Injector,
    ) {
        // 추후 소리 on/off시 필요
        // this.globals = this.injector.get(Globals);
        this.eventSvc.getPoint()
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((res) => {
            this.userInfo.point = res;
        });
        this.eventSvc.getReadCount()
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe((res) => {
            this.unreadCnt = res;
            this.playGameSound('alert');
        });
        this.setDefaultSound();
    }

    protected setDefaultSound(): void {
        const commonSound =  './assets/sound/';
        this.addSound('alert', commonSound + 'dingdong.mp3'); // alert sound
    }

    protected addSound(name: string, file: string): void {
        this.sounds[name] = new Howl({
            src: [file],
            preload: true,
        });
    }
    /**
     * @param String sound : play, wailt, alert
     */
    protected playGameSound(sound: string): void {
        if (this.soundFlag) {
            this.sounds[sound].play();
        }
    }

    public ngOnInit(): void {
        this.authService.isAuthenticated();
        this.getUserInfo();
        this.getNotReadMsgCount();

        this.eventSvc.getLogStatus()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(() => {
            this.getUserInfo();
        });

        const userLang = navigatorLanguage();
        this.currentLang = localStorage.getItem('config') ? JSON.parse(localStorage.getItem('config')) : {lan: userLang};
    }

    public ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    private getUserInfo(): void {
        this.userInfo = this.authService.user;
    }

    private getNotReadMsgCount(): void {
        this.messageSvc.unreadCount().then((res) => {
            if (res.error) {
                return;
            }
            this.unreadCnt = res.unread;
            this.eventSvc.setReadCount(res.unread);
        }).catch((error) => {
            console.log(error);
        });
    }

    /**
     * 상단 메뉴 오픈
     * @params side : r - Right l - Left
     */
    public menuOpen(side: string): void {
        this.menuEvent.emit(side);
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
            console.log('The dialog was closed');
            this.getNotReadMsgCount();
        });
    }


    /**
     * openInbox
     */
    public openInbox(): void {
        const dialogRef = this.dialog.open(ModalInboxComponent, {
            panelClass: 'inbox-modal-container'
        });

        dialogRef.afterClosed().subscribe(() => {
            console.log('The dialog was closed');
            this.getNotReadMsgCount();
        });
    }

    /**
     * 언어선택
     */
    public changeLang(lan: string): void {
        this.translate.use(lan);
        this.currentLang.lan = lan;
    }

}
