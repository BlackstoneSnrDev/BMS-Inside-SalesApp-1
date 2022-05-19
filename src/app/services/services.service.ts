import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'

@Injectable({

  providedIn: 'root'

})

export class DataService {

  public sidebardataURL: string;
  public formURL: string;
  public callhistoryURL: string;
  public historialURL: string;

  constructor(

    private _http: HttpClient

  ){

    this.sidebardataURL = "../../assets/json/sidebar-data.json";
    this.formURL = "../../assets/json/form-data.json";
    this.callhistoryURL = "../../assets/json/call-flow.json";
    this.historialURL = "../../assets/json/historial-data.json";

  }

  getSidebarData(): Observable<any>{

    return this._http.get(this.sidebardataURL);

  }

  getFormData(): Observable<any>{

    return this._http.get(this.formURL);

  }

  getHistorialData(): Observable<any>{

    return this._http.get(this.historialURL);

  }

  getCallHistoryData(): Observable<any>{

    return this._http.get(this.callhistoryURL);

  }
}