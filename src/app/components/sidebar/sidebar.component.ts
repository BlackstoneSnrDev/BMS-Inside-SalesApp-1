import { Component, OnInit  } from '@angular/core';
import { DataService } from '../../services/services.service';

@Component({
    selector: 'sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.css'],
})

export class SidebarComponent implements OnInit {

    public sidebartabs: any;
    public sidebarlogo: any;

    constructor(private DataService: DataService) { }

    ngOnInit() {

        this.DataService.getSidebarData().subscribe(

            response => {

                this.sidebarlogo = response.sidebar_logo
                this.sidebartabs = response.sidebar
            },
            error => {
                console.log(error)
            }
        )

      }
  }

  