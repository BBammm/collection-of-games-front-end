import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NoticeListComponent } from './notice/list.component';
import { BbsRoutingModule } from './bbs-routing.module';
import { MomentPipesModule } from 'ng-moment-pipes';
import { PagenatorModule } from '../../components/pagenator/pagenator.module';
import { NoticeShowComponent } from './notice/show.component';
import { WriteComponent } from './notice/write/write.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [
      NoticeListComponent,
      NoticeShowComponent,
      WriteComponent
    ],
  imports: [
    CommonModule,
    TranslateModule.forChild(),
    BbsRoutingModule,
    MomentPipesModule,
    PagenatorModule
  ]
})
export class BbsModule { }
