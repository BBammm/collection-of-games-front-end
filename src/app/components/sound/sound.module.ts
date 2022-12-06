import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SoundComponent } from './sound.component';
import { Globals } from '../../services/globals';

@NgModule({
    declarations: [SoundComponent],
    imports: [
        CommonModule
    ],
    exports: [
        SoundComponent
    ],
    providers: [
        Globals
    ]
})
export class SoundModule { }
