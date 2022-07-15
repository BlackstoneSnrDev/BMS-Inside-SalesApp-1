import { Component, ViewChild } from '@angular/core';
// Get table data
import { DataService } from '../../services/services.service';
// User Info
import { UsersService } from "../../services/auth.service";
// PrimeNG
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { PrimeNGConfig } from "primeng/api";
import { Table } from 'primeng/table';
import { FormGroup, FormControl, Validators } from '@angular/forms';

@Component({

    selector: 'table-component',
    templateUrl: './table.component.html',
    styleUrls: ['./table.component.css',
        '../../css/neumorphism.component.css'],
    providers: [MessageService]

})

export class TableComponent {

    public userInfo: any;

    public thData: any = null;
    public thDataLength: number = 0

    public tdData: any = [];
    public clonedtdData: any = {};
    public modifyTable: string = 'all'

    public tbSelectedRows: any = [];

    public tbGroups: any;
    public tbGroupsLength: number = 0;
    public clearInput: any

    public tglUploadList: boolean = false;
    public tglCreateNewGroup: boolean = false;
    public tglMenuTable: boolean = false;
    public tglAddNewRecord: boolean = false;
    public tglGroupMenu: boolean = false;

    public addNewRecordForm!: FormGroup;
    public newFormControl: any = {};
    public onValidationError: string = "";
    public onValidationMsg: string = "";
    //public checked: boolean = false;

    // Address type
    public tglModifyAddressForm: boolean = false;
    public addressForm!: FormGroup
    public addressInputsForm!: FormGroup
    public tgleditField: boolean = false;
    public countries: any;
    public states: any;
    public addressFieldId: string = '';
    public addressFieldName: string = '';
    public selectedCountryCode: string = 'US';
    public selectedStateCode: string = '';

    constructor(private DataService: DataService, private UsersService: UsersService, private confirmationService: ConfirmationService, private primengConfig: PrimeNGConfig) { }

    ngOnInit() {

        this.primengConfig.ripple = false;
        this.UsersService.userInfo.subscribe(userInfo => this.userInfo = userInfo);
        console.log(this.userInfo)
        //this.DataService.populateTemplateWithCustomers();
        this.addressInputsForm = new FormGroup({});

        this.DataService.getTableCustomerHeader()
            .then(data => {
                this.thData = data.sort((a, b) => a.element_order - b.element_order)
            }).then(() => {
                this.DataService.getTableData().subscribe(data => { 
                    this.tdData = data
                    this.tdData.forEach((element: any, index: number) => {
                        this.tdData[index]["slIndex"] = index;
                    })
                 })
            }).then(() => {
                this.thDataLength = this.thData.length
            }).then(() => {
                this.DataService.getCustomerGroups().subscribe(data => {
                    this.tbGroups = data,
                    this.tbGroupsLength = data.length
                })
            }).then(() => {
                for (let i of this.thData) {
                    this.newFormControl[i.field] = new FormControl('', [Validators.required, Validators.minLength(1)]);
                }
                this.addNewRecordForm = new FormGroup(this.newFormControl);
            },
                error => {
                    console.error(error)
                }
            )


    }

    toggleUploadList() {

        this.tglUploadList = !this.tglUploadList

    }

    getFileUploaded(event: Event) {

        console.log(event)
    }

    @ViewChild('dataTable') table!: Table;

    clear(table: Table) {

        table.clear();
        this.modifyTable = 'all'
        this.tbSelectedRows = [];
        this.clearInput = ""

        let modifyLastElmActive = document.getElementsByClassName("button-neumorphism-active");
        while (modifyLastElmActive.length > 0) {
            modifyLastElmActive[0].classList.remove('button-neumorphism-active');
        }
        table.filterGlobal('', 'contains')

        this.onValidationMsg = "Table was restored.";
        setTimeout(() => {
            this.onValidationMsg = "";
        }, 2000);
    }

