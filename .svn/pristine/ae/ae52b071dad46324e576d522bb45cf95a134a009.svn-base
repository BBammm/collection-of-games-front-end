import { Injectable, NgZone } from '@angular/core';
import { Observable,  Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { GraphLib } from './clib.service';
import { takeUntil } from 'rxjs/operators';
import { isFinite } from 'lodash';

@Injectable()
export class GraphicDisplayService {
    private ngUnsubscribe = new Subject();
    private canvas: any;
    private ctx: any;
    private engine: any;

    // private animRequest = null;
    // private getParentNodeFunc = null;

    private canvasWidth: number;
    private canvasHeight: number;

    private mounted = false;
    // Plotting Settings
    private plotWidth: number;
    private plotHeight: number; // 280
    private xStart: number;
    private xEnd: number;
    private yStart: number;
    private yEnd: number;

    private XAxisPlotMinValue: number;    // 10 Seconds
    private YAxisSizeMultiplier: number;    // YAxis is x times
    // private YAxisInitialPlotValue: number;

    // private gameState: number;
    private cashingOut: number;
    // private lag: number;
    // private startTime: number;
    private currentTime: number;
    private lastBalance: number;

    // private YAxisPlotMinValu: number;
    private YAxisPlotValue: number;
    private YAxisPlotMinValue: number;

    private XAxisPlotValue: number;
    private widthIncrement: number;
    private heightIncrement: number;
    // private currentX: number;

    // private YAxisPlotMaxValue: number;
    private payoutSeparation: number;

    private milisecondsSeparation: number;
    private XAxisValuesSeparation: number;

    private animationFrameId: number;

    public graphConfig = {
        axes: {
            lineWidth: 1,
            strokeStyle: 'white',
            font: '13px Russo One',
            fillStyle: '#fff'
        },
        graph: {
            defaultlineWidth: 4,
            defaultStrokeStyle: 'white',
            playinglineWidth: 6,
            playingStrokeStyle: '#7cba00',
            cashingOutlineWidth: 6,
            cashingOutStrokeStyle: 'grey',
        },
        text: {
            progressFillStyle: '#14dbcf',
            progressBettedFillStyle: '#14dbcf',
            endedFillStyle: '#ff5252',
            startingFont: '20px Russo One',
            startingFillStyle: '#14dbcf',
            xatFont: '20px Russo One'
            }
        };

    // graph 관련
    // doing_ani_moneyburst:boolean = false;//애니메이션을 위한 카운드
    // intervalId_ani_moneyburst;

    private lastBalanceObserv = new Subject<any>();
    public setLastBalance(lastBalance: number): void {
        this.lastBalance = lastBalance;
        this.lastBalanceObserv.next(lastBalance);
    }
    public getLastBalance(): Observable<any> {
        return this.lastBalanceObserv.asObservable();
    }

    constructor(
        private clib: GraphLib,
        protected ngZone: NgZone,
        protected translate: TranslateService) {
    }

    public set_ctx(ctx: any, canvas: any, engine: any): void {
        this.engine = engine;
        this.canvas = canvas;
        this.ctx = ctx;
        this.Graph();
    }

    public startDraw(): void {
        this._draw();
    }

    private _draw(): void {
        if (this.mounted) {
            this.setData();
            this.calculatePlotValues();
            this.clean();
            this.drawGraph();
            this.drawAxes();
            this.drawGameData();
        }
        // this.animRequest =
        this.animationFrameId = window.requestAnimationFrame(this._draw.bind(this));
    }

    public cancelAmim(): void {
        cancelAnimationFrame(this.animationFrameId);
    }

    public game_connected(): void {
        this.mounted = true;
    }

    private Graph(): void {
        this.canvasWidth = this.canvas.width;
        this.canvasHeight = this.canvas.height;

        // Plotting Settings
        this.xStart = 30;
        this.yStart = 20;
        this.xEnd = 0;
        this.yEnd = 0;
        this.plotWidth = this.canvasWidth - (this.xStart + this.xEnd);
        this.plotHeight = this.canvasHeight - (this.yStart + this.yEnd);

        this.XAxisPlotMinValue = 10000; // 10 Seconds
        this.YAxisSizeMultiplier = 2; // YAxis is x times
        // this.YAxisInitialPlotValue = 'zero'; // "zero", "betSize"
    }
/*
    private resize(width: number) {
        this.canvasWidth = width;
        this.plotWidth = this.canvasWidth - (this.xStart + this.xEnd);
    }
*/
    private setData(): void {
        // engine
        this.cashingOut = this.engine.cashingOut;
        this.currentTime = this.clib.getElapsedTimeWithLag(this.engine);
        this.setLastBalance(this.clib.calcGamePayout(this.currentTime));
    }

    private calculatePlotValues(): void {
        // Plot variables
        this.YAxisPlotMinValue = this.YAxisSizeMultiplier;
        this.YAxisPlotValue = this.YAxisPlotMinValue;

        this.XAxisPlotValue = this.XAxisPlotMinValue;

        // Adjust X Plot's Axis
        if (this.currentTime > this.XAxisPlotMinValue) {
            this.XAxisPlotValue = this.currentTime;
        }
        // Adjust Y Plot's Axis
        if (this.lastBalance > this.YAxisPlotMinValue) {
            this.YAxisPlotValue = this.lastBalance;
        }
        // We start counting from cero to plot
        this.YAxisPlotValue -= 1;

        // Graph values
        this.widthIncrement = this.plotWidth / this.XAxisPlotValue;
        this.heightIncrement = this.plotHeight / (this.YAxisPlotValue);
        // this.currentX = this.currentTime * this.widthIncrement;
    }

    private clean(): void {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * 그래프 파트 (실지적인 그래프 출력)
     */
    private drawGraph(): void {
        if (this.engine.gameState === 'IN_PROGRESS') {

            /* Style the line depending on the game states */
            this.ctx.strokeStyle = this.graphConfig.graph.defaultStrokeStyle;

            if (this.engine.currentlyPlaying()) { // playing and not cashed out
                this.ctx.lineWidth = this.graphConfig.graph.playinglineWidth;
                this.ctx.strokeStyle = this.graphConfig.graph.playingStrokeStyle;
            } else if (this.cashingOut) {
                this.ctx.lineWidth = this.graphConfig.graph.cashingOutlineWidth;
                this.ctx.strokeStyle = this.graphConfig.graph.cashingOutStrokeStyle;
            } else {
                this.ctx.lineWidth = this.graphConfig.graph.defaultlineWidth;
            }

            this.ctx.beginPath();
            // this.ctx.moveTo(this.xStart, this.plotHeight - (this.betSizeAdj * this.heightIncrement));
        //    this.clib.seed(1);

            /* Draw the graph */
            let x: number;
            let y: number;
            // let x_p: number;
            // let y_p: number;

            for (let t = 0, i = 0; t <= this.currentTime; t += 100, i++) {
                /* Graph */
                // console.log(this.clib.calcGamePayout(t));
                const payout = this.clib.calcGamePayout(t) - 1; // We start counting from one x
            //    console.log(this.heightIncrement);
                y = (this.plotHeight + this.yEnd) - (payout * this.heightIncrement);
                x = t * this.widthIncrement + (this.xStart);
                // this.ctx.lineCap = 'round';
                // this.ctx.lineJoin = 'round';
                this.ctx.lineTo(x, y); // float x 만큼 값을 보정해 준다.
                // x_p = x_p || x;
                // y_p = y_p || y;
                // const xc = (x_p + x) / 2;
                // const yc = (y_p + y) / 2;
                // this.ctx.quadraticCurveTo(x, y, xc, yc);
                // x_p = x;
                // y_p = y;
                /* Avoid crashing the explorer if the cycle is infinite */
                if (i > 5000) {console.log('For 1 too long!'); break; }
            }
            this.ctx.stroke();
        }
    }

    /**
     * X, Y 축과 관련된 라인 및  폰트
     */
    private drawAxes(): void {
        // Function to calculate the plotting values of the Axes
        function stepValues(x: number): number {
            if (!isFinite(x)) { return; }
            // console.assert(_.isFinite(x));
            let c = .4;
            let r = .1;
            while (true) {

                if (x <  c) { return r; }

                c *= 5;
                r *= 2;

                if (x <  c) { return r; }
                c *= 2;
                r *= 5;
            }
        }

        // Calculate Y Axis
        // this.YAxisPlotMaxValue = this.YAxisPlotMinValue;
        this.payoutSeparation = stepValues(!this.lastBalance ? 1 : this.lastBalance);
        this.ctx.lineWidth = this.graphConfig.axes.lineWidth;
        this.ctx.strokeStyle = this.graphConfig.axes.strokeStyle;
        this.ctx.font = this.graphConfig.axes.font;
        this.ctx.fillStyle = this.graphConfig.axes.fillStyle;
        this.ctx.textAlign = 'right';
        // Draw Y Axis Values
        const heightIncrement =  this.plotHeight / (this.YAxisPlotValue);
        for (let payout = this.payoutSeparation, i = 0; payout < this.YAxisPlotValue; payout += this.payoutSeparation, i++) {
            const y = (this.plotHeight + this.yEnd) - (payout * heightIncrement);
            this.ctx.fillText((payout + 1) + 'x', 25, y);

            this.ctx.beginPath();
            this.ctx.moveTo(this.xStart, y);
            this.ctx.lineTo(this.xStart + 5, y);
            this.ctx.stroke();

            if (i > 100) { console.log('For 3 too long'); break; }
        }

        // Calculate X Axis
        this.milisecondsSeparation = stepValues(this.XAxisPlotValue);

        this.XAxisValuesSeparation = this.plotWidth / (this.XAxisPlotValue / this.milisecondsSeparation);

        // Draw X Axis Values
        for (let miliseconds = 0, counter = 0, i = 0; miliseconds < this.XAxisPlotValue;
                miliseconds += this.milisecondsSeparation, counter++, i++) {

            const seconds = miliseconds / 1000;
            const textWidth = this.ctx.measureText(seconds).width;
            const x = (counter * this.XAxisValuesSeparation) + this.xStart;

            this.ctx.fillText(seconds, x - textWidth / 2, (this.plotHeight + 11 + this.yEnd)); // x축으로 0 2, 4...을 채춘운다다.

            if (i > 100) { console.log('For 4 too long'); break; }
        }

        // Draw background Axis
        this.ctx.beginPath();
        this.ctx.moveTo(this.xStart, 0);
        this.ctx.lineTo(this.xStart, this.canvasHeight - this.yStart);
        this.ctx.lineTo(this.canvasWidth, this.canvasHeight - this.yStart);
        this.ctx.stroke();
    }

    /**
     * this.engine.gameState : STARTING, IN_PROGRESS, ENDED
     * 현재 포인트(텍스트 처리)
     */
    private drawGameData(): void {

        const fillTextX = this.canvasWidth / 2 + 20; // 70;//
        const fillTextY = this.canvasHeight / 2;
        let text: string;
        let fontsize = 80;
        const fontface = 'Russo One';
        this.ctx.textAlign = 'center';

        if (this.engine.gameState === 'IN_PROGRESS') {
            // TODO: Abstract this on engine virtual store?
            const pi = (this.engine.user_id) ? this.engine.playerInfo[this.engine.user_id] : null;

            text = parseFloat(this.lastBalance.toString()).toFixed(2) + 'x';
            do {
                fontsize--;
                this.ctx.font = fontsize + 'px ' + fontface;
            } while (this.ctx.measureText(text).width > (this.canvasWidth - 70));

            if (pi && pi.bet && !pi.stopped_at) {
                this.ctx.fillStyle = this.graphConfig.text.progressBettedFillStyle;
            } else {
                this.ctx.fillStyle = this.graphConfig.text.progressFillStyle;
            }

            this.ctx.fillText(text, fillTextX, fillTextY);

        }

        // If the engine enters in the room @ ENDED it doesn't have the crash value, so we don't display it
        if (this.engine.gameState === 'ENDED') {

            this.ctx.fillStyle = this.graphConfig.text.endedFillStyle;
            text = '@' + this.clib.formatDecimals(this.engine.games[0].game_crash / 100, 2) + 'x';

            do {
                fontsize--;
                this.ctx.font = fontsize + 'px ' + fontface;
            } while (this.ctx.measureText(text).width > (this.canvasWidth - 70));

            this.ctx.fillText(text, fillTextX, fillTextY);
        }

        if (this.engine.gameState === 'STARTING') {
            this.ctx.font = this.graphConfig.text.startingFont;
            this.ctx.fillStyle = this.graphConfig.text.startingFillStyle;

            const timeLeft = ((this.engine.startTime - Date.now()) / 1000).toFixed(1);
            this.engine.setEvents({key: 'timeLeft', data: timeLeft});
            // text = timeLeft + '초 후에 게임시작';
            this.translate.get('games.graph.strRemainGameStart', {second: timeLeft})
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((value) => {
                text = value;
            });

            fontsize = 20;
            do {
                fontsize--;
                this.ctx.font = fontsize + 'px ' + fontface;
            } while (this.ctx.measureText(text).width > (this.canvasWidth - 70));

            if (parseFloat(timeLeft) > 0) {
                this.ctx.fillText(text, fillTextX, fillTextY);
            }
        }
    }
}
