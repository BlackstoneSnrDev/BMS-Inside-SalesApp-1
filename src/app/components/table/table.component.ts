import { Component, ViewChild, Output, EventEmitter } from '@angular/core';
// Get table data
import { DataService } from '../../services/services.service';
// PrimeNG
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { PrimeNGConfig } from "primeng/api";
import { Table } from 'primeng/table';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';

@Component({

    selector: 'table-component',
    templateUrl: './table.component.html',
    styleUrls: ['./table.component.css',
        '../../css/neumorphism.component.css'],
    providers: [MessageService]

})

export class TableComponent {


    public thData: any;
    public thDataLength: number = 0
    public clonedthData: any = {};

    public tdData: any;
    public clonedtdData: any = {};

    public tbSelectedRows: any = [];

    public tbGroups: any;
    public tbGroupsLength: number = 0;
    public clearInput: any

    public tglCreateNewGroup: boolean = false;
    public tglMenuTable: boolean = false;
    public tglEditGroup: boolean = false;
    public tglAddNewRecord: boolean = false;
    public tglGroupMenu: boolean = false;

    public addNewRecordForm!: FormGroup;
    public newFormControl: any = {};
    public onValidationError: string = "";
    public onValidationMsg: string = "";

    constructor(private DataService: DataService, private messageService: MessageService, private confirmationService: ConfirmationService, private primengConfig: PrimeNGConfig, fb: FormBuilder) { }

    ngOnInit() {

        this.primengConfig.ripple = true;

        this.DataService.getTableData().subscribe(
            response => {

                this.thData = response.table_th
                this.tdData = response.table_td
                this.tbGroups = response.table_group
                this.tbGroupsLength = response.table_group.length

                this.thDataLength = this.thData.length

                for (let i of this.thData) {
                    this.newFormControl[i.field] = new FormControl('', [Validators.required, Validators.minLength(1)]);
                }
                this.addNewRecordForm = new FormGroup(this.newFormControl);

                let slIndex = 0
                for (let i = 0; i < this.tdData.length; i++) {
                    slIndex = i
                    this.tdData[slIndex]["slIndex"] = i;
                }

            },
            error => {
                console.error(error)
            }
        )
    }

    @ViewChild('dataTable') table!: Table;

    clear(table: Table) {

        table.clear();
        this.tdData = this.tdData

        this.onValidationMsg = "Table was restored.";
        setTimeout(() => {
            this.onValidationMsg = "";
        }, 2000);
    }

    // Table on row CRUD
    onRowEditInit(tdData: any) {
        this.clonedtdData[tdData.id] = { ...tdData };
    }

    onRowEditSave(tdData: any, id: number) {
        delete this.clonedtdData[tdData.id];
        console.log(this.tdData[id])
    }

    onRowEditCancel(tdData: any, index: number) {
        this.tdData[index] = this.clonedtdData[tdData.id];
        delete this.tdData[tdData.id];
    }

