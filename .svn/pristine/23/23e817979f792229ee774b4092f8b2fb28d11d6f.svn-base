import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { CommonServiceModule } from 'ng-functions';
import { TranslateModule } from '@ngx-translate/core';
import { FlipModule } from 'ngx-flip';
import { NgEasingService } from 'ng-easing';

import { CountUpModule } from 'ng-count-up-js';

import { DiceComponent } from './dice/dice.component';
import { DiceGamePlayerObjectComponent } from './dice/dice.object.component';
import { GlobalItemModule } from '../../global-item/global-item.module';
import { GlobalGameLogModule } from '../../global-item/games-log/global-game-log.module';

import { GameRoutingModule } from './game-routing.module';
import { BaccaratComponent } from './baccarat/baccarat.component';
import { CardComponent } from './baccarat/card/card.component';
import { BaccratLib } from './baccarat/baccarat.lib';
import { RoundProgressModule } from 'angular-svg-round-progressbar';

import { FiftyComponent } from './fifty/fifty.component';
import { FourteenComponent } from './fourteen/fourteen.component';
import { GraphComponent } from './graph/graph.component';
import { GraphLib } from './graph/clib.service';
import { GraphicDisplayService } from './graph/graphicDisplay';
// import { GraphEventService } from './graph/graph-event.service';
import { HalfComponent } from './half/half.component';
import { JokerComponent } from './joker/joker.component';
import { LadderComponent } from './ladder/ladder.component';
import { MineComponent } from './mine/mine.component';
import { MineCardComponent } from '../../components/mine-card/mine-card.component';
import { MiningComponent } from './mining/mining.component';

import { SoundModule } from '../../components/sound/sound.module';

import { ShortNumberPipe } from '../../pipes/short-number.pipe';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MomentPipesModule } from 'ng-moment-pipes';
import { FairnessModule } from '../../global-item/fairness/fairness.module';
import { KenoComponent } from './keno/keno.component';
import { SlotComponent } from './slot/slot.component';

@NgModule({
    declarations: [
        CardComponent,
        MineCardComponent,
        DiceComponent,
        DiceGamePlayerObjectComponent,
        BaccaratComponent,
        FiftyComponent,
        FourteenComponent,
        GraphComponent,
        HalfComponent,
        KenoComponent,
        JokerComponent,
        LadderComponent,
        MineComponent,
        MiningComponent,
        ShortNumberPipe,
        SlotComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule.forChild(),
        MatIconModule,
        CommonServiceModule,
        CountUpModule,
        GlobalItemModule,
        GlobalGameLogModule,
        GameRoutingModule,
        RoundProgressModule,
        FlipModule,
        MatTabsModule,
        MatFormFieldModule,
        MatProgressBarModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
        MomentPipesModule,
        FairnessModule,
        MatExpansionModule,
        MatSlideToggleModule,
        SoundModule
    ],
    providers: [
        BaccratLib,
        NgEasingService,
//        GraphEventService,
        GraphLib,
        GraphicDisplayService
    ]
})
export class GameModule { }
