import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { DataService } from '../../services/services.service';
import { ConfirmationService } from 'primeng/api';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatChipInputEvent } from '@angular/material/chips';

@Component({
    selector: 'app-admin-template',
    templateUrl: './admin-template.component.html',
    styleUrls: [
        './admin-template.component.css',
        '../../css/neumorphism.component.css',
        '../../components/table/table.component.css',
    ],
})
export class AdminTemplateComponent implements OnInit {

    public allTemplates: any;

    public thData: any;
    public tdData: any;
    public clonedTdData: any = {};
    public tdFields: any;
    public selectElmType!: string[];

    public tbSelectedRows: any;

    public tglTemplate: boolean = false;
    public tglAddNewTemplate: boolean = false;
    public tglAddNewField: boolean = false;
    public tglEditField: boolean = false;
    public tglAddUsers: boolean = false;

    public addNewTemplateForm!: FormGroup;
    public editFieldForm!: FormGroup;
    public addField!: string[];

    public userList: any;
    public filterUserList: any;
    public addUsers!: string[];

    public onValidationMsg: string = '';
    public onValidationError: string = '';

    constructor(
        private dataService: DataService,
        private confirmationService: ConfirmationService
    ) { }

    ngOnInit() {
        this.dataService.getAllTemplates().subscribe(
            (response) => {
                this.dataService.getMyTableData().subscribe(
                    (response) => {
                        this.thData = response.tableTemplate_th;

                        this.addNewTemplateForm = new FormGroup({
                            templateName: new FormControl('', [
                                Validators.required,
                                Validators.minLength(1),
                            ]),
                            templateFields: new FormControl('', [
                                Validators.required,
                                Validators.minLength(1),
                            ]),
                            templateStatus: new FormControl('', [
                                Validators.required,
                                Validators.minLength(1),
                            ]),
                        });

                        this.editFieldForm = new FormGroup({
                            indexField: new FormControl('', [
                                Validators.required,
                                Validators.minLength(1),
                            ]),
                            nameField: new FormControl('', [
                                Validators.required,
                                Validators.minLength(1),
                            ]),
                            typeField: new FormControl('', [
                                Validators.required,
                                Validators.minLength(1),
                            ]),
                        });
                    },

                    (error) => {
                        console.error(error);
                    }
                );

                this.allTemplates = response;

                let tdData: any = [];
                let slIndex: number = 0;
                let tdFields: any = [];

                for (const [index, value] of this.allTemplates.entries()) {
                    tdData.push({
                        templateName: value.templateName,
                        templateStatus: value.active,
                        templateFields: [],
                        templateActiveFor: [],
                    });

                    this.dataService.getAllUsers().subscribe((data: any) => {
                        this.userList = data;

                        let userActiveTemplate = '';

                        for (const [i, val] of this.userList.entries()) {
                            Array.from(new Set(tdData[index]['templateActiveFor']));

                            userActiveTemplate = val.activeTemplate;

                            if (userActiveTemplate === value.templateName) {
                                if (tdData[index]['templateActiveFor'].length > 0) {
                                    if (!tdData[index]['templateActiveFor'].includes(i))
                                        tdData[index]['templateActiveFor'].push({
                                            userIndex: i,
                                            userName: val.name,
                                        });
                                } else {
                                    tdData[index]['templateActiveFor'].push({
                                        userIndex: i,
                                        userName: val.name,
                                    });
                                }
                            }
                        }
                    });

                    for (const templateData in value) {
                        if (value[templateData]['element_placeholder'] !== undefined) {
                            slIndex += 1;

                            tdData[index]['templateFields'].push({
                                name: value[templateData]['element_placeholder'],
                                type: value[templateData]['element_type'],
                                visible: value[templateData]['showWhileCalling'],
                                slIndex: slIndex - 1,
                            });

                            tdFields.push({
                                element_placeholder: value[templateData]['element_placeholder'],
                                element_value: value[templateData]['element_value'],
                                element: value[templateData]['element'],
                                element_order: value[templateData]['element_order'],
                                element_table_value: value[templateData]['element_table_value'],
                                slIndex: slIndex - 1,
                            });
                        }
                    }
                }
                this.tdData = tdData;
                this.tdFields = tdFields;

                console.log('HERE');
                console.log(this.tdFields);
                console.log(this.tdData);
                console.log(this.allTemplates);
                this.dataService.getSelectData().subscribe(
                    (response) => {
                        this.selectElmType = response.selectInputType;
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

    usersFilter(array: any, searching: any): void {
        this.filterUserList = array.filter((i: any) =>
            i.userName.toLowerCase().includes(searching)
        );
        console.log(this.filterUserList);
    }

    templateSelected(template: string) {
        this.dataService.changeSelectedTemplate(template);
    }

    // Table on row CRUD
    onRowEditInit(tdData: any, id: number) {
        this.clonedTdData[tdData.id] = { ...tdData };
    }

    onRowEditSave(rowTdData: any, indexElm: number, indexTemplate: any) {
        let modifyLastElmActive = (
            document.getElementById('tr' + indexElm) as HTMLInputElement
        ).getElementsByClassName('ng-invalid');

        if (modifyLastElmActive.length > 0) {
            this.onValidationError = '*All fields must be filled out.';
        } else {
            for (const [index, value] of this.tdData.entries()) {
                if (index == indexTemplate) {
                    value.templateFields[indexElm] = value['templateFields'][indexElm] =
                        rowTdData;
                }
            }
            delete this.clonedTdData[rowTdData.id];
            console.log(this.tdData);
        }
    }

    onRowEditCancel(rowTdData: any, index: number) {
        for (const tdData of this.tdData) {
            tdData.templateFields[index] = this.clonedTdData[rowTdData.id];
            delete tdData.templateFields[rowTdData.id];
        }
        console.log(this.tdData);
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
                        value.templateFields = value.templateFields.filter(
                            (i: any) => ![id].includes(i.slIndex)
                        );
                    },
                });
            }
        }
        console.log(this.tdData);
    }

