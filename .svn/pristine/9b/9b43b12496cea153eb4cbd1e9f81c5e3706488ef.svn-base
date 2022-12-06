export class GraphLib {
    // private rng: number;

    public formatSatoshis(n: number, decimals?: number): string {
        return this.formatDecimals(n / 100, decimals);
    }

    public formatDecimals(n: number, decimals?: number): string {
        if (typeof decimals === 'undefined') {
            if (n % 100 === 0) {
                decimals = 0;
            } else {
                decimals = 2;
            }
        }
        return n.toFixed(decimals).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    }

    public payout(betSize: number, ms: number): number {
        return betSize * Math.pow(Math.E, (0.00006 * ms));
    }

    public payoutTime(betSize: number, payout: number): number {
        return Math.log(payout / betSize) / 0.00006;
    }

    public UserSeedRandom(seed: number): number {

        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    }

    // public seed(newSeed: number): void {
    // //    this.rng = Seedrandom(newSeed);
    //     this.rng = this.UserSeedRandom(newSeed);
    // }

    public removeComma(num: string): number {
        if (num === '?') {
            return 0;
        }
        num = num.replace(/\,/g, ''); // 1125, but a string, so convert it to number

        return parseInt(num, 10);
    }

    public profit(amount: number, cashOut: number): number {

        // The factor that we need to get the cash out with our wager.
        const factor = Math.ceil(100 * cashOut / amount);

        // We calculate the profit with the factor instead of using the
        // difference between cash out and wager amount.
        return amount * (factor - 100) / 100;
    }

    public isInteger(nVal: number): boolean {
        return typeof nVal === 'number' && isFinite(nVal) && nVal > -9007199254740992
                                        && nVal < 9007199254740992 && Math.floor(nVal) === nVal;
    }

    // Calculate the payout based on the time
    // 시간별 배당금 계산
    private growthFunc(ms: number): number {
        const r = 0.00006;
        // const r = 0.00007;
        return Math.floor(100 * Math.pow(Math.E, r * ms)) / 100;
    }

    // A better name
    public calcGamePayout(ms: number): number {
        const gamePayout = this.growthFunc(ms);
        return gamePayout;
    }

    // Returns the current payout and stops when lag, use this time to calc game payout with lag
    public getElapsedTimeWithLag(engine: any): number {
        if (engine.gameState === 'IN_PROGRESS') {
            let elapsed: number;

            if (engine.lag) {
                // + STOP_PREDICTING_LAPSE because it looks better
                elapsed = engine.lastGameTick - engine.startTime + engine.STOP_PREDICTING_LAPSE;
            } else {
                elapsed = this.getElapsedTime(engine.startTime);
            }
            return elapsed;
        } else {
            return 0;
        }
    }

    // Just calculates the elapsed time
    public getElapsedTime(startTime: number): number {
        return Date.now() - startTime;
    }

    public is_integer(x: any): boolean {
        const reg = /^[-|+]?\d+$/;
        return reg.test(x);
    }

    public calcProfit(bet: number, stoppedAt: number): number {
        return ((stoppedAt - 100) * bet) / 100;
    }
}
