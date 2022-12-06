import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WithdrawComponent } from './withdraw/withdraw.component';
import { MainComponent } from './main/main.component';
import { DepositComponent } from './deposit/deposit.component';
import { TransactionComponent } from './transaction/transaction.component';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'main/transac',
        pathMatch: 'full'
    },
    {
        path: 'main',
        component: MainComponent,
        children: [
            {
                path: 'transac',
                component: TransactionComponent
            },
            {
                path: 'deposit',
                component: DepositComponent
            },
            {
                path: 'withdraw',
                component: WithdrawComponent
            },
        ]
    },
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
    ],
    exports: [RouterModule]
})
export class HistoryRoutingModule { }