    toggleTemplate() {
        let toggled = document.querySelectorAll(
            ".p-accordion-header-link[aria-expanded='true']"
        ).length;

        if (toggled > 0) {
            this.tglTemplate = true;
        } else {
            this.tglTemplate = false;
        }
    }

    toggleAddNewTemplate() {
        console.log(this.addNewTemplateForm);
        this.tglAddNewField = false;
        this.tglAddNewTemplate = !this.tglAddNewTemplate;
    }

    saveAddNewTemplate() {
        let value = this.addNewTemplateForm.value;

        this.addNewTemplateForm.reset();

        console.log(value);
        console.log(this.allTemplates);

        this.onValidationMsg = 'New template was added successfully.';
        setTimeout(() => {
            this.onValidationMsg = '';
        }, 5000);
    }

    cancelAddNewTemplate() {
        this.tglAddNewTemplate = false;
        this.addNewTemplateForm.reset();
    }

    toggleAddNewField() {
        this.tglAddUsers = false;
        this.tglAddNewField = !this.tglAddNewField;
    }

    saveAddNewField() {
        console.log(this.addField);
        this.tglAddNewField = false;
        this.addField = [];
    }

    cancelAddNewField() {
        this.addField = [];
        this.tglAddNewField = false;
    }

    toggleTemplateStatus(id: any, initValue: any, event: any) {
        event.checked = initValue;
        let label = initValue ? 'deactivate' : 'activate';

        this.confirmationService.confirm({
            message: 'Are you sure you want to <b>' + label + '</b> this template?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.tdData[id]['templateStatus'] = !initValue;
                event.checked = !initValue;
                console.log(this.tdData);
            },
            reject: () => {
                this.tdData[id]['templateStatus'] = initValue;
                event.checked = initValue;
                console.log(this.tdData);
            },
        });
    }

    toggleEditField() {
        this.tglAddNewTemplate = false;
        this.tglEditField = !this.tglEditField;
    }

    saveEditField() {
        console.log(this.editFieldForm.value);
        this.editFieldForm.reset();
    }
    cancelEditField() {
        this.tglEditField = false;
        this.editFieldForm.reset();
    }

    toggleAddUsers() {
        this.tglAddNewField = false;
        this.tglAddUsers = !this.tglAddUsers;
    }

    saveAddUsers(indexTemplate: number) {
        console.log(this.addUsers);
        console.log(indexTemplate);

        this.tglAddUsers = false;
        this.addUsers = [];
    }
    cancelAddUsers() {
        this.tglAddUsers = false;

        this.addUsers = [];
    }
}
