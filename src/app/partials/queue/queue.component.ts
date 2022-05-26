import { Component, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../../services/services.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
export interface queueTab {

  name: string;
  mrn: string;
  dob: string;
  tier: number;
  prior_contact: string;
  pending: string;

}
const queueData: queueTab[] = [

  { name: 'A , E', mrn: 'JUKqmaRb30apP9ma-zCCZg', dob: "19/12/2000", tier: 3, prior_contact: "No", pending: "No" },
  { name: 'B , D', mrn: 'JUKqmaRb30apP9ma-zCCZg', dob: "19/12/2000", tier: 3, prior_contact: "No", pending: "No" },
  { name: 'C , C', mrn: 'JUKqmaRb30apP9ma-zCCZg', dob: "19/12/2000", tier: 3, prior_contact: "No", pending: "No" },
  { name: 'D , B', mrn: 'JUKqmaRb30apP9ma-zCCZg', dob: "19/12/2000", tier: 3, prior_contact: "No", pending: "No" },
  { name: 'E , A', mrn: 'JUKqmaRb30apP9ma-zCCZg', dob: "19/12/2000", tier: 3, prior_contact: "No", pending: "No" },
  { name: 'A , E', mrn: 'JUKqmaRb30apP9ma-zCCZg', dob: "19/12/2000", tier: 3, prior_contact: "No", pending: "No" },
  { name: 'B , D', mrn: 'JUKqmaRb30apP9ma-zCCZg', dob: "19/12/2000", tier: 3, prior_contact: "No", pending: "No" },
  { name: 'C , C', mrn: 'JUKqmaRb30apP9ma-zCCZg', dob: "19/12/2000", tier: 3, prior_contact: "No", pending: "No" },
  { name: 'D , B', mrn: 'DFG-zCCZg', dob: "19/12/2000", tier: 3, prior_contact: "No", pending: "No" },
  { name: 'E , A', mrn: 'JUKqmaRb30apP9ma-zCCZg', dob: "19/12/2000", tier: 3, prior_contact: "No", pending: "No" },
  { name: 'A , E', mrn: 'DFG-zCCZg', dob: "19/12/2000", tier: 3, prior_contact: "No", pending: "No" },
  { name: 'B , D', mrn: 'JUKqmaRb30apP9ma-zCCZg', dob: "19/12/2000", tier: 3, prior_contact: "No", pending: "No" },
  { name: 'C , C', mrn: 'JUKqmaRb30apP9ma-zCCZg', dob: "19/12/2000", tier: 3, prior_contact: "No", pending: "No" },
  { name: 'D , B', mrn: 'DFGDFHDFH-zCCZg', dob: "19/12/2000", tier: 3, prior_contact: "No", pending: "No" },
  { name: 'E , A', mrn: 'JUKqmaRb30apP9ma-zCCZg', dob: "19/12/2000", tier: 3, prior_contact: "No", pending: "No" },
  { name: 'A , E', mrn: 'JUKqmaRb30apP9ma-zCCZg', dob: "19/12/2000", tier: 3, prior_contact: "No", pending: "No" },
  { name: 'B , D', mrn: 'DFG-zCCZg', dob: "19/12/2000", tier: 3, prior_contact: "No", pending: "No" },
  { name: 'C , C', mrn: 'JUKqmaRb30apP9ma-zCCZg', dob: "19/12/2000", tier: 3, prior_contact: "No", pending: "No" },
  { name: 'D , B', mrn: 'JUKqmaRb3DFGHDF0apP9ma-zCCZg', dob: "19/12/2000", tier: 3, prior_contact: "No", pending: "No" },
  { name: 'E , A', mrn: 'JUKqmaRb30apP9ma-zCCZg', dob: "19/12/2000", tier: 3, prior_contact: "No", pending: "No" },
  { name: 'A , E', mrn: 'JUKqmaRb30apP9ma-zCCZg', dob: "19/12/2000", tier: 3, prior_contact: "No", pending: "No" },
  { name: 'B , D', mrn: 'JUKqmaRb30apP9ma-zCCZg', dob: "19/12/2000", tier: 3, prior_contact: "No", pending: "No" },
  { name: 'C , C', mrn: 'Y-zCCZg', dob: "19/12/2000", tier: 3, prior_contact: "No", pending: "No" },
  { name: 'D , B', mrn: 'JUKqmaRb30apP9ma-zCCZg', dob: "19/12/2000", tier: 3, prior_contact: "No", pending: "No" },
  { name: 'E , A', mrn: 'DFG-zCCZg', dob: "19/12/2000", tier: 3, prior_contact: "No", pending: "No" },
  { name: 'A , E', mrn: 'JUKqmaRb30apP9ma-zCCZg', dob: "19/12/2000", tier: 3, prior_contact: "No", pending: "No" },
  { name: 'B , D', mrn: 'JUKqmaRb30apP9ma-zCCZg', dob: "19/12/2000", tier: 3, prior_contact: "No", pending: "No" },
  { name: 'C , C', mrn: 'FGD-zCCZg', dob: "19/12/2000", tier: 3, prior_contact: "No", pending: "No" },
  { name: 'D , B', mrn: 'JUKqmaRb30apP9ma-zCCZg', dob: "19/12/2000", tier: 3, prior_contact: "No", pending: "No" },
  { name: 'E , A', mrn: 'final-zCCZg', dob: "19/12/2000", tier: 3, prior_contact: "No", pending: "No" }

];

@Component({

  selector: 'queue',
  templateUrl: './queue.component.html',
  styleUrls: ['./queue.component.css',
    '../../css/neumorphism.component.css',]

})

export class QueueComponent {

  constructor(private DataService: DataService) { }

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit() {

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

  }

  // displayedColumns: string[] = ['name', 'mrn', 'dob', 'tier', 'prior_contact', 'pending'];
  dataSource = new MatTableDataSource(queueData);

  applyFilter(event: Event) {

    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

  }

  columns = [
    {
      columnDef: 'name',
      header: 'Name',
      cell: (element: queueTab) => `${element.name}`,
    },
    {
      columnDef: 'mrn',
      header: 'MRN',
      cell: (element: queueTab) => `${element.mrn}`,
    },
    {
      columnDef: 'dob',
      header: 'DOB',
      cell: (element: queueTab) => `${element.dob}`,
    },
    {
      columnDef: 'tier',
      header: 'Tier',
      cell: (element: queueTab) => `${element.tier}`,
    },
    {
      columnDef: 'prior_contact',
      header: 'Prior_contact',
      cell: (element: queueTab) => `${element.prior_contact}`,
    },
    {
      columnDef: 'pending',
      header: 'Pending',
      cell: (element: queueTab) => `${element.pending}`,
    },
  ];
  
  displayedColumns = this.columns.map(c => c.columnDef);

}
