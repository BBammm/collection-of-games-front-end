import { Injectable } from '@angular/core';
import { MatomoTracker } from '../components/matomo/public-api';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'any'
})
export class MatomoService {

    constructor(
        private matomoTracker: MatomoTracker,
        private authService: AuthService
    ) {
    }

    public tracker(title: string): void {
        const user = this.authService.user;
        const url = window.location.href;

        this.matomoTracker.setUserId(user.email);
        this.matomoTracker.setCustomUrl(url);
        this.matomoTracker.trackPageView(title);
    }

}
