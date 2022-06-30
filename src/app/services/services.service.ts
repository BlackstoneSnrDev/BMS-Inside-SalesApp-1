import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, from } from 'rxjs'
import { UsersService } from './auth.service';
import {
    AngularFirestore,
    AngularFirestoreDocument,
  } from '@angular/fire/compat/firestore'; 
import firebase from 'firebase/compat';

  

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

       this.usersService.dbObjKey.subscribe(dbObjKey => this.dbObjKey = dbObjKey);

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
    const data = this.afs.collection('Tenant').doc(this.dbObjKey).collection('templates').ref;
    return data.where('active', '==', true).get().then(async (docs) => {
        let filteredTemplateData: any[] = [];
        let templateId = docs.docs[0].id;
        let customerArray: firebase.firestore.DocumentData[] = [];

        let customerData = this.afs.collection('Tenant').doc(this.dbObjKey).collection('templates').doc(templateId).collection('customers').ref;
        await customerData.get().then((docs) => { 
            docs.forEach((doc) => {
                customerArray.push(doc.data());
            })
        })

        Object.values(docs.docs[0].data()).forEach((item) => {
            if (typeof item === 'object'){
                filteredTemplateData.push({ 
                    title: item.element_placeholder,
                    field: item.element_table_value, 
                    element_type: item.element_type,
                    element_order: item.element_order,
                });
            }
        })

        console.log(filteredTemplateData);
        console.log(customerArray);
        return ({ filteredTemplateData, customerArray });
    })

  }

  getNavbarData(): Observable<any>{

    return this._http.get(this.navbarDataURL);

  }

  getAllTemplates(): Observable<any> {
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

  getShowWhileCallingElements(dbObjKey: string | undefined) {
    console.log('getActiveTemplate FIRED');
    const data = this.afs.collection('Tenant').doc(dbObjKey).collection('templates').ref;
    return data.where('active', '==', true).get().then((docs) => {
        let filteredTemplateData: any[] = [];
        Object.values(docs.docs[0].data()).forEach((item) => {
            if (typeof item === 'object' && item.showWhileCalling === true){
                filteredTemplateData.push(item);
            }
        })
        return filteredTemplateData;
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


    async getallCustomers() {
    const template = this.afs.collection('Tenant').doc(this.dbObjKey).collection('templates').ref;
    let templateId = template.where('active', '==', true).get().then((docs) => {
        return docs.docs[0].id;
     })
    let data = this.afs.collection('Tenant').doc(this.dbObjKey).collection('templates').doc(await templateId).collection('customers').ref;
    let docArray: firebase.firestore.DocumentData[] = [];
    data.get().then((docs) => { 
        docs.forEach((doc) => {
            docArray.push(doc.data());
        })
    })
    console.log(docArray);
    return docArray;
}

populateTemplateWithCustomers() {
    const data = this.afs.collection('Tenant').doc(this.dbObjKey).collection('templates').doc('Template One').collection('customers').ref;
   
    customers.forEach((customer) => { 
        // set documents in template collection
        data.add(customer);
    })
  }

}

let customers = [
        {
          "fullname": "Cameron Giles",
          "phonenumber": "+1 (976) 585-3329",
          "emailaddress": "camerongiles@recrisys.com",
          "address": "445 Prospect Avenue, Retsof, New Hampshire, 6422",
          "balance": "$106.35",
          "MRN": "62bcad2969f967e0b327d1ea",
          "dob": "2008-10-11T11:53:51 +04:00",
          "priorcontact": false,
          "pending": true,
          "group": []
        },
        {
          "fullname": "Moore Nunez",
          "phonenumber": "+1 (888) 558-3043",
          "emailaddress": "moorenunez@recrisys.com",
          "address": "396 Overbaugh Place, Wadsworth, Iowa, 5241",
          "balance": "$66.47",
          "MRN": "62bcad2982c263263697606e",
          "dob": "2008-02-05T05:54:24 +05:00",
          "priorcontact": true,
          "pending": true,
          "group": []
        },
        {
          "fullname": "Lilian Winters",
          "phonenumber": "+1 (858) 417-2403",
          "emailaddress": "lilianwinters@recrisys.com",
          "address": "662 Dean Street, Marne, Minnesota, 2362",
          "balance": "$48.09",
          "MRN": "62bcad2970f1be77b990b815",
          "dob": "2010-04-04T11:44:22 +04:00",
          "priorcontact": false,
          "pending": true,
          "group": []
        },
        {
          "fullname": "Barnes Crosby",
          "phonenumber": "+1 (899) 509-3989",
          "emailaddress": "barnescrosby@recrisys.com",
          "address": "446 Bouck Court, Allamuchy, Utah, 6206",
          "balance": "$243.67",
          "MRN": "62bcad2954de34ab96cc9991",
          "dob": "2010-10-29T04:13:58 +04:00",
          "priorcontact": false,
          "pending": true,
          "group": []
        },
        {
          "fullname": "England Randolph",
          "phonenumber": "+1 (983) 447-3044",
          "emailaddress": "englandrandolph@recrisys.com",
          "address": "375 Horace Court, Witmer, Georgia, 3881",
          "balance": "$264.02",
          "MRN": "62bcad29f27ceee52a6888bd",
          "dob": "2001-09-14T02:33:50 +04:00",
          "priorcontact": true,
          "pending": true,
          "group": []
        },
        {
          "fullname": "Brennan Morrow",
          "phonenumber": "+1 (971) 562-2413",
          "emailaddress": "brennanmorrow@recrisys.com",
          "address": "825 Conover Street, Kingstowne, New Jersey, 554",
          "balance": "$58.75",
          "MRN": "62bcad2960aae849d5e4e370",
          "dob": "2015-10-12T02:01:01 +04:00",
          "priorcontact": true,
          "pending": false,
          "group": []
        },
        {
          "fullname": "Nunez Park",
          "phonenumber": "+1 (943) 524-2481",
          "emailaddress": "nunezpark@recrisys.com",
          "address": "757 Elmwood Avenue, Gorst, Puerto Rico, 4320",
          "balance": "$47.91",
          "MRN": "62bcad29fd0e942fc1f74303",
          "dob": "2015-06-28T09:36:49 +04:00",
          "priorcontact": false,
          "pending": false,
          "group": []
        },
        {
          "fullname": "Diann Richmond",
          "phonenumber": "+1 (881) 441-3688",
          "emailaddress": "diannrichmond@recrisys.com",
          "address": "256 Vernon Avenue, Delco, American Samoa, 7160",
          "balance": "$166.83",
          "MRN": "62bcad2971854a482f53be50",
          "dob": "2001-08-29T03:37:33 +04:00",
          "priorcontact": true,
          "pending": false,
          "group": []
        },
        {
          "fullname": "Olga Elliott",
          "phonenumber": "+1 (967) 580-2491",
          "emailaddress": "olgaelliott@recrisys.com",
          "address": "297 Hale Avenue, Lopezo, Massachusetts, 9371",
          "balance": "$39.95",
          "MRN": "62bcad29f64c5f88fcf69e66",
          "dob": "2002-04-20T01:56:20 +04:00",
          "priorcontact": true,
          "pending": true,
          "group": []
        },
        {
          "fullname": "Moran Combs",
          "phonenumber": "+1 (995) 535-2343",
          "emailaddress": "morancombs@recrisys.com",
          "address": "818 Vanderbilt Street, Lowgap, New Mexico, 2229",
          "balance": "$250.51",
          "MRN": "62bcad29ed874373ef34dde5",
          "dob": "2005-01-09T03:18:49 +05:00",
          "priorcontact": false,
          "pending": false,
          "group": []
        },
        {
          "fullname": "Lessie Campos",
          "phonenumber": "+1 (941) 506-2786",
          "emailaddress": "lessiecampos@recrisys.com",
          "address": "429 Waldane Court, Hemlock, Indiana, 8560",
          "balance": "$246.84",
          "MRN": "62bcad2994afa8b6a1e2b648",
          "dob": "2006-09-22T06:16:05 +04:00",
          "priorcontact": true,
          "pending": true,
          "group": []
        },
        {
          "fullname": "Josephine Best",
          "phonenumber": "+1 (895) 473-3313",
          "emailaddress": "josephinebest@recrisys.com",
          "address": "915 Decatur Street, Farmers, South Dakota, 3007",
          "balance": "$290.53",
          "MRN": "62bcad29032efa467b32002b",
          "dob": "2013-01-06T11:28:24 +05:00",
          "priorcontact": true,
          "pending": false,
          "group": []
        },
        {
          "fullname": "Margret Hobbs",
          "phonenumber": "+1 (847) 539-2852",
          "emailaddress": "margrethobbs@recrisys.com",
          "address": "402 Clarkson Avenue, Roy, Vermont, 998",
          "balance": "$175.82",
          "MRN": "62bcad29ee337f96c54a5876",
          "dob": "2000-07-07T10:00:08 +04:00",
          "priorcontact": false,
          "pending": true,
          "group": []
        },
        {
          "fullname": "Beard Cross",
          "phonenumber": "+1 (853) 472-2864",
          "emailaddress": "beardcross@recrisys.com",
          "address": "576 Ellery Street, Chesapeake, Maine, 7251",
          "balance": "$109.96",
          "MRN": "62bcad29039779b24ccd8c80",
          "dob": "2000-07-22T10:27:09 +04:00",
          "priorcontact": false,
          "pending": true,
          "group": []
        },
        {
          "fullname": "Lorraine Schultz",
          "phonenumber": "+1 (834) 447-2436",
          "emailaddress": "lorraineschultz@recrisys.com",
          "address": "164 Crosby Avenue, Heil, Nebraska, 8020",
          "balance": "$211.66",
          "MRN": "62bcad298d72c37503e5629f",
          "dob": "2010-12-09T05:16:19 +05:00",
          "priorcontact": true,
          "pending": true,
          "group": []
        },
        {
          "fullname": "Doyle Swanson",
          "phonenumber": "+1 (878) 413-2223",
          "emailaddress": "doyleswanson@recrisys.com",
          "address": "994 Lincoln Road, Springhill, Oregon, 539",
          "balance": "$294.50",
          "MRN": "62bcad296605615106d7d127",
          "dob": "2001-02-03T06:49:34 +05:00",
          "priorcontact": true,
          "pending": true,
          "group": []
        },
        {
          "fullname": "Reese Floyd",
          "phonenumber": "+1 (844) 560-3062",
          "emailaddress": "reesefloyd@recrisys.com",
          "address": "164 Blake Avenue, Sena, Alaska, 597",
          "balance": "$221.52",
          "MRN": "62bcad2961f7e9dc6078df8e",
          "dob": "2022-01-02T01:47:49 +05:00",
          "priorcontact": false,
          "pending": true,
          "group": []
        },
        {
          "fullname": "Young Mckay",
          "phonenumber": "+1 (961) 488-3618",
          "emailaddress": "youngmckay@recrisys.com",
          "address": "516 Kings Hwy, Riviera, Marshall Islands, 7486",
          "balance": "$1.98",
          "MRN": "62bcad29a2f8c4a8120e3f69",
          "dob": "2002-02-12T06:49:41 +05:00",
          "priorcontact": true,
          "pending": false,
          "group": []
        },
        {
          "fullname": "Alicia Sweet",
          "phonenumber": "+1 (872) 577-3145",
          "emailaddress": "aliciasweet@recrisys.com",
          "address": "927 Victor Road, Allison, Illinois, 7098",
          "balance": "$237.99",
          "MRN": "62bcad29db2fce16f669b020",
          "dob": "2010-10-27T11:41:36 +04:00",
          "priorcontact": false,
          "pending": false,
          "group": []
        },
        {
          "fullname": "Schneider Hicks",
          "phonenumber": "+1 (951) 560-2061",
          "emailaddress": "schneiderhicks@recrisys.com",
          "address": "350 Walker Court, Corriganville, Hawaii, 8268",
          "balance": "$84.57",
          "MRN": "62bcad2996e47ea76bc13f39",
          "dob": "2001-12-02T08:51:26 +05:00",
          "priorcontact": true,
          "pending": true,
          "group": []
        },
        {
          "fullname": "Pittman Foreman",
          "phonenumber": "+1 (830) 423-3960",
          "emailaddress": "pittmanforeman@recrisys.com",
          "address": "254 Hull Street, Gouglersville, Ohio, 9059",
          "balance": "$168.63",
          "MRN": "62bcad29411b0b1f0ce7c3ca",
          "dob": "2002-03-04T12:30:58 +05:00",
          "priorcontact": true,
          "pending": false,
          "group": []
        },
        {
          "fullname": "Hester Rodgers",
          "phonenumber": "+1 (885) 460-2888",
          "emailaddress": "hesterrodgers@recrisys.com",
          "address": "890 Fanchon Place, Chamizal, North Dakota, 4868",
          "balance": "$86.11",
          "MRN": "62bcad29af811dd68d253e5a",
          "dob": "2011-07-04T02:50:47 +04:00",
          "priorcontact": false,
          "pending": true,
          "group": []
        },
        {
          "fullname": "Aurora Garrett",
          "phonenumber": "+1 (840) 453-2527",
          "emailaddress": "auroragarrett@recrisys.com",
          "address": "928 Nassau Street, Kenvil, Oklahoma, 9803",
          "balance": "$288.92",
          "MRN": "62bcad29df94cd192e1feaf1",
          "dob": "2009-11-23T04:51:30 +05:00",
          "priorcontact": false,
          "pending": false,
          "group": []
        },
        {
          "fullname": "Daisy Washington",
          "phonenumber": "+1 (800) 580-3417",
          "emailaddress": "daisywashington@recrisys.com",
          "address": "938 Kenmore Court, Rockbridge, Federated States Of Micronesia, 9120",
          "balance": "$293.96",
          "MRN": "62bcad29ea4a7a397fc2377b",
          "dob": "2013-03-03T08:16:08 +05:00",
          "priorcontact": false,
          "pending": false,
          "group": []
        },
        {
          "fullname": "Williams Allison",
          "phonenumber": "+1 (962) 423-3770",
          "emailaddress": "williamsallison@recrisys.com",
          "address": "597 Bainbridge Street, Elwood, Rhode Island, 9485",
          "balance": "$174.00",
          "MRN": "62bcad29e5cbd690507a0821",
          "dob": "2003-09-03T11:32:11 +04:00",
          "priorcontact": true,
          "pending": false,
          "group": []
        }
      ]