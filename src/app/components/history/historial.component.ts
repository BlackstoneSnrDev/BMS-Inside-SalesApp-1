import { Component, OnInit  } from '@angular/core';
import { DataService } from '../../services/services.service';

@Component({
    selector: 'historial-component',
    templateUrl: './historial.component.html',
    styleUrls: ['./historial.component.css',
    '../../css/neumorphism.component.css',],
})

export class HistorialComponent implements OnInit {

    public forminput: any;
    public formnotes: any;
    public isShown: boolean = false;
    public addNote: boolean = false;

    constructor(private DataService: DataService) { }

    ngOnInit() {

        this.DataService.getFormData().subscribe(

            response => {

                this.forminput = response.input
                this.formnotes = response.notes

                console.log( this.formnotes)

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
  