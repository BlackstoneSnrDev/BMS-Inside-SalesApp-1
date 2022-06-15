import { Component, ViewChild,  Output, EventEmitter } from '@angular/core';
// Get table data
import { DataService } from '../../services/services.service';
// PrimeNG
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { PrimeNGConfig } from "primeng/api";
import { Table } from 'primeng/table';
import { FormGroup, FormControl, Validators, FormBuilder} from '@angular/forms';

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

    public addNewRecordForm!:FormGroup;
    public newFormControl: any = {};
    public onValidationError: string = "";

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
                    this.newFormControl[i.field] =  new FormControl('', [Validators.required, Validators.minLength(1)]);  
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
            }
        });

    }

    toggleTableMenu() {
        if(this.tbSelectedRows.length > 0){
            this.tglMenuTable = true

        }else{
            this.tglMenuTable = false

        }
        console.log(this.tbSelectedRows)
    }

    toggleAddNewRecord() {

        this.tglAddNewRecord = ! this.tglAddNewRecord
    }

    saveAddNewRecord(table: Table){
        
        let value = this.addNewRecordForm.value;
        value['group'] = []
        this.tdData.push(value);
        
        table._totalRecords = this.tdData.length
        this.addNewRecordForm.reset();
        console.log(this.tdData)

    }


    cancelAddNewRecord(){

        this.tglAddNewRecord = false
        this.addNewRecordForm.reset();

    }

    // Delete selection
    deleteSelection() {

        if (this.tdData.length > 0) {
            this.confirmationService.confirm({
                message: 'Are you sure you want to delete this selection?',
                header: 'Confirm',
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    this.tglMenuTable = false
                    this.tdData = this.tdData.filter((val: any) => !this.tbSelectedRows.includes(val));
                    this.tbSelectedRows = [];
                }
            });
        } else {
            console.log(this.tdData)

        }

    }

    // Groups CRUD
    toggleGroupSection(){
        this.tglGroupMenu = !this.tglGroupMenu

    }
    // Create new group
    toggleCreateNewGroup() {
        this.tglCreateNewGroup = true
    }

    saveCreateNewGroup(groupName: string) {

        if(!groupName){
            this.onValidationError = "*Group name must be specified."
        }else{
            let newIndex = this.tbGroups.length + 1
            this.tbGroups.push({ "group_id": "g" + newIndex, "group_name": groupName});

            this.groupSelection("g" + newIndex)

            this.tglCreateNewGroup = false
            this.clearInput = ""
            console.log(this.tbGroups)
        }

    }

    cancelCreateNewGroup(){

        this.tglCreateNewGroup = false
        this.clearInput = ""
        this.onValidationError = ""
    }

    // Edit group created
    toggleEditGroup(event: Event){

        (event.target as HTMLInputElement).classList.toggle("hide");
        (event.target as HTMLInputElement).nextElementSibling?.classList.toggle("hide");

    }

    saveRenameGroup(groupId: number, groupName: string, event: Event){

        if(groupName){
            let group = this.tbGroups.findIndex((i: any) => i.group_id === groupId)
            this.tbGroups[group]["group_name"] = groupName
    
            let tglEdit = (event.target as HTMLInputElement).parentElement?.previousElementSibling?.classList.toggle("hide");
            let tglEdit2 = (event.target as HTMLInputElement).parentElement?.classList.toggle("hide");
            this.clearInput = ""
        }
        
    }

    cancelRenameGroup(event: Event){

        let tglEdit = (event.target as HTMLInputElement).parentElement?.previousElementSibling?.classList.toggle("hide");
        let tglEdit2 = (event.target as HTMLInputElement).parentElement?.classList.toggle("hide");
        this.clearInput = ""
    }

    deleteGroup(groupId: number){

        let groupIndex = this.tbGroups.findIndex((i: any) => i.group_id === groupId)
        this.tbGroups = this.tbGroups.filter((i: any) => i.group_id.includes(groupIndex))

    }

    // Add selection to group
    groupSelection(groupId: any) {
        this.clearInput = ""
            for (let i = 0; i < this.tbSelectedRows.length; i++) {
                let oldGroupLenght = this.tbSelectedRows[i]["group"].length

                let doubleGroup = this.tbSelectedRows[i].group
                        
                        if(doubleGroup.includes(groupId)){
                            this.onValidationError = "Selection is already grouped."
                        }else{

                            if (oldGroupLenght == 0) {
                                this.tbSelectedRows[i]["group"][0] = groupId
                            } else {
                                this.tbSelectedRows[i]["group"][oldGroupLenght] = groupId
                            }
                        }
    
                this.tdData[i] = this.tbSelectedRows[i]
                console.log(this.tdData[i])

            }

            console.log(this.tdData)
            this.clearInput = ""
    }

    // Delete selection from group
    ungroupSelection(groupId: Event) {
        
        for (let i = 0; i < this.tbSelectedRows.length; i++) {
            let groupIndex = this.tbSelectedRows[i].group.findIndex((i: any) => i === groupId)
            // Missing delete index 
        }

        this.clearInput = ""
        console.log(this.tdData)

    }
    
    // Change normal view to group selected view
    changeTBToGroupView(groupId: string) {

        let selectRow = this.tdData.filter((i: any) => i.group.includes(groupId))

        if (selectRow == 0) {
            this.tdData = this.tdData
        } else {
            this.tdData = selectRow
        }

    }

}