    onRowDeleteRow(id: any) {

        this.confirmationService.confirm({
            message: 'Are you sure you want to delete this selection?',
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.tdData = this.tdData.filter((i: any) => ![id].includes(i.slIndex));
                this.tbSelectedRows = [];

                this.onValidationMsg = 'Record was deleted successfully.'
                setTimeout(() => {
                    this.onValidationMsg = "";
                }, 2000);
            }
        });

    }

    toggleTableMenu() {
        if (this.tbSelectedRows.length > 0) {
            this.tglMenuTable = true

        } else {
            this.tglMenuTable = false

        }
        console.log(this.tbSelectedRows)
    }

    toggleAddNewRecord() {

        this.tglAddNewRecord = !this.tglAddNewRecord
    }

    saveAddNewRecord(table: Table) {

        let value = this.addNewRecordForm.value;
        value['group'] = []
        this.tdData.push(value);

        table._totalRecords = this.tdData.length
        this.addNewRecordForm.reset();

        this.onValidationMsg = 'New record was added successfully.'
        setTimeout(() => {
            this.onValidationMsg = "";
        }, 5000);

        console.log(this.tdData)

    }


    cancelAddNewRecord() {

        this.tglAddNewRecord = false
        this.addNewRecordForm.reset();

    }

    // Delete selection
    deleteSelection() {

        if (this.tbSelectedRows.length > 0) {
            this.confirmationService.confirm({
                message: 'Are you sure you want to delete <b>' + this.tbSelectedRows.length + '</b> records?',
                header: 'Deleting (' + this.tbSelectedRows.length + ' records)',
                accept: () => {
                    this.tglMenuTable = false
                    this.tdData = this.tdData.filter((val: any) => !this.tbSelectedRows.includes(val));
                    this.tbSelectedRows = [];

                    this.onValidationMsg = this.tbSelectedRows.length + ' records were deleted successfully.'
                    setTimeout(() => {
                        this.onValidationMsg = "";
                    }, 2000);

                    console.log(this.tdData)

                }
            });
        } else {

            this.onValidationMsg = 'There are ' + this.tbSelectedRows.length + ' records selected.'
            setTimeout(() => {
                this.onValidationMsg = "";
            }, 2000);

            console.log(this.tdData)

        }

    }

    // Groups CRUD
    toggleGroupSection() {
        this.tglGroupMenu = !this.tglGroupMenu

    }
    // Create new group
    toggleCreateNewGroup() {
        this.tglCreateNewGroup = true
    }

    saveCreateNewGroup(groupName: string) {

        if (!groupName) {
            this.onValidationError = "*Group name must be specified."
            setTimeout(() => {
                this.onValidationError = "";
            }, 2000);

            console.log(this.tbGroups)

        } else {
            let newIndex = this.tbGroups.length + 1
            this.tbGroups.push({ "group_id": "g" + newIndex, "group_name": groupName });

            this.groupSelection("g" + newIndex)
            this.onValidationMsg = 'New group was created as "' + groupName + '" successfully.'
            setTimeout(() => {
                this.onValidationMsg = "";
            }, 2000);

            this.tglCreateNewGroup = false
            this.clearInput = ""
            this.onValidationError = ""

            console.log(this.tbGroups)
        }

    }

    cancelCreateNewGroup() {

        this.tglCreateNewGroup = false
        this.clearInput = ""
        this.onValidationError = ""
    }

    // Edit group created
    toggleEditGroup(event: Event) {

        (event.target as HTMLInputElement).classList.toggle("hide");
        (event.target as HTMLInputElement).nextElementSibling?.classList.toggle("hide");

    }

    saveRenameGroup(groupId: number, groupName: string, event: Event) {

        if (!groupName) {

            this.onValidationError = "*Group name must be specified."
            setTimeout(() => {
                this.onValidationError = "";
            }, 2000);

            console.log(this.tbGroups)

        } else {

            let group = this.tbGroups.findIndex((i: any) => i.group_id === groupId)
            let nameg = this.tbGroups[group]["group_name"]

            this.confirmationService.confirm({
                message: 'Are you sure you want to rename <b>' + nameg + '</b> to "<b>' + groupName + '</b>"?',
                header: 'Renaming group',
                accept: () => {

                    this.tbGroups[group]["group_name"] = groupName

                    this.onValidationMsg = '"' + nameg + '" was rename as "' + groupName + '" successfully.'
                    setTimeout(() => {
                        this.onValidationMsg = "";
                    }, 2000);

                    let tglEdit = (event.target as HTMLInputElement).parentElement?.previousElementSibling?.classList.toggle("hide");
                    let tglEdit2 = (event.target as HTMLInputElement).parentElement?.classList.toggle("hide");

                    console.log(this.tbGroups)

                }
            });


            this.clearInput = ""
            this.onValidationError = ""
        }

    }

    cancelRenameGroup(event: Event) {

        let tglEdit = (event.target as HTMLInputElement).parentElement?.previousElementSibling?.classList.toggle("hide");
        let tglEdit2 = (event.target as HTMLInputElement).parentElement?.classList.toggle("hide");
        this.clearInput = ""
        this.onValidationError = ""
    }

    deleteGroup(groupId: number, groupName: string) {

        this.confirmationService.confirm({
            message: 'Are you sure you want to delete "<b>' + groupName + '</b>"?',
            header: 'Deleting group',
            accept: () => {

                let groupIndex = this.tbGroups.findIndex((i: any) => i.group_id === groupId)
                this.tbGroups = this.tbGroups.filter((i: any) => i.group_id.includes(groupIndex))
                this.onValidationMsg = '"' + groupName + '" was deleted successfully.'

                this.tdData = this.tdData

                setTimeout(() => {
                    this.onValidationMsg = "";
                }, 2000);

                console.log(this.tbGroups)

            }
        });

        this.onValidationError = ""
        this.clearInput = ""

    }

    // Add selection to group
    groupSelection(groupId: any) {

        this.confirmationService.confirm({
            message: 'Are you sure you want to group <b>' + this.tbSelectedRows.length + '</b> records?',
            header: 'Grouping records',
            accept: () => {

                let groupIndex = this.tbGroups.findIndex((i: any) => i.group_id === groupId)
                let groupName = this.tbGroups[groupIndex]["group_name"]
                let doubledMsg = ""

                for (let i = 0; i < this.tbSelectedRows.length; i++) {
                    let oldGroupLenght = this.tbSelectedRows[i]["group"].length

                    let doubleGroup = this.tbSelectedRows[i].group

                    if (doubleGroup.includes(groupId)) {

                        doubledMsg = 'Records selected are already grouped to "' + groupName + '".'

                    } else {

                        doubledMsg = '"' + this.tbSelectedRows.length + '" records were added to "' + groupName + '" successfully.'

                        if (oldGroupLenght == 0) {
                            this.tbSelectedRows[i]["group"][0] = groupId
                        } else {
                            this.tbSelectedRows[i]["group"][oldGroupLenght] = groupId
                        }
                    }

                    this.tdData[i] = this.tbSelectedRows[i]
                    console.log(this.tdData[i])

                }

                this.onValidationMsg = doubledMsg
                setTimeout(() => {
                    this.onValidationMsg = "";
                }, 2000);

                console.log(this.tdData)

            }
        });

        console.log(this.tdData)
        this.clearInput = ""
    }

    // Delete selection from group
    ungroupSelection(groupId: Event) {

        this.confirmationService.confirm({
            message: 'Are you sure you want to ungroup <b>' + this.tbSelectedRows.length + '</b> records?',
            header: 'Ungrouping records',
            accept: () => {

                let groupIndex = this.tbGroups.findIndex((i: any) => i.group_id === groupId)
                let groupName = this.tbGroups[groupIndex]["group_name"]

                for (let i = 0; i < this.tbSelectedRows.length; i++) {

                    let groupIndex = this.tbSelectedRows[i].group.findIndex((i: any) => i === groupId)
                    this.tbSelectedRows[i].group.splice(groupIndex, 1);
                    this.tdData[i] = this.tbSelectedRows[i]

                }

                this.onValidationMsg = '"' + this.tbSelectedRows.length + '" were removed from "' + groupName + '" successfully.'
                setTimeout(() => {
                    this.onValidationMsg = "";
                }, 2000);

                console.log(this.tdData)

            }
        });

        this.clearInput = ""
        console.log(this.tdData)

    }

    // Change normal view to group selected view
    changeTBToGroupView(groupId: string, groupName: string, tdData: any) {

        let recordsInGroup = this.tdData.filter((i: any) => i.group.includes(groupId))

        if(groupName === "all"){

            this.clonedtdData[tdData] = { ...tdData };
            console.log(this.clonedtdData[tdData])

        }else if (recordsInGroup == 0){

            this.tdData = this.clonedtdData[tdData]

            this.onValidationMsg = 'There is no record added to group "' + groupName + '".'
            setTimeout(() => {
                this.onValidationMsg = "";
            }, 5000);
            
        }else {

            this.tdData = recordsInGroup

            this.onValidationMsg = 'Table was filtered to "' + groupName + '" successfully. Now you see ' + recordsInGroup.length + ' records.'
            setTimeout(() => {
                this.onValidationMsg = "";
            }, 5000);

        } 

    }

}