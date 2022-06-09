import { Component , ViewChild} from '@angular/core';
// Get table data
import { DataService } from '../../services/services.service';
// PrimeNG
import { ConfirmationService } from 'primeng/api';
import { MessageService } from 'primeng/api';
import { PrimeNGConfig } from "primeng/api";
import {Table} from 'primeng/table';

@Component({

    selector: 'table-component',
    templateUrl: './table.component.html',
    styleUrls: ['./table.component.css',
        '../../css/neumorphism.component.css'],
    providers: [MessageService]

})

export class TableComponent {

    
    public thData: any;
    public tdData: any;
    public selectedRows: any = [];
    public toggleMenuTable: boolean = false;
    public toggleRowMenuTable: boolean = false;
    public messageDanger: string = ""

    constructor(private DataService: DataService, private messageService: MessageService, private confirmationService: ConfirmationService, private primengConfig: PrimeNGConfig) { }

    ngOnInit() {
        
        this.primengConfig.ripple = true;
        this.DataService.getTableData().subscribe(
            response => {

                this.thData = response.table_th
                this.tdData = response.table_td

                var slIndex = 0
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

    toggleMenu(){
        this.toggleMenuTable = ! this.toggleMenuTable
    }
    toggleRowMenu(){
        this.toggleRowMenuTable = ! this.toggleRowMenuTable
    }

    deleteSelectedRows() {

        if(this.tdData.length > 0){
            this.confirmationService.confirm({
                message: 'Are you sure you want to delete this selection?',
                header: 'Confirm',
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    this.tdData = this.tdData.filter((val: any) => !this.selectedRows.includes(val));
                    this.selectedRows = [];
                    this.messageService.add({ severity: 'success', summary: 'Successful', detail: 'Rows Deleted', life: 3000 });
                }
            });
        }else{
            this.messageDanger = "Please select a row down below."
            console.log(this.tdData)

        }

        
    }


}
