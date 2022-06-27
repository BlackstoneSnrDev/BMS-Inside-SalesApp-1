import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { DataService } from '../../services/services.service';
import { UsersService } from "../../services/auth.service";

@Component({
    selector: 'app-admin',
    templateUrl: './admin.component.html',
    styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

    public dbObjKey: any;
    public userInfo: any;

    constructor(private DataService: DataService, private usersService: UsersService) { 
        this.usersService.userInfo.subscribe(userInfo => this.userInfo = userInfo);
    }

    ngOnInit(): void {
    }

}
