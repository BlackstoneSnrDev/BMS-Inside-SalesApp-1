import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { DataService } from '../../services/services.service';

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
    public autoResize: boolean = true;

    public tglEditLayout: boolean = false;
    public callDataForm!: FormGroup
    public newFormControl: any = {};
    public newField: any ;
    public creating: boolean = false;
public checked: boolean = false;

    constructor(private DataService: DataService, FormBuilder: FormBuilder) { }

    ngOnInit() {

        this.DataService.getFormElementsData().subscribe(

            (response) => {

                this.formElement = response.componentCallInfo;

                for (let i of this.formElement) {
                    this.newFormControl[i.element_placeholder] = new FormControl({ value: i.element_value, disabled: this.editField }, [Validators.required, Validators.minLength(1)]);
                }
                this.callDataForm = new FormGroup(this.newFormControl);
            },

            (error) => {
                console.error(error);
            }

        );
    }

    editFields(){

        this.editField = !this.editField;

    }

    cancelEditFields(){

        
        for (let i of this.formElement) {
            this.newFormControl[i.element_placeholder] = new FormControl({ value: i.element_value, disabled: true }, [Validators.required, Validators.minLength(1)]);
        }
        this.callDataForm = new FormGroup(this.newFormControl);
        this.editField = false;
        
    }
    toggleEditLayout(){

        this.tglEditLayout = !this.tglEditLayout;

    }

    
    editLayout(elementId: number){
        console.log(elementId)
        console.log(this.formElement)
        this.formElement.splice(elementId, 1)

    }

    createNewField(){

        this.creating = true
        this.callDataForm =  new FormGroup({
            newField: new FormControl('', [Validators.required, Validators.minLength(1)]),
          })
    }

    cancelCreateNewField(){

        // Remove element by ELEMENT ID, using $event
    }
}
