import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/services.service';
import { ConfirmationService } from 'primeng/api';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
    selector: 'app-admin-template',
    templateUrl: './admin-template.component.html',
    styleUrls: ['./admin-template.component.css', '../../css/neumorphism.component.css', '../../components/table/table.component.css']
})

export class AdminTemplateComponent implements OnInit {

    public allTemplates: any;

    public thData: any;
    public tdData: any;
    public tdFields: any;
    public selectElmType: any;
    public clonedTdData: any = {};
    public tbSelectedRows: any;

    public tglTemplate: boolean = false
    public tglAddNewTemplate: boolean = false;
    public addNewTemplateForm!: FormGroup;
    public newFormControl: any = {};

    public onValidationMsg: string = "";
    public onValidationError: string = "";

    public addNew: string = ''

    constructor(private dataService: DataService, private confirmationService: ConfirmationService) { }

    ngOnInit() {

        this.dataService.getAllTemplates().subscribe(

            (response) => {

                this.dataService.getMyTableData().subscribe(

                    (response) => {

                        this.thData = response.tableTemplate_th

                        this.addNewTemplateForm = new FormGroup({
                            templateName: new FormControl('', [Validators.required, Validators.minLength(1)]),
                            templateFields: new FormControl('', [Validators.required, Validators.minLength(1)])
                        });

                    },

                    (error) => {
                        console.error(error);
                    }

                );

                this.allTemplates = response

                let tdData: any = [];
                let slIndex: number = 0;
                let tdFields: any = [];

                for (const [index, value] of this.allTemplates.entries()) {

                    tdData.push({ 'templateName': value.templateName, 'templateStatus': value.active, 'templateFields': [] });

                    for (const templateData in value) {
                        if (value[templateData]['element_placeholder'] !== undefined) {
                            slIndex += 1

                            tdData[index]['templateFields'].push({ 'name': value[templateData]['element_placeholder'], 'type': value[templateData]['element_type'], 'visible': value[templateData]['showWhileCalling'], 'slIndex': slIndex - 1 })
                            tdFields.push({ 'name': value[templateData]['element_placeholder'] })
                        }
                    }

                }
                this.tdData = tdData
                this.tdFields = tdFields

                console.log(this.tdFields)
                this.dataService.getSelectData().subscribe(

                    (response) => {

                        this.selectElmType = response.selectInputType


                    },

                    (error) => {
                        console.error(error);
                    }

                );
            },

            (error) => {
                console.error(error);
            }

        );
    }


    templateSelected(template: string) {
        this.dataService.changeSelectedTemplate(template)
    }

    // Table on row CRUD
    onRowEditInit(tdData: any, id: number) {
        this.clonedTdData[tdData.id] = { ...tdData };
    }

    onRowEditSave(rowTdData: any, indexElm: number, indexTemplate: any) {

        let modifyLastElmActive = (document.getElementById('tr' + indexElm) as HTMLInputElement).getElementsByClassName('ng-invalid')

        if (modifyLastElmActive.length > 0) {

            this.onValidationError = '*All fields must be filled out.'

        } else {

            for (const [index, value] of this.tdData.entries()) {
                if (index == indexTemplate) {

                    value.templateFields[indexElm] = value['templateFields'][indexElm] = rowTdData

                }
            }
            delete this.clonedTdData[rowTdData.id];
            console.log(this.tdData)

        }
    }

    onRowEditCancel(rowTdData: any, index: number) {

        for (const tdData of this.tdData) {

            tdData.templateFields[index] = this.clonedTdData[rowTdData.id];
            delete tdData.templateFields[rowTdData.id];

        }
        console.log(this.tdData)

    }

    onRowDeleteRow(id: any, indexTemplate: any) {

        for (const [index, value] of this.tdData.entries()) {

            if (index == indexTemplate) {

                // NEEDS TO BE FIXED
                this.confirmationService.confirm({
                    message: 'Are you sure you want to delete this field?',
                    header: 'Confirm',
                    icon: 'pi pi-exclamation-triangle',
                    accept: () => {
                        value.templateFields = value.templateFields.filter((i: any) => ![id].includes(i.slIndex))
                    }
                });


            }

        }
        console.log(this.tdData)
    }

    toggleTemplate() {

        let toggled = document.querySelectorAll(".p-accordion-header-link[aria-expanded='true']").length

        if (toggled > 0) {
            this.tglTemplate = true
        } else {
            this.tglTemplate = false
        }

    }

    toggleAddNewTemplate() {
        console.log(this.addNewTemplateForm);
        this.tglAddNewTemplate = !this.tglAddNewTemplate
    }

    saveAddNewTemplate() {

        let value = this.addNewTemplateForm.value;

        this.addNewTemplateForm.reset();

        this.onValidationMsg = 'New template was added successfully.'
        setTimeout(() => {
            this.onValidationMsg = "";
        }, 5000);

    }

    cancelAddNewTemplate() {

        this.tglAddNewTemplate = false
        this.addNewTemplateForm.reset();

    }


}
