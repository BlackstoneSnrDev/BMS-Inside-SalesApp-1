import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/services.service';
import { Observable } from 'rxjs';
import { UsersService } from '../../services/auth.service';
import { ThemeService } from '../../components/theme/theme.service';

@Component({
  selector: 'navbar-component',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css', '../../css/neumorphism.component.css'],
})
export class NavbarComponent implements OnInit {
  public navbarlogo: any;
  public navbarname: any;
  public navbartabs: any;
  isLoggedIn$!: Observable<boolean>;
  public dbObjKey: any;
  public userInfo: any;
  public theme: any = localStorage.getItem('theme');

  constructor(
    private DataService: DataService,
    private usersService: UsersService,
    private themeService: ThemeService
  ) {}

  ngOnInit() {
    this.isLoggedIn$ = this.usersService.isLoggedIn;

    if (!this.theme) {
      localStorage.setItem('theme', 'light');
    }

    if (this.theme === 'light') {
      this.themeService.setLightTheme();
    } else if (this.theme === 'dark') {
      this.themeService.setDarkTheme();
    }

    this.usersService.userInfo.subscribe(
      (userInfo) => (this.userInfo = userInfo)
    );

    this.DataService.getNavbarData().subscribe(
      (response) => {
        this.navbarlogo = '../../../assets/img/' + response.navbar_img_logo;
        this.navbarname = response.navbar_company_name;
        this.navbartabs = response.navbar_tabs;
      },
      (error) => {
        console.error(error);
      }
    );
  }

  onLogout() {
    this.usersService.SignOut();
  }

  onActivate(event: Event) {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }

  log(val: any) {
    console.log(val);
  }

  switchTheme() {
    if (this.theme) {
      if (this.theme === 'dark') {
        localStorage.setItem('theme', 'light');
        this.themeService.setLightTheme();
        this.theme = 'light';
      } else if (this.theme === 'light') {
        localStorage.setItem('theme', 'dark');
        this.themeService.setDarkTheme();
        this.theme = 'dark';
      }
    }
  }
}
