import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { DataService } from '../../services/services.service';
import { UsersService } from '../../services/auth.service';
import { MessageService } from 'primeng/api';
import { ConfirmationService } from 'primeng/api';
@Component({
  selector: 'form-component',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css', '../../css/neumorphism.component.css'],
})
export class FormComponent implements OnInit {
  @Input() dialSessionArray: any;
  @Input() activeTemplate: any;

  public currentCall: any;

  public formElement: any;
  //public activeTemplate: any;
  public dbObjKey: any;

  public tgleditField: boolean = false;

  public callDataForm!: FormGroup;
  public newFormControl: any = {};
  public newField: any;

  public tglModifyAddressForm: boolean = false;
  public addressForm!: FormGroup;
  public addressFieldId: string = '';
  public addressFieldName: string = '';

  public countries: any;
  public selectedCountryCode: string = 'US';
  public cities: any;
  public selectedCityCode: string = '';
  public states: any;
  public selectedStateCode: string = '';

  public onValidationMsg: string = '';
  public tglEditLayout: boolean = false;

  public filterGroupList: any;
  public tbGroups: any;
  public userInfo: any;
  public groupSelected = new FormControl();
  public tbGroupActive: any = [];
  public defaultGroup: boolean = true;
  public tglChangeCustomerStatus: boolean = false;
  public customerNewStatus = new FormControl('');
  public optCustomerStatus: any;
  public customerStatus: any;
  constructor(
    private dataService: DataService,
    private usersService: UsersService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.formElement = this.activeTemplate;

    this.dataService.currentCall.subscribe((currentCall) => {
      this.currentCall = currentCall;
      if (this.currentCall) {
        this.currentCall['customerStatus'] = [
          {
            slStatusId: '0',
            label: 'No attention required',
            background: '#e6e7ee',
            color: '#333',
            function: '',
          },
        ];
        this.customerStatus = this.currentCall['customerStatus'];
      }

      for (let fieldName in this.currentCall) {
        for (let fieldValue of this.formElement) {
          if (fieldName === fieldValue.element_table_value) {
            fieldValue.element_value = this.currentCall[fieldName];

            this.newFormControl[fieldValue.element_table_value] =
              new FormControl(
                {
                  value: fieldValue.element_value,
                  disabled: this.tgleditField,
                },
                [Validators.required, Validators.minLength(1)]
              );
            this.newFormControl['customerStatus'] = new FormControl('Pending', [
              Validators.required,
              Validators.minLength(1),
            ]);
            this.callDataForm = new FormGroup(this.newFormControl);
          }
        }
      }
    });

    this.dataService.getCustomerGroups().subscribe((data: any[]) => {
      this.tbGroups = data;

      this.usersService.userInfo.subscribe((userInfo: any) => {
        if (userInfo) {
          this.tbGroupActive = [];
          userInfo.activeGroup.forEach((group: any) => {
            console.log(group);
            let groupSelected = data.filter((v: any) => v.group_id === group);
            let groupId = '';
            let groupName = '';
            groupSelected.forEach((e: any) => {
              groupId = e.group_id;
              groupName = e.group_name;
            });
            this.tbGroupActive.push({
              group_id: groupId,
              group_name: groupName,
            });
          });
        }
      });
    });
    this.dataService.getSelectData().subscribe(
      (response) => {
        this.optCustomerStatus = response.selectCXStatus;
      },

      (error) => {
        console.error(error);
      }
    );
  }

  getGroupSelected() {
    let groupSelected = this.tbGroups.filter(
      (v: any) => v.group_id === this.groupSelected.value
    );

    console.log(this.groupSelected.value);
    this.dataService.selectActiveGroup(this.groupSelected.value);

    this.defaultGroup = false;
    // Show only one group
    // this.tbGroupActive = groupSelected

    // Show multiples groups
    let groupId = '';
    let groupName = '';
    groupSelected.forEach((e: any) => {
      groupId = e.group_id;
      groupName = e.group_name;
    });

    this.tbGroupActive.push({ group_id: groupId, group_name: groupName });

    this.messageService.add({
      severity: 'success',
      summary: 'Service Message',
      detail: 'Group "' + groupName + '" was added to calling.',
    });
  }

