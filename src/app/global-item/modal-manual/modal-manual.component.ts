import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-modal-manual',
    templateUrl: './modal-manual.component.html',
    styleUrls: ['./modal-manual.component.scss']
})
export class ModalManualComponent implements OnInit {

    constructor(
        @Inject(MAT_DIALOG_DATA)
        public data: any
    ) { }

    ngOnInit(): void {
        console.log('data- ', this.data);
    }

}
