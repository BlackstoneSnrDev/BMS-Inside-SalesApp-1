import { Component, ViewChild } from '@angular/core';
// Get table data
import { DataService } from '../../services/services.service';
// User Info
import { UsersService } from '../../services/auth.service';
// PrimeNG
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { PrimeNGConfig } from 'primeng/api';
import { Table } from 'primeng/table';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FormatPhone } from '../../pipes/formatPhone.pipe';

import { Papa } from 'ngx-papaparse';
import { doc } from '@angular/fire/firestore';

@Component({
  selector: 'table-component',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css', '../../css/neumorphism.component.css'],
  providers: [MessageService],
})
export class TableComponent {
  public userInfo: any;

  public thData: any = null;
  public thDataLength: number = 0;

  public tdData: any = [];
  public clonedtdData: any = {};

  public modifyTable: string = 'all';

  public tbSelectedRows: any = [];
  public loading: boolean = true;

  public tbGroups: any;
  public tbGroupsLength: number = 0;

  public tglUploadList: boolean = false;
  public tglCreateNewGroup: boolean = false;
  public tglMenuTable: boolean = false;
  public tglAddNewRecord: boolean = false;
  public tglRemoveFromGroup: boolean = false;

  public addNewRecordForm!: FormGroup;
  public newFormControl: any = {};
  public onValidationError: string = '';
  public createNewGroup = new FormControl();
  public renameGroup = new FormControl();
  public groupSelect = new FormControl();

  public uploadListForm!: FormGroup;
  public fileToUpload: File | undefined;
  public uploadStatus: any = null;

  // Address type
  public tglModifyAddressForm: boolean = false;
  public addressForm!: FormGroup;
  public addressInputsForm!: FormGroup;
  public tgleditField: boolean = false;
  public countries: any;
  public states: any;
  public addressFieldName: string = '';
  public selectedCountryCode: string = 'US';
  public selectedStateCode: string = '';
  public optSMS: any;
  public smsMessageSent = new FormControl();

  uploadedFiles: any[] = [];

  constructor(
    private DataService: DataService,
    private UsersService: UsersService,
    private confirmationService: ConfirmationService,
    private primengConfig: PrimeNGConfig,

    private messageService: MessageService,
    private papa: Papa,
    private formatPhone: FormatPhone
  ) {}

  ngOnInit() {
    this.primengConfig.ripple = false;

    //this.DataService.fixCustomers();

    this.UsersService.userInfo.subscribe(
      (userInfo) => (this.userInfo = userInfo)
    );

    this.DataService.getUserSettings().subscribe((response) => {
      response.forEach((item: any) => {
        if (item.docId === 'textMessage') {
          let textArray: {
            templateContent: any;
            templateId: any;
            templateName: any;
          }[] = [];
          Object.values(item)
            .filter((e) => typeof e !== 'string')
            .forEach((email: any) => {
              textArray.push({
                templateContent: email.data,
                templateId: email.uid,
                templateName: email.templateName,
              });
            });
          this.optSMS = textArray;
        }
      });
    });

    this.addressInputsForm = new FormGroup({});
    this.DataService.getTableCustomerHeader()
      .then((data) => {
        this.thData = data.sort((a, b) => a.element_order - b.element_order);
      })
      .then(() => {
        this.DataService.getTableData().subscribe((data) => {
          this.tdData = data;
          this.tdData.forEach((element: any, index: number) => {
            this.tdData[index]['slIndex'] = index;
          });
        });
      })
      .then(() => {
        this.thDataLength = this.thData.length;
      })
      .then(() => {
        this.DataService.getCustomerGroups().subscribe((data) => {
          (this.tbGroups = data), (this.tbGroupsLength = data.length);
          let modifyById = sessionStorage.getItem('dataTableView');

          let showGroupChangeMsg = true;
          if (this.modifyTable === modifyById) {
            showGroupChangeMsg = false;
          }
          setTimeout(() => {
            this.modifyTableView(modifyById as string, showGroupChangeMsg);
            this.loading = false;
          }, 400);
        });
      })
      .then(
        () => {
          for (let [i, v] of this.thData.entries()) {
            this.newFormControl[v.field] = new FormControl('', [
              Validators.required,
              Validators.minLength(1),
            ]);
          }
          this.addNewRecordForm = new FormGroup(this.newFormControl);
          this.showTableGlobalFilter();
        },
        (error) => {
          console.error(error);
        }
      );
  }

