import { Component, OnInit  } from '@angular/core';
import { DataService } from '../../services/services.service';
import { Observable } from 'rxjs';
import { UsersService } from "../../services/auth.service";
@Component({
    selector: 'navbar-component',
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.css'],
})

export class NavbarComponent implements OnInit {

    public navbarlogo: any;
    public navbarname: any;
    public navbartabs: any;
    isLoggedIn$!: Observable<boolean>;

    constructor(private DataService: DataService, private usersService: UsersService) { }

    ngOnInit() {

    this.isLoggedIn$ = this.usersService.isLoggedIn;
  
        this.DataService.getNavbarData().subscribe(

            response => {

                this.navbarlogo = "../../../assets/img/" + response.navbar_img_logo
                this.navbarname = response.navbar_company_name
                this.navbartabs = response.navbar_tabs

            },
            error => {
                console.error(error)
            }
        )

      }

      onLogout() {
        this.usersService.logout();
      }
  }

  