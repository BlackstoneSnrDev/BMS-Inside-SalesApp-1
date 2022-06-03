import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/services.service';

@Component({
    selector: 'form-component',
    templateUrl: './form.component.html',
    styleUrls: ['../../css/neumorphism.component.css'],
})

export class FormComponent implements OnInit {

    public formElement: any;
    public editField: boolean = false;
    public disabledField: string = "input-neumorphism";
    public enableField: string = "input-disabled-neumorphism";

    constructor(private DataService: DataService) { }

    ngOnInit() {

        this.DataService.getFormElementsData().subscribe(

            (response) => {
                this.formElement = response.componentCallInfo;
            },

            (error) => {
                console.error(error);
            }

        );
    }

    editFields(){

        this.editField = !this.editField;

    }
}
