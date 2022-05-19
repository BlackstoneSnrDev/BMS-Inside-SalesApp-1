import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/services.service';

@Component({
    selector: 'form-vertical-component',
    templateUrl: './form-vertical.component.html',
    styleUrls: ['./form-vertical.component.css',
    '../../css/neumorphism.component.css',
],
})

export class FormVerticalComponent implements OnInit {

    public historyLog: any;
    public componentPhone: any;
    public elementid: number = 0;

    constructor(private DataService: DataService) { }

    ngOnInit() {

        this.DataService.getFormData().subscribe(

            response => {

                this.componentPhone = response.componentPhone

                console.log( this.componentPhone)

            },
            error => {
                console.log(error)
            }
        )

        this.DataService.getCallHistoryData().subscribe(

            response => {

                this.historyLog = response.callHistory

                console.log( this.historyLog)

            },
            error => {
                console.log(error)
            }
        )

      }


      getValue(event: Event){

        return (event.target as HTMLInputElement).parentElement?.parentElement?.lastElementChild?.previousElementSibling?.classList.toggle("show");
      }

  }
  