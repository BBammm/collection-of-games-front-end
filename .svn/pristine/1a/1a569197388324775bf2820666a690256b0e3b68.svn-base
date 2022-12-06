import {
    Component,
    NgModule,
    Inject,
    ViewChild,
    ViewContainerRef,
    ReflectiveInjector,
    ComponentFactoryResolver,
    AfterViewInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';

import { BaccaratFairnessComponent } from './baccarat/fairness.component';
import { DiceFairnessComponent } from './dice/fairness.component';
import { FiftyFairnessComponent } from './fifty/fairness.component';
import { FourteenFairnessComponent } from './fourteen/fairness.component';
import { GraphFairnessComponent } from './graph/fairness.component';

import { HalfFairnessComponent } from './half/fairness.component';
import { JokerFairnessComponent } from './joker/fairness.component';
import { LadderFairnessComponent } from './ladder/fairness.component';
import { MineFairnessComponent } from './mine/fairness.component';
import { MiningFairnessComponent } from './mining/fairness.component';
import { TranslateModule } from '@ngx-translate/core';
import { KenoFairnessComponent } from './keno/keno.component';
import { SlotFairnessComponent } from './slot/slot.component';


@Component({
    selector: 'app-modal-fairness',
    template: `
        <ng-template #container></ng-template>
    `
})

export class FairnessComponent implements AfterViewInit {
    @ViewChild('container', {read: ViewContainerRef, static: true}) private container: ViewContainerRef;
    private componentData: any;
    constructor(
        private dialogRef: MatDialogRef<FairnessComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { title: string },
        private resolver: ComponentFactoryResolver,
    ) {
    }
    public ngAfterViewInit(): void {
        setTimeout(() => {
              this.create();
          }, 1);
    }
    public create(): void {
        switch (this.data.title) {
            case 'baccarat':
                this.componentData = {
                    component: BaccaratFairnessComponent,
                    inputs: { data: this.data}
                };
                break;
            case 'dice':
                this.componentData = {
                    component: DiceFairnessComponent,
                    inputs: { data: this.data}
                };
                break;
            case 'fifty':
                this.componentData = {
                    component: FiftyFairnessComponent,
                    inputs: { data: this.data}
                };
                break;
            case 'fourteen':
                this.componentData = {
                    component: FourteenFairnessComponent,
                    inputs: { data: this.data}
                };
                break;
            case 'graph':
                this.componentData = {
                    component: GraphFairnessComponent,
                    inputs: { data: this.data}
                };
                break;
            case 'half':
                this.componentData = {
                    component: HalfFairnessComponent,
                    inputs: { data: this.data}
                };
                break;
            case 'joker':
                this.componentData = {
                    component: JokerFairnessComponent,
                    inputs: { data: this.data}
                };
                break;
            case 'ladder':
                this.componentData = {
                    component: LadderFairnessComponent,
                    inputs: { data: this.data}
                };
                break;
            case 'mine':
                this.componentData = {
                    component: MineFairnessComponent,
                    inputs: { data: this.data}
                };
                break;
            case 'mining':
                this.componentData = {
                    component: MiningFairnessComponent,
                    inputs: { data: this.data}
                };
                break;
            case 'keno':
                this.componentData = {
                    component: KenoFairnessComponent,
                    inputs: { data: this.data}
                };
                break;
            case 'slot':
                this.componentData = {
                    component: SlotFairnessComponent,
                    inputs: { data: this.data}
                };
                break;
        }

        if (!this.componentData || !this.componentData.component) {
             return;
        }
        // Inputs need to be in the following format to be resolved properly
        const inputProviders = Object.keys(this.componentData.inputs).map((inputName) => {
            return { provide: inputName, useValue: this.componentData.inputs[inputName] };
        });
        //
        const resolvedInputs = ReflectiveInjector.resolve(inputProviders);

        // We create an injector out of the data we want to pass down and this components injector

        const injector = ReflectiveInjector.fromResolvedProviders(resolvedInputs, this.container.parentInjector);
        // We create a factory out of the component we want to create
        const factory = this.resolver.resolveComponentFactory(this.componentData.component);

        // // We create the component using the factory and the injector
        const component = factory.create(injector) as any; // as any type으로 형을 선언해 주어야 component.instance.popclosed 에서 에러가 발생하지 않음

        this.container.insert(component.hostView, 0);

        // 컴포넌트의 액션을 리스닝 한다.
        component.instance.popclosed.subscribe(() => {
            component.destroy();
            this.dialogRef.close();
        });
    }
}

@NgModule({
    declarations: [
        FairnessComponent,
        BaccaratFairnessComponent,
        DiceFairnessComponent,
        FiftyFairnessComponent,
        FourteenFairnessComponent,
        GraphFairnessComponent,
        HalfFairnessComponent,
        JokerFairnessComponent,
        LadderFairnessComponent,
        MineFairnessComponent,
        MiningFairnessComponent,
        KenoFairnessComponent,
        SlotFairnessComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        TranslateModule.forChild(),
        MatTabsModule,
        MatInputModule,
        MatSelectModule
    ],
    exports: [
        FairnessComponent
    ],
    entryComponents: [
    ]
})
export class FairnessModule { }