  showTableGlobalFilter() {
    let tableFiltered: any = sessionStorage.getItem('stateDataTable');
    let filterT = JSON.parse(tableFiltered).filters.global;
    if (filterT) {
      this.messageService.add({
        severity: 'success',
        summary: 'Service Message',
        detail:
          'Table was filtered by: "' +
          filterT.value +
          '" To see all records, please click "Clear filters" button.',
      });
    }
  }

  toggleUploadList() {
    this.tglUploadList = !this.tglUploadList;
    this.addNewRecordForm.reset();
  }

  uploadRecordList(event: any, uploadFile: any) {
    this.uploadedFiles = event.files;

    this.DataService.fileUpload(event.files[0]).catch((reason) =>
      this.messageService.add({
        severity: 'error',
        summary: 'Service Message',
        detail: reason,
        sticky: true,
      })
    );

    setTimeout(() => {
      this.messageService.clear();
    }, 30000);

    let reader: FileReader = new FileReader();
    reader.readAsText(event.files[0]);
    reader.onload = (e) => {
      let csv: string = reader.result as string;

      let options = {
        header: true,
        complete: (results: any) => {
          this.DataService.fileUpload(results).then((responce: any) => {
            if (responce.status === 'Success') {
              this.messageService.add({
                severity: 'success',
                summary: 'Service Message',
                detail: responce.data,
              });
            } else if (responce.status === 'Error') {
              this.messageService.add({
                severity: 'error',
                summary: 'Service Message',
                detail: responce.data,
              });
            }
          });
        },
      };

      this.papa.parse(csv, options);
    };
    uploadFile.clear();
  }

  @ViewChild('dataTable') table!: Table;

  clear(table: Table) {
    table.clear();
    this.tbSelectedRows = [];
    this.renameGroup.reset();
    this.createNewGroup.reset();
    this.tglMenuTable = false;
    table.sortField = '';
    table.sortOrder = 0;

    this.modifyTableView('all', true);

    table.filterGlobal('', 'contains');

    this.messageService.add({
      severity: 'success',
      summary: 'Service Message',
      detail: 'Table was restored.',
    });
  }

  // Table on row CRUD
  onRowEditInit(tdData: any, index: any) {
    this.clonedtdData[index] = { ...tdData };
    this.addressInputsForm.addControl(
      'addressTableField' + index,
      new FormControl('', [Validators.required, Validators.minLength(1)])
    );
  }

  onRowEditSave(tdData: any, index: number) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to edit this record?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.addressInputsForm.removeControl('addressTableField' + index);

        let modifyLastElmActive = (
          document.getElementById('tr' + index) as HTMLInputElement
        ).getElementsByClassName('ng-invalid');

