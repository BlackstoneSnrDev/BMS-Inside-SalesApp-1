import { Component, OnInit  } from "@angular/core";
import { UsersService } from "../../services/auth.service";

@Component({

    selector: 'settings',
    templateUrl: './settings.component.html',
    styleUrls: ['./settings.component.css',
    '../../css/neumorphism.component.css',]

})
export class SettingsComponent implements OnInit {
  
    constructor(private usersService: UsersService) {
        this.usersService.dbObjKey.subscribe(dbObjKey => console.log(dbObjKey));
    }

    ngOnInit() {
       
    }

}
