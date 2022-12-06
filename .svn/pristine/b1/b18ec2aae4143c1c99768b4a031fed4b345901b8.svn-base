import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MomentPipesModule } from 'ng-moment-pipes';
import { MainComponent } from './main/main.component';
import { DepositComponent } from './deposit/deposit.component';
import { WithdrawComponent } from './withdraw/withdraw.component';
import { HistoryRoutingModule } from './history-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatExpansionModule } from '@angular/material/expansion';
import { TranslateModule } from '@ngx-translate/core';
import { PagenatorModule } from '../../components/pagenator/pagenator.module';
import { TransactionComponent } from './transaction/transaction.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@NgModule({
    declarations: [
        MainComponent,
        DepositComponent,
        WithdrawComponent,
        TransactionComponent,
        // PagenatorComponent
    ],
    imports: [
        CommonModule,
        HistoryRoutingModule,
        PagenatorModule,
        FormsModule,
        ReactiveFormsModule,
        MatTabsModule,
        MatFormFieldModule,
        MatInputModule,
        MatProgressBarModule,
        MatExpansionModule,
        MomentPipesModule,
        TranslateModule.forChild(),
    ]
})
export class HistoryModule { }
