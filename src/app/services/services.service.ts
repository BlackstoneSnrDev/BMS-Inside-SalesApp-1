import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, from } from 'rxjs'
import { UsersService } from './auth.service';
import {
    AngularFirestore,
    AngularFirestoreDocument,
  } from '@angular/fire/compat/firestore'; 

  

@Injectable({

  providedIn: 'root'

})

export class DataService {

  public navbarDataURL: string;
  public formElementsURL: string;
  public formCityURL: string;
  public formCountryURL: string;
  public formStateURL: string;

  public callhistoryURL: string;
  public logURL: string;
  public tableDataURL: string;
  public dbObjKey: any;

  constructor(

    private _http: HttpClient,
    private afs: AngularFirestore,
    private usersService: UsersService

  ){

    this.navbarDataURL = "../../assets/json/navbar-data.json";
    this.formElementsURL = "../../assets/json/form-elements.json";
    this.formCityURL = "https://countriesnow.space/api/v0.1/countries/";
    this.formCountryURL = "https://countriesnow.space/api/v0.1/countries/iso";
    this.formStateURL = "https://countriesnow.space/api/v0.1/countries/states";

    this.callhistoryURL = "../../assets/json/call-flow.json";
    this.logURL = "../../assets/json/log-data.json";
    this.tableDataURL = "../../assets/json/queueTable-data.json";

  }

  getFormElementsData(): Observable<any>{

    return this._http.get(this.formElementsURL);

  }

  getFormCity(): Observable<any>{

    return this._http.get(this.formCityURL);

  }

  getFormCountry(): Observable<any>{

    return this._http.get(this.formCountryURL);

  }

  getFormState(): Observable<any>{

    return this._http.get(this.formStateURL);

  }

  getLogData(): Observable<any>{

    return this._http.get(this.logURL);

  }

  getCallHistoryData(): Observable<any>{

    return this._http.get(this.callhistoryURL);

  }

  getTableData() {

    console.log('getActiveTemplate FIRED');
    const data = this.afs.collection('Tenant').doc(this.dbObjKey).collection('templates').ref;
    return data.where('active', '==', true).get().then((docs) => {
        let filteredTemplateData: any[] = [];
        Object.values(docs.docs[0].data()).forEach((item) => {
            if (typeof item === 'object'){
                filteredTemplateData.push({ 
                    title: item.element_placeholder,
                    field: item.element_placeholder, 
                    element_type: item.element_type,
                    element_order: item.element_order,
                });
            }
        })
        return filteredTemplateData;
    })

  }

  getNavbarData(): Observable<any>{

    return this._http.get(this.navbarDataURL);

  }

  getAllTemplates(): Observable<any> {
    console.log('FIRED!!!!');
    const data = this.afs.collection('Tenant').doc(this.dbObjKey).collection('templates').snapshotChanges().pipe(
        map(actions => actions.map(a => a.payload.doc.data()))
      );
    return data;
  }

  changeSelectedTemplate(template: string) {
    const data = this.afs.collection('Tenant').doc(this.dbObjKey).collection('templates').ref;
// change current active template to false
    data.where('active', '==', true).get().then((docs) => {
        docs.forEach((doc) => {
            this.afs.collection('Tenant').doc(this.dbObjKey).collection('templates').doc(doc.id).update({active: false});
        })
// change selected template to true
    }).then((res) => {  
        this.afs.collection('Tenant').doc(this.dbObjKey).collection('templates').doc(template).update({active: true});
    })

  }

  getActiveTemplate(dbObjKey: string | undefined) {
    console.log('getActiveTemplate FIRED');
    const data = this.afs.collection('Tenant').doc(dbObjKey).collection('templates').ref;
    return data.where('active', '==', true).get().then((docs) => {
        let filteredTemplateData: any[] = [];
        Object.values(docs.docs[0].data()).forEach((item) => {
            if (typeof item === 'object'){
                filteredTemplateData.push(item);
            }
        })
        return filteredTemplateData;
    })
}

}

