import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/services.service';
import { ConfirmationService } from 'primeng/api';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-admin-depts',
  templateUrl: './admin-depts.component.html',
  styleUrls: [
    './admin-depts.component.css',
    '../../css/neumorphism.component.css',
    '../../components/table/table.component.css',
  ],
})
export class AdminDeptsComponent implements OnInit {
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

  public tglAddDept: boolean = false;
  public newFormControl: any = {};
  public onValidationError: string = '';
  public createNewDeptForm!: FormGroup;
  public selectLeads: any;

  ngOnInit() {
    this.dataService.getMyTableData().subscribe(
      (response) => {
        this.thData = response.tableDept_th;
        this.tdData = response.tableDept_td;
        for (let i of this.thData) {
          this.newFormControl[i.field] = new FormControl('', [
            Validators.required,
            Validators.minLength(1),
          ]);
        }
        this.createNewDeptForm = new FormGroup(this.newFormControl);

        this.loading = false;
      },

      (error) => {
        console.error(error);
      }
    );

    this.dataService.getAllUsers().subscribe((data: any) => {
      data.push({
        activeGroup: [],
        activeTemplate: 'Template One',
        admin: true,
        department: 'Inside Sales',
        email: 'daniM@yahoo.com',
        name: 'Daniel , Moreno',
        role: 'Lead',
        tenant: 'No',
        uid: 'VvEP5DbN34wYy5m2',
        username: 'daniM@yahoo.com',
      });

      this.selectLeads = data.filter((a: any, i: any) => a.role === 'Lead');
    });
  }

  toggleAddNewDept() {
    this.tglAddDept = !this.tglAddDept;
  }

  // Table on row CRUD
  onRowEditInit(rowTdData: any, index: any) {
    this.clonedTdData[index] = { ...rowTdData };
  }

  onRowEditSave(rowTdData: any, indexElm: number) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to edit this department?',
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
            detail: 'Department was edited successfully.',
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
      message: 'Are you sure you want to delete this department?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.tdData = this.tdData.filter((i: any) => ![id].includes(i.slIndex));
        this.tbSelectedRows = [];

        this.messageService.add({
          severity: 'success',
          summary: 'Service Message',
          detail: 'Department was deleted successfully.',
        });
      },
    });
  }

  cancelAddNewDept() {
    this.tglAddDept = false;
    this.createNewDeptForm.reset();
  }

  toggleCreateNewDept() {
    this.tglAddDept = true;
    this.createNewDeptForm.reset();
  }

  cancelCreateNewDept() {
    this.tglAddDept = false;
    this.createNewDeptForm.reset();
  }

  saveCreateNewDept() {
    this.tglAddDept = false;
    this.tdData.push(this.createNewDeptForm.value);
    let id = this.tdData.length - 1;
    this.tdData[id]['slIndex'] = id;

    this.messageService.add({
      severity: 'success',
      summary: 'Service Message',
      detail: 'Department was created successfully.',
    });

    this.createNewDeptForm.reset();
  }
}
