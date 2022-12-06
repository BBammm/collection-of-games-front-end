import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
    providedIn: 'root'
})
export class UserAuthResolverService implements Resolve<any> {

    constructor(
        private authService: AuthService,
        private router: Router,
    ) { }

    /**
     * 라우트 Resolver 적용
     */
    public resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.authService.getUserDetail();
    }
}
