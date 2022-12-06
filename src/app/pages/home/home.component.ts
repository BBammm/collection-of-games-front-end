import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
// import { fadeAnimation } from '../../animations/route-animation';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
    constructor(
        private titleSvc: Title
    ) {
        this.titleSvc.setTitle('HOME');
    }

  public ngOnInit(): void {
  }
}
