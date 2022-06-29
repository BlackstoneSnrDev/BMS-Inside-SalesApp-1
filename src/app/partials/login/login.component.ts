import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DataService } from '../../services/services.service';
import { UsersService } from "../../services/auth.service";

@Component({

    selector: 'login-component',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css',
        '../../css/neumorphism.component.css',]

})

export class LoginComponent {
    
    public loginLogo: any;
    public loginComapanyName: any;
    public loginForm!: FormGroup;

    public username: string = '';
    public password: string = '';
    public statusMsg: any;

    constructor(private DataService: DataService, public router: Router, public userService: UsersService) { }

    ngOnInit() {

   
        this.DataService.getNavbarData().subscribe(

            response => {

                this.loginLogo = "../../../assets/img/" + response.navbar_img_logo
                this.loginComapanyName = response.navbar_company_name

            },
            error => {
                console.error(error)
            }
        )

        this.loginForm = new FormGroup({
            username: new FormControl('', [Validators.required, Validators.minLength(1)]),
            password: new FormControl('', [Validators.required, Validators.minLength(1)])
        });

      
    }

    login() {
        this.userService.SignIn(this.username, this.password);
      }
}