import { Component, OnInit, ViewChild } from '@angular/core';
import { DataService } from '../../services/services.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
export interface tableData {

  name: string;
  mrn: string;
  dob: string;
  tier: number;
  prior_contact: string;
  pending: string;

}
const tableData: tableData[] = [

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

  selector: 'table-component',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.css',
    '../../css/neumorphism.component.css',]

})

export class TableComponent implements OnInit{

  constructor(private DataService: DataService) { }
  public jsonData: any;
  public dataSource: any;
  //public displayedColumns: any;

  ngOnInit() {
      
    this.DataService.getTableData().subscribe(
        response => {
          this.jsonData = response
          this.dataSource = new MatTableDataSource(this.jsonData.table_td)
          //this.displayedColumns = (this.jsonData.table_th)
          //.map((c:any) => c.columnDef)

        },
        error => {
          console.log(error)
        }
    )


  }

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit() {

    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

  }

  // displayedColumns: string[] = ['name', 'mrn', 'dob', 'tier', 'prior_contact', 'pending'];

  applyFilter(event: Event) {

    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

  }

  columns = [
    {
      columnDef: 'name',
      header: 'Name',
      cell: (tableCell: tableData) => `${tableCell.name}`,
    },
    {
      columnDef: 'mrn',
      header: 'MRN',
      cell: (tableCell: tableData) => `${tableCell.mrn}`,
    },
    {
      columnDef: 'dob',
      header: 'DOB',
      cell: (tableCell: tableData) => `${tableCell.dob}`,
    },
    {
      columnDef: 'tier',
      header: 'Tier',
      cell: (tableCell: tableData) => `${tableCell.tier}`,
    },
    {
      columnDef: 'prior_contact',
      header: 'Prior_contact',
      cell: (tableCell: tableData) => `${tableCell.prior_contact}`,
    },
    {
      columnDef: 'pending',
      header: 'Pending',
      cell: (tableCell: tableData) => `${tableCell.pending}`,
    },
  ];
  
  displayedColumns = this.columns.map(c => c.columnDef);

}
