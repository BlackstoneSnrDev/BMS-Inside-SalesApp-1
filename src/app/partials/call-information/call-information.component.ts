import { Component, OnInit  } from '@angular/core';
import { DataService } from '../../services/services.service';

@Component({

    selector: 'call-information',
    templateUrl: './call-information.component.html',
    styleUrls: ['./call-information.component.css']

})

export class CallInfoComponent implements OnInit {

    public forminput: any;

    constructor(private DataService: DataService) { }

    ngOnInit() {

        this.DataService.getFormData().subscribe(

            response => {
                this.forminput = response.input

                console.log( this.forminput)

            },
            error => {
                console.log(error)
            }
        )

      }

  }