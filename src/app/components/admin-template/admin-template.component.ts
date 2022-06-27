import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { DataService } from '../../services/services.service';
import { UsersService } from "../../services/auth.service";

@Component({
  selector: 'app-admin-template',
  templateUrl: './admin-template.component.html',
  styleUrls: ['./admin-template.component.css']
})
export class AdminTemplateComponent implements OnInit {

    public dbObjKey: any;
    public userInfo: any;
    public allTemplates: any;

    constructor(private dataService: DataService, private usersService: UsersService) { 
        this.usersService.userInfo.subscribe(userInfo => this.userInfo = userInfo);
        this.dataService.getAllTemplates().subscribe((templates: any) => this.allTemplates = templates);
    }

    ngOnInit(): void {
    
    }

    templateSelected(template: string) {
        this.dataService.changeSelectedTemplate(template)
    }

    log(val: any) { console.log(val); }

}
