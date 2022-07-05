import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/services.service';
import { UsersService } from "../../services/auth.service";


@Component({
    selector: 'app-admin-template',
    templateUrl: './admin-template.component.html',
    styleUrls: ['./admin-template.component.css', '../../css/neumorphism.component.css', '../../components/table/table.component.css']
})
export class AdminTemplateComponent implements OnInit {

    public dbObjKey: any;
    public userInfo: any;
    public allTemplates: any;

    public tdData: any;
    public thData: any;
    public clonedElements: any = {};
    public selectElmType: any;

    public tbSelectedRows: any;
    public onValidationError: string = "";
    public selectedType: string = "";
    constructor(private dataService: DataService, private usersService: UsersService) { }

    ngOnInit() {

        this.usersService.userInfo.subscribe(

            (response) => {

                this.userInfo = response

            },

            (error) => {
                console.error(error);
            }

        );

        this.dataService.getAllTemplates().subscribe(

            (response) => {

                this.thData = [{
                    "title": "Name",
                    "field": "name",
                    "element_type": "text"
                }, {
                    "title": "Type",
                    "field": "type",
                    "element_type": "text"
                }, {
                    "title": "Visible",
                    "field": "visible",
                    "element_type": "boolean"
                }];

                this.allTemplates = response
                let tdData: any = [];
                let slIndex: number = 0;
                for (const [index, value] of this.allTemplates.entries()) {

                    tdData.push({ 'templateName': value.templateName, 'templateStatus': value.active, 'templateFields': [] });

                    for (const templateData in value) {
                        if (value[templateData]['element_placeholder'] !== undefined) {
                            slIndex += 1

                            tdData[index]['templateFields'].push({ 'name': value[templateData]['element_placeholder'], 'type': value[templateData]['element_type'], 'visible': value[templateData]['showWhileCalling'], 'slIndex': slIndex - 1 })

                        }
                    }

                }

                this.tdData = tdData

                this.selectElmType = [{
                    "typeName": "False / True",
                    "typeCode": "boolean"
                }, {
                    "typeName": "Address",
                    "typeCode": "address"
                }, {
                    "typeName": "Text",
                    "typeCode": "text"
                }, {
                    "typeName": "Number",
                    "typeCode": "number"
                }, {
                    "typeName": "Date",
                    "typeCode": "date"
                }];
            },

            (error) => {
                console.error(error);
            }

        );
    }

    templateSelected(template: string) {
        this.dataService.changeSelectedTemplate(template)
    }

    log(val: any) { console.log(val); }

    // Table on row CRUD
    onRowEditInit(tdData: any, id: number) {
        this.clonedElements[tdData.id] = { ...tdData };
    }

    onRowEditSave(rowTdData: any, indexElm: number, indexTemplate: any) {

        let modifyLastElmActive = (document.getElementById('tr' + indexElm) as HTMLInputElement).getElementsByClassName('ng-invalid')

        if (modifyLastElmActive.length > 0) {
            this.onValidationError = '*All fields must be filled out.'
        } else {
            for (const [index, value] of this.tdData.entries()) {
                if (index == indexTemplate) {

                    value.templateFields[indexElm] = value['templateFields'][indexElm] = rowTdData

                }
            }
            delete this.clonedElements[rowTdData.id];
            console.log(this.tdData)
        }
    }

    onRowEditCancel(rowTdData: any, index: number) {

        for (const tdData of this.tdData) {
            tdData.templateFields[index] = this.clonedElements[rowTdData.id];
            delete tdData.templateFields[rowTdData.id];
        }
        console.log(this.tdData)

    }

    onRowDeleteRow(id: any, indexTemplate: any) {

        for (const [index, value] of this.tdData.entries()) {

            if (index == indexTemplate) {

                // NEEDS TO BE FIXED
                value.templateFields = value.templateFields.filter((i: any) => ![id].includes(i.slIndex))

            }

        }
        console.log(this.tdData)
    }

}