    // Table on row CRUD
    onRowEditInit(tdData: any, id: number) {

        this.addressInputsForm.addControl('addressTableField' + id, new FormControl('', [Validators.required, Validators.minLength(1)]));
        this.clonedtdData[tdData.id] = { ...tdData };
           
    }

    onRowEditSave(tdData: any, index: number) {

        console.log(tdData, index)

        let modifyLastElmActive = (document.getElementById('tr' + index) as HTMLInputElement).getElementsByClassName('ng-invalid')

        if (modifyLastElmActive.length > 0) {
            this.onValidationError = '*All fields must be filled out.'
        } else {
            this.DataService.editCustomer(tdData);

        }
    }

    onRowEditCancel(tdData: any, index: number) {

        this.tdData[index] = this.clonedtdData[tdData.id];
        delete this.tdData[tdData.id];

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
        console.log(this.addNewRecordForm);
        this.tglAddNewRecord = !this.tglAddNewRecord
    }

    saveAddNewRecord(table: Table) {

        let value = this.addNewRecordForm.value;
        value['group'] = []
        this.DataService.addNewRecord(value);

        this.addNewRecordForm.reset();

        this.onValidationMsg = 'New record was added successfully.'
        setTimeout(() => {
            this.onValidationMsg = "";
        }, 5000);

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

                    this.onValidationMsg = this.tbSelectedRows.length + ' records were deleted successfully.'
                    setTimeout(() => {
                        this.onValidationMsg = "";
                    }, 2000);
                    this.tbSelectedRows = [];

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

        } else {

            let rowUidArray: any[] = []
            this.tbSelectedRows.map((row: any) => {
                rowUidArray.push(row.uid)
            })
            
            this.DataService.createNewCustomerGroup(groupName, rowUidArray);

            this.onValidationMsg = 'New group was created as "' + groupName + '" successfully.'
            setTimeout(() => {
                this.onValidationMsg = "";
            }, 2000);

            this.tglCreateNewGroup = false
            this.clearInput = ""
            this.onValidationError = ""

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

    deleteGroup(groupId: any, groupName: string) {

        this.confirmationService.confirm({
            message: 'Are you sure you want to delete "<b>' + groupName + '</b>"?',
            header: 'Deleting group',
            accept: () => {

                    this.DataService.deleteCustomerGroup(groupId);

                    this.modifyTable = 'all'
                    this.onValidationMsg = '"' + groupName + '" was deleted successfully.'
                    setTimeout(() => {
                        this.onValidationMsg = "";
                    }, 2000);

                }
            });

        this.onValidationError = ""
        this.clearInput = ""

    }

    // Add selection to group
    addToExistingGroup(groupId: any) {
        this.clearInput = ""

        this.confirmationService.confirm({
            message: 'Are you sure you want to group <b>' + this.tbSelectedRows.length + '</b> records?',
            header: 'Grouping records',
            accept: () => {

                let rowUidArray: any[] = []
                this.tbSelectedRows.map((row: any) => {
                    rowUidArray.push(row.uid)
                })
                this.DataService.addToExistingCustomerGroup(groupId, rowUidArray);

                let groupIndex = this.tbGroups.findIndex((i: any) => i.group_id === groupId)
                let groupName = this.tbGroups[groupIndex]["group_name"]

                this.onValidationMsg = 'Records were added to "' + groupName + '" successfully.'
                setTimeout(() => {
                    this.onValidationMsg = "";
                }, 2000);

                this.clearInput = ""
            }
        });

        this.clearInput = ""
    }

    // Delete selection from group
    ungroupSelection(groupId: any, event: string) {

        let groupIndex = this.tbGroups.findIndex((i: any) => i.group_id === groupId)
        if (event === 'deleteGroup') {

            for (let i = 0; i < this.tdData.length; i++) {

                let groupIndex = this.tdData[i].group.findIndex((i: any) => i === groupId)
                this.tdData[i].group.splice(groupIndex, 1);

            }

        } else {

            this.confirmationService.confirm({
                message: 'Are you sure you want to ungroup <b>' + this.tbSelectedRows.length + '</b> records?',
                header: 'Ungrouping records',
                accept: () => {

                    let groupName = this.tbGroups[groupIndex]["group_name"]

                    let rowUidArray: any[] = []
                    this.tbSelectedRows.map((row: any) => {
                        rowUidArray.push(row.uid)
                    })
                    this.DataService.removeFromCustomerGroup(groupId, rowUidArray);

                    this.modifyTable = 'all'
                    let modifyLastElmActive = document.getElementsByClassName("button-neumorphism-active");
                    while (modifyLastElmActive.length > 0) {
                        modifyLastElmActive[0].classList.remove('button-neumorphism-active');
                    }

                    this.onValidationMsg = '"' + this.tbSelectedRows.length + '" were removed from "' + groupName + '" successfully.'
                    setTimeout(() => {
                        this.onValidationMsg = "";
                    }, 2000);

                    console.log(this.tdData)

                }
            });
        }

        this.clearInput = ""
        console.log(this.tdData)

    }

    // Change normal view to group selected view}
    modifyTableView(modifyBy: string, event: Event) {

        let modifyLastElmActive = document.getElementsByClassName("button-neumorphism-active");
        while (modifyLastElmActive.length > 0) {
            modifyLastElmActive[0].classList.remove('button-neumorphism-active');
        }

        let setActiveElm = (event.target as HTMLInputElement).classList.toggle("button-neumorphism-active");

        this.modifyTable = modifyBy

    }

    log = (data: any) => console.log(data);

    // Address type

    toggleEditFields() {

        this.tgleditField = !this.tgleditField;

    }

    toggleModifyAddressForm(addressId: any, addressName: any) {

        this.addressForm = new FormGroup({
            slcCountry: new FormControl('US', [Validators.required, Validators.minLength(1)]),
            slcState: new FormControl('', [Validators.required, Validators.minLength(1)]),
            txtCity: new FormControl('', [Validators.required, Validators.minLength(1)]),
            txtStreet: new FormControl('', [Validators.required, Validators.minLength(1)]),
            txtApt: new FormControl(''),
            txtZip: new FormControl('', [Validators.required, Validators.minLength(1)]),
        })

        this.addressFieldId = addressId
        this.addressFieldName = addressName

        this.tglModifyAddressForm = true
        this.DataService.getFormCountry().subscribe(

            (response) => {

                this.countries = response.data
                this.getCountryInfo()
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
                
                this.selectedCountryCode = this.addressForm.get('slcCountry')!.value
                this.states = response.data.filter((i: any) => i.iso2.includes(this.selectedCountryCode))

                for (let i of this.states) {
                    this.states = i.states
                }
                console.log(this.states)

            },

            (error) => {
                console.error(error);
            }

        );
    }

saveAddressModified(city: string, street: string, apt: string, zip: string) {

    this.selectedStateCode = this.addressForm.get('slcState')!.value

    this.onValidationMsg = "Address was added successfully.";
    setTimeout(() => {
        this.onValidationMsg = "";
    }, 6000);

    let newAddres
    if (apt) {
        newAddres = this.selectedCountryCode + ', ' + this.selectedStateCode + ', ' + city + ', ' + street + ', ' + apt + ', ' + zip
    } else {
        newAddres = this.selectedCountryCode + ', ' + this.selectedStateCode + ', ' + city + ', ' + street + ', ' + zip
    }

    console.log(this.addressFieldName)
    console.log(newAddres)
    
    this.addressInputsForm.patchValue({
        [this.addressFieldName]: newAddres
    });

    this.tglModifyAddressForm = false
    // console.log(this.formElement)
}

}

function subscribe(arg0: (data: any) => void) {
    throw new Error('Function not implemented.');
}


