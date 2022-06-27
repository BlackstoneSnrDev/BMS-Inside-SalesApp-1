import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/services.service';
import { UsersService } from '../../services/auth.service';

@Component({
    selector: 'form-component',
    templateUrl: './form.component.html',
    styleUrls: ['./form.component.css','../../css/neumorphism.component.css'],
})

export class FormComponent implements OnInit {

    public formElement: any;
    public editField: boolean = false;
    public disabledField: string = "input-neumorphism";
    public enableField: string = "input-disabled-neumorphism";
    public activeTemplate: any;
    public dbObjKey: any;

    constructor(private dataService: DataService, private usersService: UsersService) { }

    ngOnInit() {

// Subscribe to dbObjKey to ensure we have a logged in user and a tenant ID.  When we have the dbObjKey send it to getActiveTemplate service.
// This sequence is needed so that the db is not called without a tenant ID.  To do otherwise resulted is errors when the user refreshes the page.  
        this.usersService.dbObjKey.subscribe(
            dbObjKey => [
                this.dbObjKey = dbObjKey, 
                this.dataService.getActiveTemplate(this.dbObjKey)
                .then( activeTemplate => this.activeTemplate = activeTemplate.sort((a,b) => a.element_order - b.element_order))
                .then(() => {
                    this.formElement = this.activeTemplate;
                })
            ]) 
        
    }

    editFields(){

        this.editField = !this.editField;

    }

    log(val: any) { console.log(val); }
}
