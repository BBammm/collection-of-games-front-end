import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';

const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home'
    },
    {
        path: 'home',
        component: HomeComponent,
    },
    {
        path: 'game',
        loadChildren: () => import('./pages/game/game.module').then((route) => route.GameModule)
    },
    {
        path: 'mypage',
        loadChildren: () => import('./pages/mypage/mypage.module').then((route) => route.MypageModule)
    },
    {
        path: 'trade',
        loadChildren: () => import('./pages/trade-setting/trade-setting.module').then((route) => route.TradeSettingModule)
    },
    {
        path: 'history',
        loadChildren: () => import('./pages/history/history.module').then((route) => route.HistoryModule)
    },
    {
        path: 'bbs',
        loadChildren: () => import('./pages/bbs/bbs.module').then((route) => route.BbsModule)
    },
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes, {
            onSameUrlNavigation: 'reload',
            scrollPositionRestoration: 'enabled',
            paramsInheritanceStrategy: 'always',
        }),
    ],
    exports: [RouterModule]
})
export class AppRoutingModule { }
