import { Component, OnInit, Input, Renderer2 } from '@angular/core';

@Component({
    selector: 'app-mine-card',
    templateUrl: './mine-card.component.html',
    styleUrls: ['./mine-card.component.scss']
})
export class MineCardComponent implements OnInit {

    @Input() public cGameInfo;
    constructor(private render: Renderer2) {
    }

    public ngOnInit(): void {
    }

    public mouseEnter(e: any): void {
        const target = e.target;
        this.render.removeClass(target, 'faded');
    }

    public mouseLeave(e: any): void {
        const target = e.target;
        this.render.addClass(target, 'faded');
    }
}
