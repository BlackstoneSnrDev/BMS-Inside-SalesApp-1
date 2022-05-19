import { Component, OnInit  } from '@angular/core';
import { DataService } from '../../services/services.service';

@Component({
    selector: 'historial-component',
    templateUrl: './historial.component.html',
    styleUrls: ['./historial.component.css',
    '../../css/neumorphism.component.css',],
})

export class HistorialComponent implements OnInit {

    public historial: any;
    public isShown: boolean = false;
    public addNote: boolean = false;

    constructor(private DataService: DataService) { }

    ngOnInit() {

        this.DataService.getHistorialData().subscribe(

            response => {

                this.historial = response.historial

                console.log( this.historial)

            },
            error => {
                console.log(error)
            }
        )

      }

      toggleAddNote(){

        this.isShown = ! this.isShown;
        this.addNote = this.isShown;

      }

  }
  