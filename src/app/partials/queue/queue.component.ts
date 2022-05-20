import { Component, OnInit  } from '@angular/core';
import { DataService } from '../../services/services.service';
import { MatTableDataSource } from '@angular/material/table';
export interface queueTab {
  name: string;
  mrn: string;
  dob: string;
  tier: number;
  prior_contact: string;
  pending: string;

}
const ELEMENT_DATA: queueTab[] = [
  { name: 'A , E', mrn: 'JUKqmaRb30apP9ma-zCCZg', dob: "19/12/2000", tier: 3, prior_contact: "No", pending: "No" },
  { name: 'B , D', mrn: 'JUKqmaRb30apP9ma-zCCZg', dob: "19/12/2000", tier: 3, prior_contact: "No", pending: "No" },
  { name: 'C , C', mrn: 'JUKqmaRb30apP9ma-zCCZg', dob: "19/12/2000", tier: 3, prior_contact: "No", pending: "No" },
  { name: 'D , B', mrn: 'JUKqmaRb30apP9ma-zCCZg', dob: "19/12/2000", tier: 3, prior_contact: "No", pending: "No" },
  { name: 'E , A', mrn: 'JUKqmaRb30apP9ma-zCCZg', dob: "19/12/2000", tier: 3, prior_contact: "No", pending: "No" },
];

@Component({

    selector: 'queue',
    templateUrl: './queue.component.html',
    styleUrls: ['./queue.component.css']

})



export class QueueComponent  {

    public table_th: any;
    public table_td: any;

  
    constructor(private DataService: DataService) { }

    ngOnInit() {

        this.DataService.getQueueData().subscribe(

            response => {

                this.table_th = response.table_th
                this.table_td = response.table_td


            },
            error => {
                console.log(error)
            }
        )

      }


    displayedColumns: string[] = ['name', 'mrn', 'dob', 'tier', 'prior_contact', 'pending'];
    dataSource = new MatTableDataSource(ELEMENT_DATA);
  
    applyFilter(event: Event) {
      const filterValue = (event.target as HTMLInputElement).value;
      this.dataSource.filter = filterValue.trim().toLowerCase();
    }


  }
