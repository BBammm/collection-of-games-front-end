import { Component, OnInit, Input, OnChanges, SimpleChange, ViewEncapsulation } from '@angular/core';
@Component({
  selector: 'app-card',
  template: `
  <ngx-flip [flip]="cardFlip" (click)="onClick()" [ngStyle]="lotateStyle">
     <div front [ngClass]="cardType">
        <div style="padding: 3px;">
            <div class="card-icon">
                <mat-icon svgIcon="{{cardType}}" class="button"></mat-icon>
            </div>
            <div class="number">
                <span>{{cardNumber}}</span>
            </div>
        </div>
     </div>
     <div back></div>
   </ngx-flip>
  `,
  // styleUrls: ['../../assets/default/css/card.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CardComponent implements OnInit, OnChanges {
    public cardType: string;
    public cardNumber: string;
    public lotateStyle: any;
    @Input() public cardFlip = true;
    @Input() public card: any;
    @Input() set lotate(lotate: string) {
        if (lotate) {
        //    this.lotateStyle = {'transform': 'translateY(16%) rotate(-90deg)'};
        }
    }
    constructor() {}

    public ngOnInit(): void {

    }

    public onClick(): void {
        this.cardFlip = !this.cardFlip;
    }

    public ngOnChanges(changes: {[propKey: string]: SimpleChange}): void {
        for (const propName in changes) {
            if (changes.hasOwnProperty(propName)) {
                const changedProp = changes[propName];
                if (propName === 'card') {
                    if (changedProp.currentValue) {
                        this.cardNumber = changedProp.currentValue.substr(1);
                        const cardType = changedProp.currentValue.substr(0, 1);

                        switch (cardType) {
                            case 'D': this.cardType = 'diamond'; break;
                            case 'H': this.cardType = 'heart'; break;
                            case 'C': this.cardType = 'clover'; break;
                            case 'S': this.cardType = 'spade'; break;
                        }
                    }
                }
            }
        }

    }
}
