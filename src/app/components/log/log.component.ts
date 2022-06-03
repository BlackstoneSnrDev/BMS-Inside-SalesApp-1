import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/services.service';

@Component({
    selector: 'log-component',
    templateUrl: './log.component.html',
    styleUrls: ['./log.component.css',
        '../../css/neumorphism.component.css',],
})

export class LogComponent implements OnInit {

    public log: any;
    public show: boolean = false;
    public addlog: boolean = false;

    constructor(private DataService: DataService) { }

    ngOnInit() {

        this.DataService.getLogData().subscribe(

            response => {

                this.log = response.log

            },
            error => {

                console.error(error)

            }
        )

    }

    toggleAddLog() {

        this.show = !this.show;
        this.addlog = this.show;

    }

}
