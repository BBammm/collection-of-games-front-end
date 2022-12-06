import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { AppRoutingModule } from './app-routing.module';
import { HeaderModule } from './components/header/header.module';
import { FooterComponent } from './components/footer/footer.component';
import { FooterModule } from './components/footer/footer.module';
import { ChatModule } from './components/chat/chat';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { JwtModule } from '@auth0/angular-jwt';
import { EventService } from './services/event.service';
import { HttpService } from './services/http.service';
import { LocalStorageService } from 'ng-storages';
import { SocketMultiService, SocketService } from 'ng-node-socket';
import { Globals } from './services/globals';
import { GameModule } from './pages/game/game.module';
import { RestHttpClientModule } from 'ng-rest-http';
import { HomePageModule } from './pages/home/home.module';
import { MypageModule } from './pages/mypage/mypage.module';
import { TradeSettingModule } from './pages/trade-setting/trade-setting.module';
import { BbsModule } from './pages/bbs/bbs.module';
import { MatomoModule } from './components/matomo/public-api';
// import { MatomoService } from './services/matomo.service';
import { SnackbarComponent } from './components/snackbar/snackbar.component';

export function HttpLoaderFactory(http: HttpClient): any {
    return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
}
export function tokenGetter(): string {
    return localStorage.getItem('authToken');
}

@NgModule({
    declarations: [
        AppComponent,
        FooterComponent,
        SnackbarComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        HttpClientModule,

        // material
        MatIconModule,
        MatSidenavModule,

        MatomoModule,
        // app module
        HeaderModule,
        FooterModule,
        ChatModule,
        HomePageModule,
        MypageModule,
        GameModule,
        BbsModule,
        TradeSettingModule,
        RestHttpClientModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
        JwtModule.forRoot({
            config: {
                tokenGetter
            }
        }),
    ],
    providers: [
        EventService,
        HttpService,
        LocalStorageService,
        SocketMultiService,
        SocketService,
        Globals,
    //    MatomoService,
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
