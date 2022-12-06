import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MypageMainComponent } from './mypage-main/mypage-main.component';
import { AuthSigninRequiredGuard } from '../../services/guard/auth-signin-required.guard';
import { UserAuthResolverService } from '../../resolver/user-auth-resolver.service';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'main',
        pathMatch: 'full'
    },
    {
        path: 'main',
        component: MypageMainComponent,
        resolve: {
            user: UserAuthResolverService
        },
        canActivate: [
            AuthSigninRequiredGuard
        ]
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
    ],
    exports: [RouterModule]
})
export class MypageRoutingModule { }
