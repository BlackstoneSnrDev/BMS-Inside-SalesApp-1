import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/services.service';
import { UsersService } from "../../services/auth.service";

@Component({
    selector: 'app-admin-template',
    templateUrl: './admin-template.component.html',
    styleUrls: ['./admin-template.component.css', '../../css/neumorphism.component.css']
})
export class AdminTemplateComponent implements OnInit {

    public dbObjKey: any;
    public userInfo: any;
    public allTemplates: any;

    public elements: any;
    public thElements: any;
    public tbSelectedRows: any;

    constructor(private dataService: DataService, private usersService: UsersService) {
        this.usersService.userInfo.subscribe(userInfo => this.userInfo = userInfo);
        this.dataService.getAllTemplates().subscribe((templates: any) => this.allTemplates = templates);

    }

    ngOnInit() {
        // Just for dev purposes
        this.thElements = [{
            "title": "Name",
            "field": "name",
        }, {
            "title": "Type",
            "field": "type",
        }, {
            "title": "Visible",
            "field": "visible",
        },
        ];

        this.elements = [
            { name: 'Full name', type: 'Text', slIndex: '0', visible: true },
            { name: 'Phone number', type: 'Number', slIndex: '1', visible: true },
            { name: 'Email address', type: 'Email', slIndex: '2', visible: true },
            { name: 'Address', type: 'Address', slIndex: '3', visible: true },
            { name: 'Balance', type: 'Number', slIndex: '4', visible: true },
            { name: 'MRN', type: 'Text', slIndex: '5', visible: true },
            { name: 'DOB', type: 'Date', slIndex: '6', visible: true },
            { name: 'Pending', type: 'False', slIndex: '7', visible: true },
            { name: 'Prior contact', type: 'False', slIndex: '8', visible: true }
        ];
    }

    templateSelected(template: string) {
        this.dataService.changeSelectedTemplate(template)
    }

    log(val: any) { console.log(val); }

}
