import { NgModule, Component, OnDestroy, OnInit, EventEmitter, Output, ViewChild, Input, ElementRef, OnChanges, SimpleChange } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { SocketMultiService } from 'ng-node-socket';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { MAIN_SERVER } from '../../../environments/environment';

import { AuthService } from '../../services/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { SnackbarService } from '../../services/snackbar.service';

@Component({
    selector: 'app-chat',
    templateUrl: 'chat.html',
    styleUrls: ['./chat.scss']
})

export class ChatComponent implements OnDestroy, OnInit, OnChanges {
//    @ViewChild('scrollMe') public scrollMe: any;
    @Output() private menuEvent = new EventEmitter();
    @Input() private menuEventChange: string;
    @ViewChild('scrollMe') private scrollMe: ElementRef;
    private ngUnsubscribe = new Subject();
    public inputMessage = '';
//    public onlineCnt = 0;
    public messages: string[] =  [];
    public currentLang: any;
    public languageToggle = false;
    // public isMe = false;
    public laguages = [
        {
            text: 'English',
            lan: 'en',
            url: '/assets/images/common/flags-icon-en.png'
        },
        {
            text: '한국어',
            lan: 'ko',
            url: '/assets/images/common/flags-icon-ko.png'
        },
        {
            text: '日本',
            lan: 'ja',
            url: '/assets/images/common/flags-icon-ja.png'
        },
        {
            text: 'Tiếng việt',
            lan: 'vi',
            url: '/assets/images/common/flags-icon-vi.png'
        }

    ];
    constructor(
            private socket: SocketMultiService,
            private authService: AuthService,
            private snackbarSvc: SnackbarService,
    ) {

    }

    public ngOnInit(): void {
        // this.displayCurrentLanguage();
        this.socket.init(MAIN_SERVER.socketName, MAIN_SERVER.socketUrl);
        this.currentLang = this.laguages[0];
/*
        this.eventSvc.getLogStatus()
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(() => {
            // this.getUserInfo();
        });
*/
        this.socket.On(MAIN_SERVER.socketName, 'connection')
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(() => {
            // 서버와 연결이 완료되면 현재 사용자 정보를 보내고 채팅 리스트를 받아 온다.
            // this.socket.Emit('chat', 'join', {name: this.authService.user.name, lan: this.currentLang.lan}, (err: string, resp: any) => {
            // 로그인시는 실회원정보를 입력한다.
            this.socket.Emit(MAIN_SERVER.socketName, 'chatJoin', {lan: this.currentLang.lan}, (err: string, resp: any) => {
                if (err) {
                    console.error(err);
                } else {
                    this.messages = [];
                //    this.onlineCnt = resp.count;
                    // console.log(resp);
                    // [{"name":"ncbit","lan":"en","message":"test","user":{"name":"ncbit","id":1,"lan":"en"}]}"] // user 항목은 join시 설정된 정보이고 앞의 내용은 채팅시 보낸정보이다.
                    const reversed = resp.chatList.reverse();
                    for (const message of reversed) {
                        this.trimMessage(JSON.parse(message));
                    }
                }
            });

            this.socket.On(MAIN_SERVER.socketName, 'receiveMessage')
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((resp: any) => {
                if (resp[0].lan === this.currentLang.lan) {
                    this.trimMessage(resp[0]);
                }
            });
        });
    }

    public ngOnChanges(changes: { [propKey: string]: SimpleChange }): void {
        for (const propName in changes) {

            if (changes.hasOwnProperty(propName) && propName === 'menuEventChange') {
                if (changes[propName].currentValue === 'open') {
                    this.scrollTop();
                }
            }
        }
    }

    public ngOnDestroy(): void {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    /**
     * @param object msg {name, lan, message}
     */
    private trimMessage(msg: any): void {
        this.messages.push(msg);
        this.scrollTop();
    }

    public lanToggle(): void {
        this.languageToggle = !this.languageToggle;
    }

    public sendMsg(): void {
        this.sendMessage(this.inputMessage);
    }

    /**
     * 채팅 메시지 전송
     */
    private sendMessage(message: string): void {
        if (!message) {
            return;
        }

        if (!this.authService.user.id) {
            return this.snackbarSvc.trans('auth.login-required');
        }
        // this.socket.Emit('chat', 'sendMessage', {name: this.authService.user.name, lan: this.currentLang.lan, message: message}, (err: string) => {
        this.socket.Emit(MAIN_SERVER.socketName, 'sendMessage', {
            name: this.authService.user.name,
            lan: this.currentLang.lan,
            message
        }, (err: string, resp: any) => {
            this.trimMessage(resp);
            this.inputMessage = '';
            if (err) {
                return this.snackbarSvc.show(err);
            }
        });
    }

    public setCurrentLan(lan: string): void {
        this.currentLang = lan;
        this.languageToggle = false;

        this.socket.Emit(MAIN_SERVER.socketName, 'switchLanguage', {lan: this.currentLang.lan}, (err: string, resp: any) => {
            this.messages = [];
            if (err) {
                console.error('Error while switching language...', err);
                return this.snackbarSvc.show(err);
            }
            const reversed = resp.reverse();
            for (const message of reversed) {
                this.trimMessage(JSON.parse(message));
            }
        });
    }

    /**
     * 채팅창 닫기
     *
     */
    public chatClose(side: string): void {
        this.menuEvent.emit(side);
    }

    /**
     *
     */
    private scrollTop(): void {
        setTimeout(() => {
            this.scrollMe.nativeElement.scrollTop = this.scrollMe.nativeElement.scrollHeight;
        }, 0);
    }
}

@NgModule({
    declarations: [ ChatComponent ],
    imports: [
        MatIconModule,
        CommonModule,
        FormsModule,
        TranslateModule.forChild(),
//        FooterModule
    ],
    exports: [ ChatComponent ]
})
export class ChatModule {}
