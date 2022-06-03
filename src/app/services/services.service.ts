import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'

@Injectable({

  providedIn: 'root'

})

export class DataService {

  public navbarDataURL: string;
  public formElementsURL: string;
  public callhistoryURL: string;
  public logURL: string;
  public tableDataURL: string;

  constructor(

    private _http: HttpClient

  ){

    this.navbarDataURL = "../../assets/json/navbar-data.json";
    this.formElementsURL = "../../assets/json/form-elements.json";
    this.callhistoryURL = "../../assets/json/call-flow.json";
    this.logURL = "../../assets/json/log-data.json";
    this.tableDataURL = "../../assets/json/queueTable-data.json";

  }

  getNavbarData(): Observable<any>{

    return this._http.get(this.navbarDataURL);

  }

  getFormElementsData(): Observable<any>{

    return this._http.get(this.formElementsURL);

  }

  getLogData(): Observable<any>{

    return this._http.get(this.logURL);

  }

  getCallHistoryData(): Observable<any>{

    return this._http.get(this.callhistoryURL);

  }

  getTableData(): Observable<any>{

    return this._http.get(this.tableDataURL);

  }
}