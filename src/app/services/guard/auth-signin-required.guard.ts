import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router'; // ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree,
// import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';

@Injectable({
    providedIn: 'root'
})
export class AuthSigninRequiredGuard implements CanActivate {

    private isLogin = false;

    constructor(
        private router: Router,
        private authService: AuthService,
    ) { }

    public canActivate(): Promise<boolean> { // next: ActivatedRouteSnapshot, state: RouterStateSnapshot
        return this.checkSignin();
    }

    public async checkSignin(): Promise<boolean> {
        return this.authService.isLoggedIn().then((res) => {
            this.isLogin = res.result;

            if (this.isLogin) {
                return true;
            } else {
                this.router.navigate(['/']);
                return false;
            }
        });
    }

}
