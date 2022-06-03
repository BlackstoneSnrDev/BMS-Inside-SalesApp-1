import { Component, OnInit  } from '@angular/core';
import { DataService } from '../../services/services.service';

@Component({
    selector: 'navbar',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.css'],
})

export class NavbarComponent implements OnInit {

    public navbarlogo: any;
    public navbarname: any;
    public navbartabs: any;

    constructor(private DataService: DataService) { }

    ngOnInit() {

        this.DataService.getNavbarData().subscribe(

            response => {

                this.navbarlogo = "../../../assets/img/" + response.navbar_img_logo
                this.navbarname = response.navbar_company_name
                this.navbartabs = response.navbar_tabs

            },
            error => {
                console.log(error)
            }
        )

      }
  }

  