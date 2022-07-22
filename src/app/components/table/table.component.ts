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
  public tglGroupMenu: boolean = false;

  public addNewRecordForm!: FormGroup;
  public newFormControl: any = {};
  public onValidationError: string = '';
  public createNewGroup = new FormControl();
  public renameGroup = new FormControl();
  public searchInTable = new FormControl();
  public groupSelect = new FormControl();
  public ungroupSelect = new FormControl();

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

  constructor(
    private DataService: DataService,
    private UsersService: UsersService,
    private confirmationService: ConfirmationService,
    private primengConfig: PrimeNGConfig,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.primengConfig.ripple = false;

    this.UsersService.userInfo.subscribe(
      (userInfo) => (this.userInfo = userInfo)
    );

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
          this.loading = false;
        });
      })
      .then(
        () => {
          for (let [i, v] of this.thData.entries()) {
            if (v.field !== 'address') {
              this.newFormControl[v.field] = new FormControl('', [
                Validators.required,
                Validators.minLength(1),
              ]);
            }
            this.addressInputsForm.addControl(
              'addressAddNewRecordField' + i,
              new FormControl('', [
                Validators.required,
                Validators.minLength(1),
              ])
            );
          }
          this.addNewRecordForm = new FormGroup(this.newFormControl);
        },
        (error) => {
          console.error(error);
        }
      );
  }

  toggleUploadList() {
    this.tglUploadList = !this.tglUploadList;
  }

  getFileUploaded(event: Event) {
    console.log(event);
  }

  @ViewChild('dataTable') table!: Table;

  clear(table: Table) {
    table.clear();
    this.tbSelectedRows = [];
    this.searchInTable.setValue('');
    this.renameGroup.setValue('');
    this.createNewGroup.setValue('');
    this.tglMenuTable = false;

    this.modifyTableView('all');

    table.filterGlobal('', 'contains');

    this.messageService.add({
      severity: 'success',
      summary: 'Service Message',
      detail: 'Table was restored.',
    });
  }

  // Table on row CRUD
  onRowEditInit(tdData: any, index: any) {
    this.addressInputsForm.addControl(
      'addressTableField' + index,
      new FormControl('', [Validators.required, Validators.minLength(1)])
    );

    this.clonedtdData[index] = { ...tdData };
    console.log(this.clonedtdData[index]);
  }

  onRowEditSave(tdData: any, index: number) {
    this.addressInputsForm.removeControl('addressTableField' + index);

    let modifyLastElmActive = (
      document.getElementById('tr' + index) as HTMLInputElement
    ).getElementsByClassName('ng-invalid');

    if (modifyLastElmActive.length > 0) {
      this.onValidationError = '*All fields must be filled out.';
    } else {
      this.DataService.editCustomer(tdData);
    }
  }

  onRowEditCancel(index: number) {
    this.addressInputsForm.removeControl('addressTableField' + index);

    this.tdData[index] = this.clonedtdData[index];
    delete this.clonedtdData[index];
  }

  onRowDeleteRow(uid: any) {
    console.log(uid);
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
    this.DataService.addNewRecord(value);

    this.addNewRecordForm.reset();
    this.messageService.add({
      severity: 'success',
      summary: 'Service Message',
      detail: 'New record was added successfully.',
    });
  }

  cancelAddNewRecord() {
    this.tglAddNewRecord = false;
    this.addNewRecordForm.reset();
  }

  // Delete selection
  deleteSelection() {
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
  toggleGroupSection() {
    this.tglGroupMenu = !this.tglGroupMenu;
  }

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

    this.DataService.createNewCustomerGroup(groupName, rowUidArray);

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
      this.modifyTableView(newGroupId);
    }, 500);

    this.tglCreateNewGroup = false;
    this.createNewGroup.setValue('');
  }

  cancelCreateNewGroup() {
    this.tglCreateNewGroup = false;
    this.createNewGroup.setValue('');
  }

  // Edit group created
  toggleEditGroup(event: Event) {
    (event.target as HTMLInputElement).classList.toggle('hide');
    (event.target as HTMLInputElement).nextElementSibling?.classList.toggle(
      'hide'
    );
  }

  saveRenameGroup(groupId: number, event: Event) {
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

    this.renameGroup.setValue('');
  }

  cancelRenameGroup(event: Event) {
    let tglEdit = (
      event.target as HTMLInputElement
    ).parentElement?.previousElementSibling?.classList.toggle('hide');
    let tglEdit2 = (
      event.target as HTMLInputElement
    ).parentElement?.classList.toggle('hide');
    this.renameGroup.setValue('');
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
        '"</b> group has ' +
        records +
        ' records grouped. Do you want to delete it?',
      header: 'Deleting group',
      accept: () => {
        this.DataService.deleteCustomerGroup(groupId);

        this.modifyTableView('all');

        this.messageService.add({
          severity: 'success',
          summary: 'Service Message',
          detail: '"' + groupName + '" was deleted successfully.',
        });
      },
      reject: () => {
        this.modifyTableView(groupId);
      },
    });
  }

  // Add selection to group
  addToExistingGroup() {
    let groupId = this.groupSelect.value;
    console.log(groupId);
    this.groupSelect.setValue('');

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

        console.log(this.tbSelectedRows);
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
      },
    });
  }

  // Delete selection from group
  ungroupSelection() {
    let groupId = this.ungroupSelect.value;

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
      },
    });
    this.ungroupSelect.setValue('');
  }

  // Change normal view to group selected view}
  modifyTableView(modifyById: string) {
    let modifyLastElmActive = document.getElementsByClassName(
      'button-neumorphism-active'
    );

    while (modifyLastElmActive.length > 0) {
      modifyLastElmActive[0].classList.remove('button-neumorphism-active');
    }

    document
      .getElementById(modifyById)
      ?.classList.add('button-neumorphism-active');

    this.modifyTable = modifyById;

    console.log(document.getElementById(modifyById));
  }

  log = (data: any) => console.log(data);

  // Address type
  toggleModifyAddressForm(addressName: any) {
    this.addressForm = new FormGroup({
      slcCountry: new FormControl('US', [
        Validators.required,
        Validators.minLength(1),
      ]),
      slcState: new FormControl('', [
        Validators.required,
        Validators.minLength(1),
      ]),
      txtCity: new FormControl('', [
        Validators.required,
        Validators.minLength(1),
      ]),
      txtStreet: new FormControl('', [
        Validators.required,
        Validators.minLength(1),
      ]),
      txtApt: new FormControl(''),
      txtZip: new FormControl('', [
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
    // this.dataService.getFormCity().subscribe(

    //     (response) => {
    // this.selectedCountryCode = this.addressForm.get('slcCountry')!.value

    //         this.cities = response.data.filter((i: any) => i.iso2.includes(this.selectedCountryCode))
    //         for (let a of this.cities) {
    //             this.cities = a.cities.map((value: any, i: any) => ({ id: i, name: value }))
    //         }
    //         console.log(this.cities)

    //     },

    //     (error) => {
    //         console.error(error);
    //     }

    // );
    this.DataService.getFormState().subscribe(
      (response) => {
        this.selectedCountryCode = this.addressForm.get('slcCountry')!.value;
        this.states = response.data.filter((i: any) =>
          i.iso2.includes(this.selectedCountryCode)
        );

        for (let i of this.states) {
          this.states = i.states;
        }
        console.log(this.states);
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

    this.addressInputsForm.patchValue({
      [this.addressFieldName]: newAddres,
    });

    this.tglModifyAddressForm = false;
    this.messageService.add({
      severity: 'success',
      summary: 'Service Message',
      detail: 'Address was added successfully. Please save changes.',
    });
  }
}

function subscribe(arg0: (data: any) => void) {
  throw new Error('Function not implemented.');
}
