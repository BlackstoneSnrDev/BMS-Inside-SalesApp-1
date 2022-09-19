import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/services.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'admin-user-component',
  templateUrl: './admin-user.component.html',
  styleUrls: [
    './admin-user.component.css',
    '../../css/neumorphism.component.css',
    '../../components/table/table.component.css',
  ],
})
export class AdminUserComponent implements OnInit {
  public tdData: any;
  public thData: any;
  public selectDept: any;
  public selectRole: any;

  public clonedTdData: any = {};
  public tbSelectedRows: any;
  public loading: boolean = true;

  public newFormControl: any = {};
  public onValidationError: string = '';
  public createNewUserForm!: FormGroup;
  public tglCreateUser: boolean = false;

  constructor(
    private dataService: DataService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.dataService
      .getUserTableHeader()
      .then((data: any) => {
        this.thData = data.sort(
          (a: { element_order: number }, b: { element_order: number }) =>
            a.element_order - b.element_order
        );
      })
      .then(() => {
        this.dataService.getAllUsers().subscribe((data: any) => {
          this.tdData = data;
          this.tdData.forEach((element: any, index: number) => {
            this.tdData[index]['slIndex'] = index;
          });
        });
      })
      .then(() => {
        for (let i of this.thData) {
          this.newFormControl[i.field] = new FormControl('', [
            Validators.required,
            Validators.minLength(1),
          ]);
        }
        this.createNewUserForm = new FormGroup(this.newFormControl);

        this.loading = false;
      });

    this.dataService.getSelectData().subscribe(
      (response) => {
        this.selectDept = response.selectDepartment;
        this.selectRole = response.selectRole;
      },

      (error) => {
        console.error(error);
      }
    );
  }

  // Table on row CRUD
  onRowEditInit(rowTdData: any, index: any) {
    this.clonedTdData[index] = { ...rowTdData };
  }

  onRowEditSave(rowTdData: any, indexElm: number) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to edit this user?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        let modifyLastElmActive = (
          document.getElementById('tr' + indexElm) as HTMLInputElement
        ).getElementsByClassName('ng-invalid');

        if (modifyLastElmActive.length > 0) {
          this.onValidationError = '*All fields must be filled out.';
        } else {
          this.tdData[indexElm] = rowTdData;
          delete this.clonedTdData[rowTdData.id];
          this.messageService.add({
            severity: 'success',
            summary: 'Service Message',
            detail: 'User was edited successfully.',
          });
        }
      },
      reject: () => {
        this.onRowEditCancel(indexElm);
      },
    });
  }

  onRowEditCancel(index: number) {
    this.tdData[index] = this.clonedTdData[index];
    delete this.clonedTdData[index];
  }

  onRowDeleteRow(id: any) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this user?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.tdData = this.tdData.filter((i: any) => ![id].includes(i.uid));
        this.tbSelectedRows = [];

        this.messageService.add({
          severity: 'success',
          summary: 'Service Message',
          detail: 'User was deleted successfully.',
        });
      },
    });
  }

  log(val: any) {
    console.log(val);
  }

  toggleCreateNewUser() {
    this.tglCreateUser = true;
    this.createNewUserForm.reset();
  }

  cancelCreateNewUser() {
    this.tglCreateUser = false;
    this.createNewUserForm.reset();
  }

  saveCreateNewUser() {
    this.tglCreateUser = false;

    let value = this.createNewUserForm.value;

    this.tdData.push(this.createNewUserForm.value);
    let id = this.tdData.length - 1;
    this.tdData[id]['uid'] = id;

    // NOT WORKING
    // this.dataService.createUser(value).subscribe((res: any) => {
    //   console.log(res);
    // });

    this.createNewUserForm.reset();

    this.messageService.add({
      severity: 'success',
      summary: 'Service Message',
      detail: 'New user was created successfully.',
    });
  }
}
