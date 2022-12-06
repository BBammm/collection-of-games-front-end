import { Component, Input, OnInit, Output, EventEmitter, OnChanges, SimpleChange } from '@angular/core'; // , NgModule
// import { CommonModule } from '@angular/common';
import { Globals } from '../../services/globals';

@Component({
    selector: 'app-sound',
    templateUrl: './sound.component.html',
    styleUrls: ['./sound.component.scss']
})
export class SoundComponent { // implements OnInit, OnChanges

    @Output() private soundFlag: EventEmitter<boolean> = new EventEmitter<boolean>();
    public isSoundOn: boolean;

    constructor(
        public global: Globals
    ) {
        this.isSoundOn = global.gameSound;
    }
    // public ngOnInit(): void {
    // }

    /**
     * 사운드 온/오프
     */
    public setSoundFlag(flag: boolean) {
        this.global.gameSound = flag;
        this.isSoundOn = flag;
        this.soundFlag.emit(this.global.gameSound);
    }

}