        if (modifyLastElmActive.length > 0) {
          this.onValidationError = '*All fields must be filled out.';
          this.onRowEditCancel(index);
        } else {
          tdData['Phone Number'] = this.formatPhone.transform(
            tdData['Phone Number'],
            'toNumber'
          );
          this.DataService.editCustomer(tdData);
          console.log(tdData);
          this.messageService.add({
            severity: 'success',
            summary: 'Service Message',
            detail: 'Record was edited successfully.',
          });
        }
      },
      reject: () => {
        this.onRowEditCancel(index);
      },
    });
  }

  onRowEditCancel(index: any) {
    this.tdData[index] = this.clonedtdData[index];
    delete this.clonedtdData[index];

    this.addressInputsForm.removeControl('addressTableField' + index);
  }

  onRowDeleteRow(uid: any) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this selection?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.DataService.deleteCustomer(uid);
        this.tbSelectedRows = [];
        this.messageService.add({
          severity: 'success',
          summary: 'Service Message',
          detail: 'Record was deleted successfully.',
        });
      },
    });
  }

  toggleTableMenu() {
    if (this.tbSelectedRows.length > 0) {
      this.tglMenuTable = true;
    } else {
      this.tglMenuTable = false;
    }
  }

  toggleAddNewRecord() {
    this.tglAddNewRecord = !this.tglAddNewRecord;
  }

  saveAddNewRecord(table: Table) {
    let value = this.addNewRecordForm.value;
    value['group'] = [];

    value['Phone Number'] = this.formatPhone.transform(
      value['Phone Number'],
      'toNumber'
    );
    table.filter(value['Phone Number'], 'global', 'contains');
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
    this.DataService.addNewRecord(value);

    this.messageService.add({
      severity: 'success',
      summary: 'Service Message',
      detail: 'New record was added successfully.',
    });
    this.messageService.add({
      severity: 'success',
      summary: 'Service Message',
      detail:
        'Showing new record added. To see all records, please click "Clear filters" button.',
      sticky: true,
    });
    this.cancelAddNewRecord();

    setTimeout(() => {
      this.messageService.clear();
    }, 30000);
  }

  cancelAddNewRecord() {
    this.tglAddNewRecord = false;
    this.addNewRecordForm.reset();
  }

  // Delete selection
  deleteSelection() {
    this.functionMissing();

    if (this.tbSelectedRows.length > 0) {
      this.confirmationService.confirm({
        message:
          'Are you sure you want to delete <b>' +
          this.tbSelectedRows.length +
          '</b> records?',
        header: 'Deleting (' + this.tbSelectedRows.length + ' records)',
        accept: () => {
          this.tglMenuTable = false;
          this.tdData = this.tdData.filter(
            (val: any) => !this.tbSelectedRows.includes(val)
          );

          this.messageService.add({
            severity: 'success',
            summary: 'Service Message',
            detail:
              '(' +
              this.tbSelectedRows.length +
              ') record(s) were deleted successfully.',
          });

          this.tbSelectedRows = [];
        },
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Service Message',
        detail:
          'There are ' + this.tbSelectedRows.length + ' record(s) selected.',
      });
    }
  }

  // Groups CRUD
  // Create new group
  toggleCreateNewGroup() {
    this.tglCreateNewGroup = true;
  }

  saveCreateNewGroup() {
    let groupName = this.createNewGroup.value;

    let rowUidArray: any[] = [];
    this.tbSelectedRows.map((row: any) => {
      rowUidArray.push(row.uid);
    });

    this.DataService.createNewCustomerGroup(
      groupName.toLowerCase(),
      rowUidArray
    );

    this.messageService.add({
      severity: 'success',
      summary: 'Service Message',
      detail: 'New group was created as "' + groupName + '" successfully.',
    });

    let newGroupId = '';
    setTimeout(() => {
      let newGroupIndex = this.tbGroups.findIndex(
        (i: any) => i.group_name === groupName
      );
      newGroupId = this.tbGroups[newGroupIndex].group_id;
      this.modifyTableView(newGroupId, true);
    }, 500);

    this.tglCreateNewGroup = false;
    this.createNewGroup.reset();
    this.tbSelectedRows = [];
  }

  cancelCreateNewGroup() {
    this.tglCreateNewGroup = false;
    this.createNewGroup.reset();
  }

  // Edit group created
  toggleEditGroup(id: any) {
    document
      .getElementById('massive-sms-container' + id)
      ?.classList.toggle('hide');
    document.getElementById('delete-container' + id)?.classList.toggle('hide');
    document
      .getElementById('rename-group-container' + id)
      ?.classList.toggle('hide');
    document
      .getElementById('btn-rename-group-container' + id)
      ?.classList.toggle('hide');
  }

  saveRenameGroup(groupId: number, event: Event) {
    this.functionMissing();

    let groupName = this.renameGroup.value;

    let group = this.tbGroups.findIndex((i: any) => i.group_id === groupId);
    let nameg = this.tbGroups[group]['group_name'];

    this.confirmationService.confirm({
      message:
        'Are you sure you want to rename <b>' +
        nameg +
        '</b> to "<b>' +
        groupName +
        '</b>"?',
      header: 'Renaming group',
      accept: () => {
        this.tbGroups[group]['group_name'] = groupName;

        this.messageService.add({
          severity: 'success',
          summary: 'Service Message',
          detail:
            'Group ' +
            nameg +
            ' was renamed as "' +
            groupName +
            '" successfully.',
        });

        let tglEdit = (
          event.target as HTMLInputElement
        ).parentElement?.previousElementSibling?.classList.toggle('hide');
        let tglEdit2 = (
          event.target as HTMLInputElement
        ).parentElement?.classList.toggle('hide');
      },
    });

    this.renameGroup.reset();
  }

  cancelRenameGroup(id: any) {
    this.toggleEditGroup(id);
    this.renameGroup.reset();
  }

  sendMassiveSMS(groupId: any) {
    this.functionMissing();

    let groupSelected = this.tbGroups.filter(
      (v: any) => v.group_id === groupId
    );

    let groupName = '';
    groupSelected.forEach((e: any) => {
      groupName = e.group_name;
    });

    this.confirmationService.confirm({
      message:
        'Are you sure you want to send this message to <b>ALL</b> records in group <b>"' +
        groupName +
        '"</b>?',
      header: 'Warning',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Service Message',
          detail: 'Massive SMS sent.',
        });
        this.smsMessageSent.reset();
      },
      reject: () => {
        this.smsMessageSent.reset();
      },
    });
  }

  deleteGroup(groupId: any, groupName: string, event: string) {
    let records = 0;

    for (let i = 0; i < this.tdData.length; i++) {
      let recordsGrouped = this.tdData[i].group.includes(groupId);
      if (recordsGrouped) {
        records += 1;
      }
    }

    this.confirmationService.confirm({
      message:
        '<b>"' +
        groupName +
        '"</b> group has (' +
        records +
        ') record(s) grouped. Do you want to delete it?',
      header: 'Deleting group',
      accept: () => {
        this.DataService.deleteCustomerGroup(groupId);

        this.modifyTableView('all', true);

        this.messageService.add({
          severity: 'success',
          summary: 'Service Message',
          detail: '"' + groupName + '" was deleted successfully.',
        });
      },
      reject: () => {
        this.modifyTableView(groupId, true);
      },
    });
  }

  // Add selection to group
  addToExistingGroup() {
    let groupId = this.groupSelect.value;
    this.groupSelect.reset();

    this.confirmationService.confirm({
      message:
        'Are you sure you want to group <b>' +
        this.tbSelectedRows.length +
        '</b> records?',
      header: 'Grouping records',
      accept: () => {
        let groupIndex = this.tbGroups.findIndex(
          (i: any) => i.group_id === groupId
        );
        let groupName = this.tbGroups[groupIndex]['group_name'];

        let rowUidArray: any[] = [];
        this.tbSelectedRows.map((row: any) => {
          rowUidArray.push(row.uid);
        });
        this.DataService.addToExistingCustomerGroup(groupId, rowUidArray);

        this.messageService.add({
          severity: 'success',
          summary: 'Service Message',
          detail:
            '(' +
            this.tbSelectedRows.length +
            ') record(s) were added to "' +
            groupName +
            '" successfully.',
        });
        this.tbSelectedRows = [];
      },
    });
  }

  // Delete selection from group
  ungroupSelection() {
    let groupId = this.modifyTable;

    let groupIndex = this.tbGroups.findIndex(
      (i: any) => i.group_id === groupId
    );
    this.confirmationService.confirm({
      message:
        'Are you sure you want to ungroup <b>(' +
        this.tbSelectedRows.length +
        ')</b> record(s)?',
      header: 'Ungrouping records',
      accept: () => {
        let groupName = this.tbGroups[groupIndex]['group_name'];

        let rowUidArray: any[] = [];
        this.tbSelectedRows.map((row: any) => {
          rowUidArray.push(row.uid);
        });
        this.DataService.removeFromCustomerGroup(groupId, rowUidArray);
        this.messageService.add({
          severity: 'success',
          summary: 'Service Message',
          detail:
            '(' +
            this.tbSelectedRows.length +
            ') record(s) were removed from "' +
            groupName +
            '" successfully.',
        });

        let records = 0;
        setTimeout(() => {
          for (let i = 0; i < this.tdData.length; i++) {
            let recordsGrouped = this.tdData[i].group.includes(groupId);
            if (recordsGrouped) {
              records += 1;
            }
          }
          if (records == 0) {
            this.deleteGroup(groupId, groupName, 'noRecordsInside');
          }
        }, 500);
        this.tbSelectedRows = [];
      },
    });
  }

  // Change normal view to group selected view
  modifyTableView(modifyById: string, showMsg: boolean) {
    this.loading = true;

    if (!modifyById) {
      modifyById = 'all';
    }

    let modifyLastElmActive = document.getElementsByClassName(
      'button-neumorphism-active'
    );

    sessionStorage.setItem('dataTableView', modifyById);

    while (modifyLastElmActive.length > 0) {
      modifyLastElmActive[0].classList.remove('button-neumorphism-active');
    }

    document
      .getElementById(modifyById)
      ?.classList.add('button-neumorphism-active');

    this.modifyTable = modifyById;
    this.loading = false;

    if (modifyById !== 'all') {
      let groupInfo = this.tbGroups.filter(
        (a: any, i: any) => a.group_id === modifyById
      );
      let group_name = groupInfo[0]['group_name'];

      if (showMsg) {
        this.messageService.add({
          severity: 'success',
          summary: 'Service Message',
          detail: 'Showing records from "' + group_name + '" group.',
        });
      }

      this.tglRemoveFromGroup = true;
    } else {
      this.tglRemoveFromGroup = false;
    }
    this.tbSelectedRows = [];
  }

  log = (data: any) => console.log(data);

  // Address type
  toggleModifyAddressForm(
    addressName: any,
    formControlName: any,
    typeForm: any
  ) {
    let currentAddres = '';
    let street, apt, city, state, zip, country;

    if (typeForm === 'new') {
      if (formControlName) {
        currentAddres = this.addNewRecordForm.get(formControlName)?.value;
      }
    } else if (typeForm === 'table') {
      currentAddres = formControlName;
    }
    if (currentAddres) {
      let count = currentAddres.split(',').length - 1;
      if (count > 4) {
        street = currentAddres.split(',')[0];
        apt = currentAddres.split(',')[1].trim();
        city = currentAddres.split(',')[2];
        state = currentAddres.split(',')[3];
        zip = currentAddres.split(',')[4];
        country = currentAddres.split(',')[5];
      } else {
        street = currentAddres.split(',')[0];
        city = currentAddres.split(',')[1];
        state = currentAddres.split(',')[2];
        zip = currentAddres.split(',')[3];
        country = currentAddres.split(',')[4];
      }
    } else {
      country = 'US';
    }

    this.addressForm = new FormGroup({
      slcCountry: new FormControl(country?.replace(/\s/g, ''), [
        Validators.required,
        Validators.minLength(1),
      ]),
      slcState: new FormControl(state?.replace(/\s/g, ''), [
        Validators.required,
        Validators.minLength(1),
      ]),
      txtCity: new FormControl(city?.trim(), [
        Validators.required,
        Validators.minLength(1),
      ]),
      txtStreet: new FormControl(street?.trim(), [
        Validators.required,
        Validators.minLength(1),
      ]),
      txtApt: new FormControl(apt),
      txtZip: new FormControl(zip?.replace(/\s/g, ''), [
        Validators.required,
        Validators.minLength(1),
      ]),
    });

    this.addressFieldName = addressName;

    this.tglModifyAddressForm = true;
    this.DataService.getFormCountry().subscribe(
      (response) => {
        this.countries = response.data;
        this.getCountryInfo();
      },

      (error) => {
        console.error(error);
      }
    );
  }

  getCountryInfo() {
    this.DataService.getFormState().subscribe(
      (response) => {
        this.selectedCountryCode = this.addressForm.get('slcCountry')!.value;
        this.states = response.data.filter((i: any) =>
          i.iso2.includes(this.selectedCountryCode)
        );

        for (let i of this.states) {
          this.states = i.states;
        }
      },

      (error) => {
        console.error(error);
      }
    );
  }

  saveAddressModified(city: string, street: string, apt: string, zip: string) {
    this.selectedStateCode = this.addressForm.get('slcState')!.value;

    let newAddres;
    if (apt) {
      newAddres =
        street +
        ', ' +
        apt +
        ', ' +
        city +
        ', ' +
        this.selectedStateCode +
        ', ' +
        zip +
        ', ' +
        this.selectedCountryCode;
    } else {
      newAddres =
        street +
        ', ' +
        city +
        ', ' +
        this.selectedStateCode +
        ', ' +
        zip +
        ', ' +
        this.selectedCountryCode;
    }

    let form = this.addNewRecordForm.contains(this.addressFieldName);
    if (form) {
      this.addNewRecordForm.patchValue({
        [this.addressFieldName]: newAddres,
      });
    } else {
      this.addressInputsForm.patchValue({
        [this.addressFieldName]: newAddres,
      });
    }

    this.tglModifyAddressForm = false;
    this.messageService.add({
      severity: 'success',
      summary: 'Service Message',
      detail: 'Address was added successfully. Please save changes.',
    });
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

function subscribe(arg0: (data: any) => void) {
  throw new Error('Function not implemented.');
}
