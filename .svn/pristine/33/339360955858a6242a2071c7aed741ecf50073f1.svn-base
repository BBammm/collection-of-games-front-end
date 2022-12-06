import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthSigninRequiredGuard } from '../../services/guard/auth-signin-required.guard';
import { UserAuthResolverService } from '../../resolver/user-auth-resolver.service';
import { NoticeListComponent } from './notice/list.component';
import { NoticeShowComponent } from './notice/show.component';
import { WriteComponent } from './notice/write/write.component';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'notice',
        pathMatch: 'full'
    },
    {
        path: 'notice',
        component: NoticeListComponent,
        resolve: {
            user: UserAuthResolverService
        },
        canActivate: [
            AuthSigninRequiredGuard
        ]
    },
    {
        path: 'notice/show/:id',
        component: NoticeShowComponent,
        resolve: {
            user: UserAuthResolverService
        },
        canActivate: [
            AuthSigninRequiredGuard
        ]
    },
    {
        path: 'notice/write',
        component: WriteComponent,
        resolve: {
            user: UserAuthResolverService
        },
        canActivate: [
            AuthSigninRequiredGuard
        ]
    },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
    ],
    exports: [RouterModule]
})
export class BbsRoutingModule { }
