import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/services.service';
import { ConfirmationService } from 'primeng/api';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-admin-roles',
  templateUrl: './admin-roles.component.html',
  styleUrls: [
    './admin-roles.component.css',
    '../../css/neumorphism.component.css',
    '../../components/table/table.component.css',
  ],
})
export class AdminRolesComponent implements OnInit {
  constructor(
    private dataService: DataService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  public tdData: any;
  public thData: any;

  public clonedTdData: any = {};
  public tbSelectedRows: any;
  public loading: boolean = true;

  public newFormControl: any = {};
  public onValidationError: string = '';
  public createNewRoleForm!: FormGroup;
  public tglAddRole: boolean = false;
  public selectPermissions: any;

  ngOnInit() {
    this.dataService.getMyTableData().subscribe(
      (response) => {
        this.thData = response.tableRole_th;
        this.tdData = response.tableRole_td;
        for (let i of this.thData) {
          this.newFormControl[i.field] = new FormControl('', [
            Validators.required,
            Validators.minLength(1),
          ]);
        }
        this.createNewRoleForm = new FormGroup(this.newFormControl);
        this.loading = false;
      },

      (error) => {
        console.error(error);
      }
    );

    this.dataService.getSelectData().subscribe(
      (response) => {
        this.selectPermissions = response.selectPermissions;
      },

      (error) => {
        console.error(error);
      }
    );
  }

  toggleAddNewRole() {
    this.tglAddRole = !this.tglAddRole;
  }

  // Table on row CRUD
  onRowEditInit(rowTdData: any, index: any) {
    this.clonedTdData[index] = { ...rowTdData };
  }

  onRowEditSave(rowTdData: any, indexElm: number) {
    this.functionMissing();

    this.confirmationService.confirm({
      message: 'Are you sure you want to edit this role?',
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
            detail: 'Role was edited successfully.',
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
    this.functionMissing();

    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this role?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.tdData = this.tdData.filter((i: any) => ![id].includes(i.slIndex));
        this.tbSelectedRows = [];

        this.messageService.add({
          severity: 'success',
          summary: 'Service Message',
          detail: 'Role was deleted successfully.',
        });
      },
    });
  }

  toggleCreateNewRole() {
    this.tglAddRole = true;
    this.createNewRoleForm.reset();
  }

  cancelCreateNewRole() {
    this.tglAddRole = false;
    this.createNewRoleForm.reset();
  }

  saveCreateNewRole() {
    this.functionMissing();

    this.tglAddRole = false;

    this.tdData.push(this.createNewRoleForm.value);
    let id = this.tdData.length - 1;
    this.tdData[id]['slIndex'] = id;

    this.messageService.add({
      severity: 'success',
      summary: 'Service Message',
      detail: 'Role was created successfully.',
    });
    this.createNewRoleForm.reset();
  }

  functionMissing() {
    this.messageService.add({
      severity: 'error',
      summary: 'Service Message',
      detail: 'Function not connected to DB. Missing back-end intervention.',
      sticky: true,
    });
  }
}
