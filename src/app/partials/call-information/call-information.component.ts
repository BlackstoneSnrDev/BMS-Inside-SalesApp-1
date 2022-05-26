import { Component, OnInit  } from '@angular/core';
import { DataService } from '../../services/services.service';

@Component({

    selector: 'call-information',
    templateUrl: './call-information.component.html',
    styleUrls: ['./call-information.component.css',
    '../../css/neumorphism.component.css',]

})

export class CallInfoComponent implements OnInit {

    public forminput: any;
    public formnotes: any;

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

  }