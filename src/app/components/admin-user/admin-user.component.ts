import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/services.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Table } from 'primeng/table';
import { ConfirmationService } from 'primeng/api';
import { UsersService } from "../../services/auth.service";


@Component({
    selector: 'admin-user-component',
    templateUrl: './admin-user.component.html',
    styleUrls: ['./admin-user.component.css', '../../css/neumorphism.component.css', '../../components/table/table.component.css']
})

export class AdminUserComponent implements OnInit {

//     <<<<<<< main
//   public tdData: any;
//   public thData: any;
//   public selectElmType: any;
//   public clonedTdData: any = {};
//   public tbSelectedRows: any;
//   public loading: boolean = true;

//   public tglUploadList: boolean = false;
//   public tglAddNewUser: boolean = false;
//   public addNewUserForm!: FormGroup;
//   public newFormControl: any = {};

//   public onValidationError: string = '';
//   public onValidationMsg: string = '';

//   public dbObjKey: any;
//   public userInfo: any;

//   constructor(
//     private dataService: DataService,
//     private confirmationService: ConfirmationService,
//     private usersService: UsersService,
//     private messageService: MessageService
//   ) {}

//   ngOnInit() {
//     this.dataService
//       .getUserTableHeader()
//       .then((data: any) => {
//         this.thData = data.sort(
//           (a: { element_order: number }, b: { element_order: number }) =>
//             a.element_order - b.element_order
//         );
//         console.log(this.thData);
//         for (let i of this.thData) {
//           this.newFormControl[i.field] = new FormControl('', [
//             Validators.required,
//             Validators.minLength(1),
//           ]);
// =======

    public tdData: any;
    public thData: any;
    public selectElmType: any;
    public clonedTdData: any = {};
    public tbSelectedRows: any;

    public tglUploadList: boolean = false;
    public tglAddNewUser: boolean = false;
    public addNewUserForm!: FormGroup;
    public newFormControl: any = {};

    public onValidationError: string = "";
    public onValidationMsg: string = "";

    public dbObjKey: any;
    public userInfo: any;

    constructor(private dataService: DataService, private confirmationService: ConfirmationService, private usersService: UsersService) { }

    ngOnInit() {

        this.dataService.getUserTableHeader().then((data: any) => {
            this.thData = data.sort((a: { element_order: number; }, b: { element_order: number; }) => a.element_order - b.element_order);
            console.log(this.thData)
            for (let i of this.thData) {
                this.newFormControl[i.field] = new FormControl('', [Validators.required, Validators.minLength(1)])
            }
            this.addNewUserForm = new FormGroup(this.newFormControl);
        }).then(() => {
            this.dataService.getAllUsers().subscribe((data: any) => {
                this.tdData = data
                this.tdData.forEach((element: any, index: number) => {
                    this.tdData[index]["slIndex"] = index;
                })
            })
        }).then(() => {
            for (let i of this.thData) {
                this.newFormControl[i.field] = new FormControl('', [Validators.required, Validators.minLength(1)])
            }
            this.addNewUserForm = new FormGroup(this.newFormControl);
        })

    }


    // Table on row CRUD
    onRowEditInit(tdData: any, id: number) {
        this.clonedTdData[tdData.id] = { ...tdData };
    }

    onRowEditSave(tdData: any, index: number) {

        let modifyLastElmActive = (document.getElementById('tr' + index) as HTMLInputElement).getElementsByClassName('ng-invalid')

        if (modifyLastElmActive.length > 0) {
            this.onValidationError = '*All fields must be filled out.'
        } else {

            delete this.clonedTdData[tdData.id];

            console.log('clicked')
        }

    }

    onRowEditCancel(tdData: any, index: number) {

        this.tdData[index] = this.clonedTdData[tdData.id];
        delete this.tdData[tdData.id];

    }

    onRowDeleteRow(id: any) {

        this.confirmationService.confirm({
            message: 'Are you sure you want to delete this user?',
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

    toggleAddNewUser() {
        console.log(this.addNewUserForm);
        this.tglAddNewUser = !this.tglAddNewUser
    }

    saveAddNewUser(table: Table) {

        let value = this.addNewUserForm.value;

        this.dataService.createUser(value).subscribe((res: any) => {console.log(res);})

        this.addNewUserForm.reset();

        this.onValidationMsg = 'New user was added successfully.'
        setTimeout(() => {
            this.onValidationMsg = "";
        }, 5000);

    }

    cancelAddNewUser() {

        this.tglAddNewUser = false
        this.addNewUserForm.reset();

    }

    toggleUploadList() {

        this.tglUploadList = !this.tglUploadList

    }

    getFileUploaded(event: Event) {

        console.log(event)
    }

    log(val: any) { console.log(val); }

}
