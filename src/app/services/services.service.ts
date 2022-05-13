import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs'

@Injectable({

  providedIn: 'root'

})

export class DataService {

  public sidebardataURL: string;
  public formURL: string;

  constructor(

    private _http: HttpClient

  ){

    this.sidebardataURL = "../../assets/json/sidebar-data.json";
    this.formURL = "../../assets/json/form-data.json";

  }

  getSidebarData(): Observable<any>{

    return this._http.get(this.sidebardataURL);

  }

  getFormData(): Observable<any>{

    return this._http.get(this.formURL);

  }
}