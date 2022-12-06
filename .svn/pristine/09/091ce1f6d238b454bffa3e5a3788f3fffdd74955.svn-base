import { Component, OnInit, HostListener, Output, EventEmitter } from '@angular/core';
import { MessageService } from '../../services/message.service';
import { EventService } from '../../services/event.service';
import * as moment from 'moment';

const loadTime = 1500;
@Component({
    selector: 'app-modal-inbox',
    templateUrl: './modal-inbox.component.html',
    styleUrls: ['./modal-inbox.component.scss'],
})
export class ModalInboxComponent implements OnInit {

    @Output() onClose = new EventEmitter();

    private requestQuery: any;
    private index = 1;
    private take = 10;
    public messageList = [];
    public isPending = false;
    public isLast = false;

    public modalScrollDistance = 1;
    public modalScrollThrottle = 50;

    constructor(
        private messageSvc: MessageService,
        private eventSvc: EventService,
    ) {
    }

    ngOnInit(): void {
        this.getList();
    }

    onModalScrollDown() {
        if(this.isPending || this.isLast) return;

        this.isPending = true;
        setTimeout(() => {
            this.isPending = false;
            this.getList();
        }, loadTime);
    }

    private getList() {
        if(this.isLast) return;
        this.requestQuery = {
            offset: ((this.index || 1) - 1) * 10,
            take: this.take
        };
        this.messageSvc.lists(this.requestQuery).then((res) => {
            this.index++;
            this.messageList = this.messageList.concat(...res.messages);
            this.messageList.forEach((msg) => {
                if(msg.received_at !== null) {
                    msg.is_read = true;
                } else {
                    msg.is_read = false;
                }
            });
            if(res.messages.length !== 10) this.isLast = true;
        }).catch((err) => {
            console.log(err);
        });
    }

    public openPanel(id: number) {
        this.messageSvc.checkRead(id).then((res) => {
            if (res.error) return;
            this.messageList.forEach((msg) => {
                if(msg.id === id) {
                    msg.is_read = true;
                }
            });
        }).catch((error) => {
            console.log(error);
        });
    }

}