  removeGroupSelected(groupId: string) {
    this.tbGroupActive = this.tbGroupActive.filter(
      (v: any) => v.group_id !== groupId
    );

    console.log(groupId);
    this.dataService.removeActiveGroup(groupId);

    this.tbGroupActive.length > 0
      ? (this.defaultGroup = false)
      : (this.defaultGroup = true);

    this.messageService.add({
      severity: 'success',
      summary: 'Service Message',
      detail: 'Group was removed from calling.',
    });
  }

  toggleEditFields() {
    this.tgleditField = !this.tgleditField;
    console.log(this.callDataForm.value);
  }

  toggleModifyAddressForm(addressId: any, addressName: any) {
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

    this.addressFieldId = addressId;
    this.addressFieldName = addressName;

    this.tglModifyAddressForm = true;
    this.dataService.getFormCountry().subscribe(
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
    this.dataService.getFormState().subscribe(
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

    this.callDataForm.patchValue({
      [this.addressFieldName]: newAddres,
    });
    // this.formElement[this.addressFieldId]['element_value'] = newAddres;

    this.tglModifyAddressForm = false;
    console.log(this.formElement);
    this.messageService.add({
      severity: 'success',
      summary: 'Service Message',
      detail: 'Address was added successfully.',
    });
  }

  cancelEditFields() {
    for (let i of this.formElement) {
      this.callDataForm.patchValue({
        [i.element_placeholder]: i.element_value,
      });
    }
    this.tgleditField = false;
  }

  saveEditFields() {
    this.callDataForm.value.uid = this.currentCall.uid;
    this.tgleditField = false;
    this.dataService.editCustomer(this.callDataForm.value);
  }

  groupFilter(array: any, searching: any): void {
    this.filterGroupList = array.filter((i: any) =>
      i.group_name.toLowerCase().includes(searching.toLowerCase())
    );
    console.log(this.filterGroupList);
  }

  log(val: any) {
    console.log(val);
  }

  toggleCustomerStatus() {
    this.tglChangeCustomerStatus = !this.tglChangeCustomerStatus;

    document.getElementById('btnCustomerStatus')?.classList.toggle('hide-line');
    document.getElementById('btnCancelStatus')?.classList.toggle('hide-line');
    document.getElementById('customerStatus')?.classList.toggle('hide-line');
  }

  changeCustomerStatus(oldStatus: any, customerName: any) {
    let value = this.customerNewStatus.value;
    let newStatus = this.optCustomerStatus.filter(
      (a: any, i: any) => a.slStatusId == value
    );
    let newStatusName = newStatus[0]['label'];
    console.log();
    if (oldStatus !== value) {
      this.confirmationService.confirm({
        message:
          'Are you sure you want to set the status of <b>' +
          customerName +
          '</b> as "' +
          newStatusName +
          '"?',
        header: 'Warning',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
          this.tglChangeCustomerStatus = false;
          document
            .getElementById('btnCustomerStatus')
            ?.classList.toggle('hide-line');
          document
            .getElementById('customerStatus')
            ?.classList.toggle('hide-line');
          document
            .getElementById('btnCancelStatus')
            ?.classList.toggle('hide-line');
          this.customerNewStatus.setValue('');
          this.currentCall['customerStatus'] = newStatus;
          this.customerStatus = newStatus;

          console.log(this.currentCall);
          this.messageService.add({
            severity: 'success',
            summary: 'Service Message',
            detail:
              customerName + ' status was set to "' + newStatusName + '".',
          });
        },
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Service Message',
        detail:
          customerName +
          ' status was already set to "' +
          newStatusName +
          '" before.',
      });
    }
  }
}
