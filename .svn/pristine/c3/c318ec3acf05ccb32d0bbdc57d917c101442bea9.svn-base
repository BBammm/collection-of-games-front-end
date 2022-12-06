import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WithdrawComponent } from './withdraw/withdraw.component';
import { TradeSettingRoutingModule } from './trade-setting-routing.module';
import { MainComponent } from './main/main.component';
import { DepositComponent } from './deposit/deposit.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PagenatorModule } from '../../components/pagenator/pagenator.module';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    declarations: [
        MainComponent,
        WithdrawComponent,
        DepositComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TradeSettingRoutingModule,
        MatTabsModule,
        MatFormFieldModule,
        MatInputModule,
        MatCheckboxModule,
        PagenatorModule,
        NgxQRCodeModule,
        TranslateModule.forChild(),
    ]
})
export class TradeSettingModule { }
