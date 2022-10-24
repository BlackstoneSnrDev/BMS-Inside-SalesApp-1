import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, from, BehaviorSubject, combineLatest } from 'rxjs';
import * as moment from 'moment';
import { UsersService } from './auth.service';
import { RandomId } from './services.randomId';
import {
    AngularFirestore,
    AngularFirestoreDocument
  } from '@angular/fire/compat/firestore'; 
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { arrayUnion, arrayRemove, Timestamp, DocumentReference, DocumentData, deleteField } from '@angular/fire/firestore'
import { AngularFireFunctions } from '@angular/fire/compat/functions';
import { AngularFireFunctionsModule } from '@angular/fire/compat/functions';
import firebase from 'firebase/compat';

let len = 12;
let pattern = 'aA0';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  public navbarDataURL: string;
  public formElementsURL: string;
  public formCityURL: string;
  public formCountryURL: string;
  public formStateURL: string;
  public selectDataURL: string;

  public callhistoryURL: string;
  public logURL: string;
  public tableDataURL: string;
  public dbObjKey: any;
  public userInfo: any;
  public currentUid: string;
  public activeTemplate: any;

  private activeDialSessionArray = new BehaviorSubject<any>(null);
  private activeCall = new BehaviorSubject<any>(null);
  private activeCallNotes = new BehaviorSubject<any>(null);

  public dialSessionArray = this.activeDialSessionArray.asObservable();
  public currentCall = this.activeCall.asObservable();
  public currentCallNotes = this.activeCallNotes.asObservable();

  constructor(
    private _http: HttpClient,
    private afs: AngularFirestore,
    private usersService: UsersService,
    private fns: AngularFireFunctions,
    private storage: AngularFireStorage
  ) {
    this.navbarDataURL = '../../assets/json/menu-data.json';
    this.formElementsURL = '../../assets/json/form-elements.json';
    this.formCityURL = 'https://countriesnow.space/api/v0.1/countries/';
    this.formCountryURL = 'https://countriesnow.space/api/v0.1/countries/iso';
    this.formStateURL = 'https://countriesnow.space/api/v0.1/countries/states';
    this.callhistoryURL = '../../assets/json/call-flow.json';
    this.logURL = '../../assets/json/log-data.json';
    this.tableDataURL = '../../assets/json/queueTable-data.json';
    this.selectDataURL = '../../assets/json/select-data.json';

    this.usersService.dbObjKey.subscribe(
      (dbObjKey) => (this.dbObjKey = dbObjKey)
    );
    this.usersService.userInfo.subscribe(
      (userInfo) => (this.userInfo = userInfo)
    );
    this.usersService.activeTemplate.subscribe(
      (template) => (this.activeTemplate = template)
    );

    this.currentUid = this.userInfo.uid;
  }

  getAllTextsForMessengerPage() {

    return this.afs.collection('Tenant').doc(this.dbObjKey).collection('templates').doc(this.activeTemplate).collection('customers').snapshotChanges().pipe(
        map(actions => actions.filter(a => a.payload.doc.data()['smsText'].length > 0).map(a => a.payload.doc.data() ))
    )



    // return customerRef.get().then(querySnapshot => {
    //     querySnapshot.forEach(doc => {
    //         if (doc.data()['smsText'].length > 0) {
    //             return console.log(doc.data()['fullname'] +  ' DATA ' + doc.data()['smsText'].length);
    //         } else{
    //             return console.log( doc.data()['fullname'] +  ' no data ' + doc.data()['smsText'].length)
    //         }
    //     });

    // })


  }
  
  sendText() {
    const callable = this.fns.httpsCallable('generateToken');
    return callable({text: 'test', page: '/dashboard'}).toPromise().then(result => {
        return result;
    })
  }
    makeCall(_type: string, messageUid: any, customerUid: any, to: any) {
        console.log(messageUid, customerUid);
        const callable = this.fns.httpsCallable('sendText');
        // find the textMessage that matches the messageUid
        if (_type === 'template') {
        const ref = this.afs.collection('Tenant').doc(this.dbObjKey).collection('users').doc(this.userInfo.uid).collection('settings').doc('textMessage').ref
        return ref.get().then(doc => {
            const data = doc.data();
            const textMessage = data ? data[messageUid] : 'null';
            console.log(textMessage.data)
            return callable({ to: to, message: textMessage.data, customerUid: customerUid, activeTemplate: this.activeTemplate, dbObj: this.dbObjKey, userInfo: this.userInfo }).toPromise().then(result => {
                console.log(result);
                return result;
            }).catch(error => {
                console.log(error);
                return error;
            })
        })
        } else {
            return callable({ to: to, message: messageUid, customerUid: customerUid, activeTemplate: this.activeTemplate, dbObj: this.dbObjKey, userInfo: this.userInfo }).toPromise().then(result => {
                console.log(result);
                return result;
            }).catch(error => {
                console.log(error);
                return error;
            })
        }
    }

    getUserSettings(): Observable<any>{
        const ref = this.afs.collection('Tenant').doc(this.dbObjKey).collection('users').doc(this.userInfo.uid).collection('settings');
        return ref.valueChanges({idField: 'docId'});
    }

    saveBlob(blob: Blob, fileName: string): Promise<any> {
        console.log(blob, fileName);
        const uid = RandomId(len, pattern)
        const file = blob;
        const filePath = `${this.userInfo.uid}/voicemail/${fileName}`;
        const ref = this.storage.ref(filePath);
        return ref.put(file).then(() => {
            ref.getDownloadURL().subscribe(url => {
                this.afs.collection('Tenant').doc(this.dbObjKey).collection('users').doc(this.userInfo.uid).collection('settings').doc('voicemail').update({
                    [uid]: {
                        uid: uid,
                        url: url,
                        fileName: fileName
                    }
                })
            })
            return ('Voicemail has been added')
        }).catch(error => {
            return (error)
        })
    }
    saveEmailTemplate(data: any, editUid: any) {
        console.log('text', data);
        const uid = editUid ? editUid : RandomId(len, pattern)
        return this.afs.collection('Tenant').doc(this.dbObjKey).collection('users').doc(this.userInfo.uid).collection('settings').doc('emails').update({
            [uid]: {
                uid: uid,
                data: data.templateContent,
                templateName: data.templateName
            }
        }).then(() => {
            return ('Template "' + data.templateName + '" has been created successfully.')
        })
    }
    saveTextMessageTemplate(data: any, editUid: any): Promise<any> {
        console.log('text', data);
        const uid = editUid ? editUid : RandomId(len, pattern)
        return this.afs.collection('Tenant').doc(this.dbObjKey).collection('users').doc(this.userInfo.uid).collection('settings').doc('textMessage').update({
            [uid]: {
                uid: uid,
                data: data.templateContent,
                templateName: data.templateName
            }
        }).then(() => {
            return ('Template "' + data.templateName + '" has been created successfully.')
        })
    }

  addTemplate(data: any) {
    let newTemplateRef = this.afs
      .collection('Tenant')
      .doc(this.dbObjKey)
      .collection('templates')
      .doc(data.templateName);
    newTemplateRef.set({
      templateName: data.templateName,
    });
    data.fieldArray.forEach((item: firebase.firestore.DocumentData) => {
      return newTemplateRef.set(
        {
          [item['element_table_value']]: item,
        },
        { merge: true }
      );
    });

    if (data.statusArray.length > 0) {
      // create statusList collection and add each item from statusArray to it
      let statusListRef = this.afs
        .collection('Tenant')
        .doc(this.dbObjKey)
        .collection('templates')
        .doc(data.templateName)
        .collection('statusList');
      data.statusArray.forEach((item: firebase.firestore.DocumentData) => {
        return statusListRef.doc(item['uid']).set(item);
      });
    }

    this.activeDialSessionArray.next(
      'no contacts have been added to this template'
    );
    // this.activeCall.next(activeGroupCustomerArray[0]);
    this.setActiveCall('no contacts have been added to this template');
  }

  deleteSettingTemplate(uid: any, type: any) {
    return this.afs.collection('Tenant').doc(this.dbObjKey).collection('users').doc(this.userInfo.uid).collection('settings').doc(type).update({
        [uid]: deleteField()
    })
  }

  addStatuses(statuses: any) {
    console.log(statuses);
  }

  formatPhoneNumber(phoneNumberString: string) {
    var cleaned = ('' + phoneNumberString).replace(/\D/g, '');
    var match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/);
    if (match) {
      var intlCode = match[1] ? '+1 ' : '';
      return [intlCode, '(', match[2], ') ', match[3], '-', match[4]].join('');
    }
    return null;
  }

  setActiveCall(customerId: string) {
    const data = this.afs
      .collection('Tenant')
      .doc(this.dbObjKey)
      .collection('templates')
      .doc(this.activeTemplate)
      .collection('customers')
      .doc(customerId)
      .snapshotChanges()
      .subscribe((t) => {
        this.activeCall.next(t.payload.data());
      });
    // console.log('setActiveCall', data);
    return data;
  }

  getDialingSessionTemplate() {
    const data = this.afs
      .collection('Tenant')
      .doc(this.dbObjKey)
      .collection('templates')
      .doc(this.activeTemplate).ref;
    return data.get().then((doc: any) => {
        console.log(doc.data());
        let filteredTemplateData: any[] = [];
        Object.values(doc.data()).forEach((item) => {
            if (typeof item === 'object'){
                filteredTemplateData.push(item);
            }
        })
        return filteredTemplateData;
    })
}

    getActiveGroupCustomerArray() {

        let activeGroupCustomerArray: any[] = [];

        if (this.userInfo.activeGroup.length > 0) {
            let withGroup = this.afs.collection('Tenant').doc(this.dbObjKey).collection('templates').doc(this.activeTemplate).collection('customers').ref;
            withGroup.get().then((doc: any) => {
                doc.forEach((item: any) => {
                    if (this.userInfo.activeGroup.some((r: any) => item.data().group.includes(r))) {
                        activeGroupCustomerArray.push(item.data())
                    }
                })
            }).then(() => {
                if (activeGroupCustomerArray.length > 0) {
                    this.setActiveCall(activeGroupCustomerArray[0].uid) 
                    this.activeDialSessionArray.next(activeGroupCustomerArray);
                } else {
                    this.activeCall.next({
                        notes: [],
                        phonenumber: "000-000-0000"
                    })
                }
            })

        } else {
            let noGroup = this.afs.collection('Tenant').doc(this.dbObjKey).collection('templates').doc(this.activeTemplate).collection('customers').ref;
            noGroup.get().then((doc: any) => {
                doc.forEach((item: any) => {
                    activeGroupCustomerArray.push(item.data())
                })
            }).then(() => {
                if (activeGroupCustomerArray.length > 0) {
                    this.setActiveCall(activeGroupCustomerArray[0].uid) 
                    this.activeDialSessionArray.next(activeGroupCustomerArray);
                } else {
                    this.activeCall.next({
                        notes: [],
                        phonenumber: "000-000-0000"
                    })
                }
            })
        }
    }
  

  selectActiveGroup(group: string) {
    this.afs
      .collection('Tenant')
      .doc(this.dbObjKey)
      .collection('users')
      .doc(this.userInfo.uid)
      .update({
        activeGroup: arrayUnion(group),
      });
  }
  removeActiveGroup(group: string) {
    this.afs
      .collection('Tenant')
      .doc(this.dbObjKey)
      .collection('users')
      .doc(this.userInfo.uid)
      .update({
        activeGroup: arrayRemove(group),
      });
  }

  addNewNote(customerId: string, note: string) {
    const customer = this.afs
      .collection('Tenant')
      .doc(this.dbObjKey)
      .collection('templates')
      .doc(this.activeTemplate)
      .collection('customers')
      .doc(customerId)
      .update({
        notes: arrayUnion({
          date: Timestamp.fromDate(new Date()),
          data: note,
          enteredBy: this.userInfo.name,
          enteredByUid: this.userInfo.uid,
        }),
      });
    //this.getNoteData(customerId);
  }

  createUser(data: any) {
    console.log(data);
    const callable = this.fns.httpsCallable('createNewUser');
    var userData = {
      email: 'name@example.com',
      emailVerified: true,
      phoneNumber: '+15551212',
      password: 'randomPW',
      displayName: 'User Name',
      disabled: false,
      sponsor: 'Extra Payload #1 (optional)',
      study: 'Extra Payload #2 (optional)',
      department: data.department,
      tenant: this.activeTemplate,
      dbObjKey: this.dbObjKey,
    };
    return callable(userData);
    //return "testing";
  }

  async fileUpload(Parsed: any) {
    let headers = Parsed.meta.fields;
    let templateFieldArray: any[] = [];
    let templateFieldObj: any[] = [];
    // Get all the fields from the currently active template
    const activeTemplateFields = this.afs
      .collection('Tenant')
      .doc(this.dbObjKey)
      .collection('templates')
      .doc(this.activeTemplate).ref;
    await activeTemplateFields.get().then((doc: any) => {
      Object.entries(doc.data()).forEach((field: any) => {
        if (typeof field[1] === 'object') {
          templateFieldObj.push(field);
          templateFieldArray.push(field[0]);
        }
      });
    });
    let difference = templateFieldArray
      .filter((x) => !headers.includes(x))
      .concat(headers.filter((x: any) => !templateFieldArray.includes(x)));
    if (difference.length) {
      return "Error: The Headers in your CSV file do not exactly match the fields in the active template. Please check the CSV file's headers and try again.";
    } else {
      let errorArray: any = [];
      let okayRowCount = 0;
      let sanitizedRowArray: any = [];

      await Parsed.data.forEach(
        (row: firebase.firestore.DocumentData, rowIndex: number) => {
          let sanitizedRow: any = {};
          let error = false;

          Object.entries(row).forEach(async (field: any) => {
            let fieldObj = templateFieldObj.find(
              (obj: any) => obj[0] === field[0]
            );

            switch (fieldObj[1].element_type) {
              case 'text':
                sanitizedRow[field[0]] = field[1];
                break;
              case 'number':
                if (parseFloat(field[1])) {
                  sanitizedRow[field[0]] = parseFloat(field[1]);
                } else {
                  error = true;
                  errorArray.push(
                    `Error in row ${rowIndex + 2}: ${field[1]} is not a number.`
                  );
                }
                break;
              case 'date':
                if (moment(field[1], 'YYYY-MM-DD', true).isValid()) {
                  sanitizedRow[field[0]] = new Date(field[1]);
                } else {
                  error = true;
                  errorArray.push(
                    `Error in row ${rowIndex + 2}: ${
                      field[1]
                    } is not a properly formatted date. Please use YYYY-MM-DD.`
                  );
                }
                break;
              case 'boolean':
                if (field[1].toUpperCase() === 'TRUE') {
                  sanitizedRow[field[0]] = true;
                } else if (field[1].toUpperCase() === 'FALSE') {
                  sanitizedRow[field[0]] = false;
                } else {
                  error = true;
                  errorArray.push(
                    `Error in row ${rowIndex + 2}: ${
                      field[1]
                    } is not a true/false.`
                  );
                }
                break;
              default:
                null;
            }
          });
          if (!error) {
            okayRowCount++;
            sanitizedRowArray.push({ ...sanitizedRow });
          }
        }
      );
      if (errorArray.length > 0) {
        return { status: 'Error', data: errorArray };
      } else {
        // batch committ all sanitizedRowArray to firestore database customer collection
        const batch = this.afs.firestore.batch();
        sanitizedRowArray.forEach((row: any, index: number) => {
          console.log(row, index);
          let uid = RandomId(len, pattern);
          console.log(uid);
          const ref: any = this.afs
            .collection('Tenant')
            .doc(this.dbObjKey)
            .collection('templates')
            .doc(this.activeTemplate)
            .collection('customers')
            .doc(uid).ref;
          batch.set(ref, {
            ...row,
            group: [],
            lastContact: null,
            notes: [],
            template: this.activeTemplate,
            uid: uid,
          });

          // 1h70d8gkAQXx
          // p5TPOipU5g5q
        });
        return batch
          .commit()
          .then(() => {
            return {
              status: 'Success',
              data: `${okayRowCount} rows successfully uploaded.`,
            };
          })
          .catch((error: any) => {
            return { status: 'Error', data: error };
          });
      }
    }
  }

  getAllUsers(): Observable<any> {
    // get all the users for the current tenant
    return this.afs
      .collection('Tenant')
      .doc(this.dbObjKey)
      .collection('users')
      .snapshotChanges()
      .pipe(map((actions) => actions.map((a) => a.payload.doc.data())));
  }

  getUserTableHeader() {
    // get userTableElements from the current tenant
    const data = this.afs.collection('Tenant').doc(this.dbObjKey).ref;
    return data.get().then((doc: any) => {
      return Object.values(doc.data().usersTableElements);
    });
  }

  getMyTableData(): Observable<any> {
    return this._http.get(this.tableDataURL);
  }

  getSelectData(): Observable<any> {
    return this._http.get(this.selectDataURL);
  }

  getFormElementsData(): Observable<any> {
    return this._http.get(this.formElementsURL);
  }

  getFormCity(): Observable<any> {
    return this._http.get(this.formCityURL);
  }

  getFormCountry(): Observable<any> {
    return this._http.get(this.formCountryURL);
  }

  getFormState(): Observable<any> {
    return this._http.get(this.formStateURL);
  }

  getLogData(): Observable<any> {
    return this._http.get(this.logURL);
  }

  getCallHistoryData(): Observable<any> {
    return this._http.get(this.callhistoryURL);
  }

  getTableCustomerHeader() {
    const data = this.afs
      .collection('Tenant')
      .doc(this.dbObjKey)
      .collection('templates')
      .doc(this.activeTemplate).ref;
    return data.get().then((doc: any) => {
      let tableHeader: any[] = [];
      Object.values(doc.data()).forEach((item: any) => {
        if (typeof item === 'object') {
          tableHeader.push({
            title: item.element_placeholder,
            field: item.element_table_value,
            value: item.element_value,
            element_type: item.element_type,
            element_order: item.element_order,
          });
        }
      });
      return tableHeader;
    });
  }

  getTableData(): Observable<any> {
    const customerArray = this.afs
      .collection('Tenant')
      .doc(this.dbObjKey)
      .collection('templates')
      .doc(this.activeTemplate)
      .collection('customers')
      .snapshotChanges()
      .pipe(map((actions) => actions.map((a) => a.payload.doc.data())));
    return customerArray;
  }

  getCustomerGroups(): Observable<any> {
    // console.log(this.userInfo.uid);
    const groupArray = this.afs
      .collection('Tenant')
      .doc(this.dbObjKey)
      .collection('users')
      .doc(this.userInfo.uid)
      .collection('groups')
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions
            .filter(
              (a) => a.payload.doc.data()['template'] === this.activeTemplate
            )
            .map((a) => a.payload.doc.data())
        )
      );
    return groupArray;
  }

  createNewCustomerGroup(groupName: string, rowUidArray: any[]) {
    let id = RandomId(len, pattern);
    // sets the group up for the current user
    const data = this.afs
      .collection('Tenant')
      .doc(this.dbObjKey)
      .collection('users')
      .doc(this.userInfo.uid)
      .collection('groups').ref;
    data.doc(id).set({
        group_name: groupName, 
        group_id: id,
        group: rowUidArray,
        template: this.activeTemplate
    })
// adds the group_id to each row's group array

    rowUidArray.forEach((rowUid: any) => {
      this.afs
        .collection('Tenant')
        .doc(this.dbObjKey)
        .collection('templates')
        .doc(this.activeTemplate)
        .collection('customers')
        .doc(rowUid)
        .update({
          group: arrayUnion(id),
        });
    });
  }

  deleteCustomerGroup(groupId: string) {
    // delete group from user's group collection
    this.afs
      .collection('Tenant')
      .doc(this.dbObjKey)
      .collection('users')
      .doc(this.userInfo.uid)
      .collection('groups')
      .doc(groupId)
      .delete();
    // delete group from each row's group array
    this.afs
      .collection('Tenant')
      .doc(this.dbObjKey)
      .collection('templates')
      .doc(this.activeTemplate)
      .collection('customers')
      .ref.where('group', 'array-contains', groupId)
      .get()
      .then((snapshot: any) => {
        snapshot.forEach((row: any) => {
          this.afs
            .collection('Tenant')
            .doc(this.dbObjKey)
            .collection('templates')
            .doc(this.activeTemplate)
            .collection('customers')
            .doc(row.id)
            .update({
              group: arrayRemove(groupId),
            });
        });
      });
  }

  addToExistingCustomerGroup(groupId: string, rowUidArray: any[]) {
    // update the group up for the current user - the group array of row uids
    const data = this.afs
      .collection('Tenant')
      .doc(this.dbObjKey)
      .collection('users')
      .doc(this.userInfo.uid)
      .collection('groups')
      .doc(groupId)
      .update({
        group: arrayUnion(...rowUidArray),
      });
    // adds the group_id to each added row's group array
    rowUidArray.forEach((rowUid: any) => {
      this.afs
        .collection('Tenant')
        .doc(this.dbObjKey)
        .collection('templates')
        .doc(this.activeTemplate)
        .collection('customers')
        .doc(rowUid)
        .update({
          group: arrayUnion(groupId),
        });
    });
  }

  removeFromCustomerGroup(groupId: string, rowUidArray: any[]) {
    // update the group up for the current user - the group array of row uids
    const data = this.afs
      .collection('Tenant')
      .doc(this.dbObjKey)
      .collection('users')
      .doc(this.userInfo.uid)
      .collection('groups')
      .doc(groupId)
      .update({
        group: arrayRemove(...rowUidArray),
      });
    // removes the group_id from each removed row's group array
    rowUidArray.forEach((rowUid: any) => {
      this.afs
        .collection('Tenant')
        .doc(this.dbObjKey)
        .collection('templates')
        .doc(this.activeTemplate)
        .collection('customers')
        .doc(rowUid)
        .update({
          group: arrayRemove(groupId),
        });
    });
  }

  getNavbarData(): Observable<any> {
    return this._http.get(this.navbarDataURL);
  }

  getAllTemplates(): Observable<any> {
    const data = this.afs
      .collection('Tenant')
      .doc(this.dbObjKey)
      .collection('templates')
      .snapshotChanges()
      .pipe(map((actions) => actions.map((a) => a.payload.doc.data())));
    return data;
  }

  getTemplateStatuses(templateName: string): Observable<any> {
    const data = this.afs
      .collection('Tenant')
      .doc(this.dbObjKey)
      .collection('templates')
      .doc(templateName)
      .collection('statusList')
      .snapshotChanges()
      .pipe(map((actions) => actions.map((a) => a.payload.doc.data())));
    return data;
  }

  getAllTemplatesAdmin(): Observable<any> {
    const data = this.afs
      .collection('Tenant')
      .doc(this.dbObjKey)
      .collection('templates')
      .snapshotChanges()
      .pipe(map((actions) => actions.map((a) => a.payload.doc.data())));

    return data;
  }

  changeSelectedTemplate(template: string) {
    const data = this.afs
      .collection('Tenant')
      .doc(this.dbObjKey)
      .collection('templates').ref;
    // change current active template to false
    data
      .where('active', '==', true)
      .get()
      .then((docs) => {
        docs.forEach((doc) => {
          this.afs
            .collection('Tenant')
            .doc(this.dbObjKey)
            .collection('templates')
            .doc(doc.id)
            .update({ active: false });
        });
        // change selected template to true
      })
      .then((res) => {
        this.afs
          .collection('Tenant')
          .doc(this.dbObjKey)
          .collection('templates')
          .doc(template)
          .update({ active: true });
      });
    // update the current users activeTemplate field with the template
    this.afs
      .collection('Tenant')
      .doc(this.dbObjKey)
      .collection('users')
      .doc(this.userInfo.uid)
      .update({ activeTemplate: template });
    sessionStorage.setItem('dataTableView', 'all');
  }

  getShowWhileCallingElements(dbObjKey: string | undefined) {
    console.log('getActiveTemplate FIRED');
    const data = this.afs
      .collection('Tenant')
      .doc(dbObjKey)
      .collection('templates').ref;
    return data
      .where('active', '==', true)
      .get()
      .then((docs) => {
        let filteredTemplateData: any[] = [];
        Object.values(docs.docs[0].data()).forEach((item) => {
          if (typeof item === 'object' && item.showWhileCalling === true) {
            filteredTemplateData.push(item);
          }
        });
        return filteredTemplateData;
      });
  }

  getActiveTemplate(dbObjKey: string | undefined) {
    console.log('getActiveTemplate FIRED');
    const data = this.afs
      .collection('Tenant')
      .doc(dbObjKey)
      .collection('templates').ref;
    return data
      .where('active', '==', true)
      .get()
      .then((docs) => {
        let filteredTemplateData: any[] = [];
        Object.values(docs.docs[0].data()).forEach((item) => {
          if (typeof item === 'object') {
            filteredTemplateData.push(item);
          }
        });
        return filteredTemplateData;
      });
  }

  async getallCustomers() {
    let docArray: firebase.firestore.DocumentData[] = [];
    this.afs
      .collection('Tenant')
      .doc(this.dbObjKey)
      .collection('templates')
      .doc(this.activeTemplate)
      .collection('customers')
      .snapshotChanges()
      .pipe(
        map((actions) =>
          actions.map((a) => docArray.push(a.payload.doc.data()))
        )
      );
    console.log(docArray);
    return docArray;
  }

  async addNewRecord(data: any) {
    this.afs
      .collection('Tenant')
      .doc(this.dbObjKey)
      .collection('templates')
      .doc(this.activeTemplate)
      .collection('customers')
      .add(data);
  }

  async editCustomer(data: any) {
    console.log(data);
    data.slIndex ? delete data.slIndex : null;
    this.afs
      .collection('Tenant')
      .doc(this.dbObjKey)
      .collection('templates')
      .doc(this.activeTemplate)
      .collection('customers')
      .doc(data.uid)
      .update(data);
  }

  async deleteCustomer(uid: any) {
    this.afs
      .collection('Tenant')
      .doc(this.dbObjKey)
      .collection('templates')
      .doc(this.activeTemplate)
      .collection('customers')
      .doc(uid)
      .delete();
  }

// fixCustomers() {
//     this.afs.collection('Tenant').doc(this.dbObjKey).collection('templates').doc(this.activeTemplate).collection('customers').ref.get().then((snapshot: any) => {
//         snapshot.forEach((doc: any) => {
//             // if (doc.data().fullname === 'New GuyOne' || doc.data().MRN === 'New GuyTwo') {
//             //     console.log(doc.data());
//             // }
//             this.afs.collection('Tenant').doc(this.dbObjKey).collection('templates').doc(this.activeTemplate).collection('customers').doc(doc.id).update({
//                 lastContact: {
//                     date:  Timestamp.fromDate(new Date()),
//                     result: 'Voice Message Left'
//                 }
//             })
//         })
//     })
// }


  // populateTemplateWithCustomers() {

  //     const data = this.afs.collection('Tenant').doc(this.dbObjKey).collection('templates').doc('Template One').collection('customers').ref;

  //     customers.forEach((customer) => {
  //         let id = RandomId(len, pattern)
  //         // set documents in template collection
  //         data.doc(id).set({...customer, uid: id})
  //     })
  //   }
}

// ======== FROM https://json-generator.com/ ========
// [
//     '{{repeat(25)}}',
//     {

//       fullname: '{{firstName()}} {{surname()}}',
//       phonenumber: '+1 {{phone()}}',
//       emailaddress: '{{email()}}',
//       address: '{{integer(100, 999)}} {{street()}}, {{city()}}, {{state()}}, {{integer(100, 10000)}}',
//       balance: '{{floating(0, 300, 2, "$0,0.00")}}',
//       MRN: '{{objectId()}}',
//       dob: '{{date(new Date(2000, 0, 1), new Date(), "YYYY-MM-ddThh:mm:ss Z")}}',
//       priorcontact: '{{bool()}}',
//       pending: '{{bool()}}',

//       group: function () {
//         var groups = [];
//         return groups;
//       }

//     }
//   ]
// ======== FROM https://json-generator.com/ ========

// let customers = [
//   {
//     "fullname": "Muriel Anthony",
//     "phonenumber": "(894) 577-2719",
//     "emailaddress": "murielanthony@accuprint.com",
//     "address": "629 Kings Place, Brownsville, Vermont, 5090",
//     "balance": 149.95,
//     "MRN": "62c8d4d9f94b7c14da6a3cce",
//     "dob": "2010-04-11",
//     "priorcontact": true,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Valarie Newman",
//     "phonenumber": "(983) 496-2709",
//     "emailaddress": "valarienewman@accuprint.com",
//     "address": "399 Arlington Place, Accoville, Nebraska, 8883",
//     "balance": 93.72,
//     "MRN": "62c8d4d99f64398a5ce2997a",
//     "dob": "2020-10-01",
//     "priorcontact": false,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Britney Franks",
//     "phonenumber": "(953) 442-2772",
//     "emailaddress": "britneyfranks@accuprint.com",
//     "address": "352 Kensington Walk, Mulino, Kentucky, 4342",
//     "balance": 246.98,
//     "MRN": "62c8d4d94aaf9c5c5286ca36",
//     "dob": "2007-07-09",
//     "priorcontact": false,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Figueroa Ellison",
//     "phonenumber": "(995) 550-2687",
//     "emailaddress": "figueroaellison@accuprint.com",
//     "address": "564 Powell Street, Homeland, Palau, 1364",
//     "balance": 114.11,
//     "MRN": "62c8d4d9a6dee89a37cbcf61",
//     "dob": "2006-06-21",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Lawrence Woodard",
//     "phonenumber": "(971) 533-2986",
//     "emailaddress": "lawrencewoodard@accuprint.com",
//     "address": "477 Jay Street, Devon, Idaho, 1238",
//     "balance": 248.3,
//     "MRN": "62c8d4d97e70ec818c31bf63",
//     "dob": "2011-08-05",
//     "priorcontact": true,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "David Cherry",
//     "phonenumber": "(913) 497-2676",
//     "emailaddress": "davidcherry@accuprint.com",
//     "address": "238 Dictum Court, Dodge, Missouri, 8671",
//     "balance": 107.77,
//     "MRN": "62c8d4d9f6145a718068f479",
//     "dob": "2008-06-03",
//     "priorcontact": false,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Richmond Moran",
//     "phonenumber": "(831) 409-2343",
//     "emailaddress": "richmondmoran@accuprint.com",
//     "address": "777 Mermaid Avenue, Sanders, American Samoa, 6145",
//     "balance": 181.09,
//     "MRN": "62c8d4d926dd94eb7cf8ff0b",
//     "dob": "2006-12-06",
//     "priorcontact": false,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Frankie Boyd",
//     "phonenumber": "(839) 460-2526",
//     "emailaddress": "frankieboyd@accuprint.com",
//     "address": "902 Aster Court, Woodlands, Massachusetts, 8396",
//     "balance": 248.45,
//     "MRN": "62c8d4d924436a4058708fb0",
//     "dob": "2016-01-02",
//     "priorcontact": true,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Millie Dejesus",
//     "phonenumber": "(879) 507-3183",
//     "emailaddress": "milliedejesus@accuprint.com",
//     "address": "404 Newport Street, Frierson, Montana, 943",
//     "balance": 2.01,
//     "MRN": "62c8d4d99f42ff61bf8b929d",
//     "dob": "2017-05-12",
//     "priorcontact": true,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Tamika Baker",
//     "phonenumber": "(819) 474-2973",
//     "emailaddress": "tamikabaker@accuprint.com",
//     "address": "485 Lewis Avenue, Bradenville, Virgin Islands, 5655",
//     "balance": 147.48,
//     "MRN": "62c8d4d91896f799b5f4b77d",
//     "dob": "2011-06-03",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Alexis William",
//     "phonenumber": "(833) 480-3359",
//     "emailaddress": "alexiswilliam@accuprint.com",
//     "address": "995 Rockaway Parkway, Chamberino, Oregon, 1820",
//     "balance": 231.33,
//     "MRN": "62c8d4d9bc6ab7959a40251d",
//     "dob": "2000-12-06",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Faith Sheppard",
//     "phonenumber": "(961) 428-3330",
//     "emailaddress": "faithsheppard@accuprint.com",
//     "address": "499 Greene Avenue, Brantleyville, West Virginia, 5860",
//     "balance": 113.07,
//     "MRN": "62c8d4d9ab1ebeb44161c2e6",
//     "dob": "2012-05-05",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Rachel Chen",
//     "phonenumber": "(942) 466-3905",
//     "emailaddress": "rachelchen@accuprint.com",
//     "address": "565 Cooper Street, Fairhaven, Alaska, 8835",
//     "balance": 238.23,
//     "MRN": "62c8d4d9c486437fd2ef20b3",
//     "dob": "2016-03-21",
//     "priorcontact": true,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Benita Avila",
//     "phonenumber": "(819) 521-2589",
//     "emailaddress": "benitaavila@accuprint.com",
//     "address": "287 India Street, Haring, South Dakota, 9454",
//     "balance": 142.93,
//     "MRN": "62c8d4d9dbcfe3c9c3e0e1bd",
//     "dob": "2021-11-05",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Everett Nunez",
//     "phonenumber": "(932) 548-2041",
//     "emailaddress": "everettnunez@accuprint.com",
//     "address": "653 Gates Avenue, Tivoli, Ohio, 5892",
//     "balance": 291.14,
//     "MRN": "62c8d4d9b5d15dedb8dfbba7",
//     "dob": "2006-02-22",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Jeanette Rios",
//     "phonenumber": "(987) 556-3821",
//     "emailaddress": "jeanetterios@accuprint.com",
//     "address": "844 Cameron Court, Farmington, Utah, 7359",
//     "balance": 34.11,
//     "MRN": "62c8d4d9c83308bea1b4458c",
//     "dob": "2016-09-13",
//     "priorcontact": false,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Hardin Britt",
//     "phonenumber": "(818) 551-3435",
//     "emailaddress": "hardinbritt@accuprint.com",
//     "address": "961 Forrest Street, Lloyd, Puerto Rico, 6318",
//     "balance": 284.69,
//     "MRN": "62c8d4d964e13e62e9437e44",
//     "dob": "2011-09-18",
//     "priorcontact": false,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Elma Jacobs",
//     "phonenumber": "(944) 434-3865",
//     "emailaddress": "elmajacobs@accuprint.com",
//     "address": "453 Boynton Place, Detroit, Maryland, 1909",
//     "balance": 96.65,
//     "MRN": "62c8d4d9791a0a2046886feb",
//     "dob": "2002-09-17",
//     "priorcontact": false,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Patty Silva",
//     "phonenumber": "(826) 580-2903",
//     "emailaddress": "pattysilva@accuprint.com",
//     "address": "390 Lancaster Avenue, Clara, Alabama, 3393",
//     "balance": 225.83,
//     "MRN": "62c8d4d9426bb70ddea4dbbd",
//     "dob": "2021-10-19",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Wooten Erickson",
//     "phonenumber": "(831) 429-3766",
//     "emailaddress": "wootenerickson@accuprint.com",
//     "address": "464 Garnet Street, Grenelefe, Oklahoma, 6008",
//     "balance": 212.3,
//     "MRN": "62c8d4d988c0e3feea8b8789",
//     "dob": "2006-12-16",
//     "priorcontact": false,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Dianne Ballard",
//     "phonenumber": "(919) 578-3585",
//     "emailaddress": "dianneballard@accuprint.com",
//     "address": "523 Willoughby Street, Grill, Mississippi, 4861",
//     "balance": 80.16,
//     "MRN": "62c8d4d93141267c3777f60b",
//     "dob": "2006-10-10",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Lindsay Snyder",
//     "phonenumber": "(852) 546-2620",
//     "emailaddress": "lindsaysnyder@accuprint.com",
//     "address": "589 Everit Street, Valle, Wisconsin, 8184",
//     "balance": 168.4,
//     "MRN": "62c8d4d9bccdbb1199e34447",
//     "dob": "2018-10-09",
//     "priorcontact": false,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Robertson Lawson",
//     "phonenumber": "(989) 573-2064",
//     "emailaddress": "robertsonlawson@accuprint.com",
//     "address": "843 Mill Street, Reno, Arkansas, 6452",
//     "balance": 76.71,
//     "MRN": "62c8d4d919ac0a470203b171",
//     "dob": "2015-12-21",
//     "priorcontact": true,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Gina Booth",
//     "phonenumber": "(828) 532-2392",
//     "emailaddress": "ginabooth@accuprint.com",
//     "address": "387 Rockaway Avenue, Wildwood, Federated States Of Micronesia, 7546",
//     "balance": 148.89,
//     "MRN": "62c8d4d9004e5d316921d115",
//     "dob": "2006-11-16",
//     "priorcontact": false,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Sutton Lloyd",
//     "phonenumber": "(968) 543-3452",
//     "emailaddress": "suttonlloyd@accuprint.com",
//     "address": "454 Woods Place, Grapeview, New Jersey, 9241",
//     "balance": 147.1,
//     "MRN": "62c8d4d9428e75f1dc113631",
//     "dob": "2007-05-16",
//     "priorcontact": true,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Owens Yang",
//     "phonenumber": "(812) 412-3431",
//     "emailaddress": "owensyang@accuprint.com",
//     "address": "800 Sheffield Avenue, Allamuchy, Connecticut, 759",
//     "balance": 146.1,
//     "MRN": "62c8d4d9e653c4e72c9250c2",
//     "dob": "2005-07-05",
//     "priorcontact": false,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Olga Medina",
//     "phonenumber": "(835) 507-3851",
//     "emailaddress": "olgamedina@accuprint.com",
//     "address": "504 Vanderveer Street, Northchase, Nevada, 3820",
//     "balance": 261.02,
//     "MRN": "62c8d4d9f123f9b2eb6bba22",
//     "dob": "2005-03-01",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Macias Workman",
//     "phonenumber": "(998) 413-3734",
//     "emailaddress": "maciasworkman@accuprint.com",
//     "address": "378 Lott Place, Waiohinu, South Carolina, 9820",
//     "balance": 198.04,
//     "MRN": "62c8d4d99c28d059946d68a4",
//     "dob": "2004-05-26",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Sampson Suarez",
//     "phonenumber": "(951) 540-2095",
//     "emailaddress": "sampsonsuarez@accuprint.com",
//     "address": "864 Furman Street, Bluffview, District Of Columbia, 4577",
//     "balance": 130.03,
//     "MRN": "62c8d4d9d8f6502367cd6b6e",
//     "dob": "2010-12-26",
//     "priorcontact": false,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Lowe Sloan",
//     "phonenumber": "(873) 568-2288",
//     "emailaddress": "lowesloan@accuprint.com",
//     "address": "305 Hubbard Street, Chilton, Pennsylvania, 3858",
//     "balance": 209.3,
//     "MRN": "62c8d4d9a27c50e2c5b21aba",
//     "dob": "2019-10-16",
//     "priorcontact": true,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Verna Mason",
//     "phonenumber": "(939) 485-2679",
//     "emailaddress": "vernamason@accuprint.com",
//     "address": "190 Bayard Street, Kidder, Georgia, 459",
//     "balance": 41.18,
//     "MRN": "62c8d4d9826824987d828817",
//     "dob": "2009-12-02",
//     "priorcontact": false,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Kerry Mcdonald",
//     "phonenumber": "(967) 503-3552",
//     "emailaddress": "kerrymcdonald@accuprint.com",
//     "address": "886 Front Street, Blairstown, California, 7762",
//     "balance": 36.26,
//     "MRN": "62c8d4d9479a24aa624ee6d6",
//     "dob": "2014-02-17",
//     "priorcontact": false,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Juana Allen",
//     "phonenumber": "(856) 441-2429",
//     "emailaddress": "juanaallen@accuprint.com",
//     "address": "871 Prince Street, Groton, Colorado, 6443",
//     "balance": 3.83,
//     "MRN": "62c8d4d9abe50e51e1943926",
//     "dob": "2012-07-24",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Glenna Williamson",
//     "phonenumber": "(878) 530-2998",
//     "emailaddress": "glennawilliamson@accuprint.com",
//     "address": "410 Wyckoff Avenue, Stouchsburg, Arizona, 5134",
//     "balance": 126.64,
//     "MRN": "62c8d4d9ebee74a869d2287d",
//     "dob": "2010-11-19",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Baldwin Schwartz",
//     "phonenumber": "(819) 401-3540",
//     "emailaddress": "baldwinschwartz@accuprint.com",
//     "address": "311 Woodpoint Road, Wheatfields, Minnesota, 1819",
//     "balance": 283.21,
//     "MRN": "62c8d4d916c3da3575ec0273",
//     "dob": "2004-04-20",
//     "priorcontact": false,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Candace Hendricks",
//     "phonenumber": "(814) 585-3068",
//     "emailaddress": "candacehendricks@accuprint.com",
//     "address": "212 Strong Place, Woodruff, Guam, 6651",
//     "balance": 271.03,
//     "MRN": "62c8d4d998db085284bd8289",
//     "dob": "2009-08-02",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Lewis Gates",
//     "phonenumber": "(826) 539-3916",
//     "emailaddress": "lewisgates@accuprint.com",
//     "address": "302 Duffield Street, Disautel, North Dakota, 818",
//     "balance": 55.32,
//     "MRN": "62c8d4d96603bbe94abe68b1",
//     "dob": "2016-04-15",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Erica Johns",
//     "phonenumber": "(823) 555-2957",
//     "emailaddress": "ericajohns@accuprint.com",
//     "address": "644 Pineapple Street, Catherine, Rhode Island, 4206",
//     "balance": 68.45,
//     "MRN": "62c8d4d9984c7ba25945ec97",
//     "dob": "2015-02-14",
//     "priorcontact": false,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Kennedy Oneal",
//     "phonenumber": "(938) 587-3178",
//     "emailaddress": "kennedyoneal@accuprint.com",
//     "address": "680 Legion Street, Stewartville, Tennessee, 1394",
//     "balance": 5.03,
//     "MRN": "62c8d4d9e4be0f130d99c70a",
//     "dob": "2000-09-20",
//     "priorcontact": false,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Cecilia Austin",
//     "phonenumber": "(955) 549-3574",
//     "emailaddress": "ceciliaaustin@accuprint.com",
//     "address": "203 Hendrix Street, Rosine, New York, 6968",
//     "balance": 253.82,
//     "MRN": "62c8d4d99e7f9518569e682b",
//     "dob": "2012-05-02",
//     "priorcontact": false,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Tonya Fuentes",
//     "phonenumber": "(912) 478-3329",
//     "emailaddress": "tonyafuentes@accuprint.com",
//     "address": "113 Elliott Walk, Gardiner, Iowa, 7533",
//     "balance": 3.89,
//     "MRN": "62c8d4d9d1b42796c90439b4",
//     "dob": "2008-01-26",
//     "priorcontact": false,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Velasquez Taylor",
//     "phonenumber": "(903) 480-3831",
//     "emailaddress": "velasqueztaylor@accuprint.com",
//     "address": "700 Eaton Court, Maury, North Carolina, 3570",
//     "balance": 85.22,
//     "MRN": "62c8d4d90430e116cfa28c46",
//     "dob": "2017-09-24",
//     "priorcontact": false,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Cain Floyd",
//     "phonenumber": "(996) 422-3874",
//     "emailaddress": "cainfloyd@accuprint.com",
//     "address": "250 Schaefer Street, Darlington, Delaware, 2346",
//     "balance": 245.05,
//     "MRN": "62c8d4d968c5315c85cee604",
//     "dob": "2021-06-24",
//     "priorcontact": false,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Tate Randall",
//     "phonenumber": "(886) 554-3293",
//     "emailaddress": "taterandall@accuprint.com",
//     "address": "385 Richmond Street, Camino, Wyoming, 3764",
//     "balance": 187.29,
//     "MRN": "62c8d4d9b2e27c877216a8da",
//     "dob": "2011-09-14",
//     "priorcontact": true,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Mathews Dillon",
//     "phonenumber": "(985) 496-2085",
//     "emailaddress": "mathewsdillon@accuprint.com",
//     "address": "347 Oak Street, Dunbar, Northern Mariana Islands, 4219",
//     "balance": 60.86,
//     "MRN": "62c8d4d917e94903eb34ca20",
//     "dob": "2017-08-28",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Chris Hoover",
//     "phonenumber": "(845) 484-2479",
//     "emailaddress": "chrishoover@accuprint.com",
//     "address": "184 Amherst Street, Ogema, Texas, 9252",
//     "balance": 80.89,
//     "MRN": "62c8d4d996219212b6ad9001",
//     "dob": "2020-03-22",
//     "priorcontact": true,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Genevieve Spence",
//     "phonenumber": "(989) 513-2842",
//     "emailaddress": "genevievespence@accuprint.com",
//     "address": "868 Kiely Place, Tilleda, Michigan, 6368",
//     "balance": 190.14,
//     "MRN": "62c8d4d92f3b3b7a7b379bec",
//     "dob": "2003-04-04",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Clarissa Henson",
//     "phonenumber": "(857) 586-2217",
//     "emailaddress": "clarissahenson@accuprint.com",
//     "address": "578 Bokee Court, Warren, Marshall Islands, 2975",
//     "balance": 201.56,
//     "MRN": "62c8d4d91d29663c0764bf4b",
//     "dob": "2013-03-26",
//     "priorcontact": false,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Marilyn Gallagher",
//     "phonenumber": "(901) 403-3105",
//     "emailaddress": "marilyngallagher@accuprint.com",
//     "address": "201 Meeker Avenue, Sultana, Florida, 9494",
//     "balance": 176.87,
//     "MRN": "62c8d4d9522775f29e6ed738",
//     "dob": "2003-06-07",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Schmidt Wiley",
//     "phonenumber": "(849) 508-3774",
//     "emailaddress": "schmidtwiley@accuprint.com",
//     "address": "657 Adler Place, Roberts, Maine, 511",
//     "balance": 202.13,
//     "MRN": "62c8d4d9671992a04711ad92",
//     "dob": "2013-12-19",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Henson Valencia",
//     "phonenumber": "(922) 540-3524",
//     "emailaddress": "hensonvalencia@accuprint.com",
//     "address": "788 Norwood Avenue, Seymour, Louisiana, 5624",
//     "balance": 180.07,
//     "MRN": "62c8d4d9693c2b5243bdf164",
//     "dob": "2011-04-14",
//     "priorcontact": true,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Delia Le",
//     "phonenumber": "(956) 554-2040",
//     "emailaddress": "deliale@accuprint.com",
//     "address": "590 Quincy Street, Thynedale, Virginia, 6427",
//     "balance": 124.66,
//     "MRN": "62c8d4d9b7f56520a8544834",
//     "dob": "2009-10-05",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Heath Bridges",
//     "phonenumber": "(923) 597-3308",
//     "emailaddress": "heathbridges@accuprint.com",
//     "address": "754 Claver Place, Makena, Kansas, 1999",
//     "balance": 274.98,
//     "MRN": "62c8d4d99acb83e8d45d2f52",
//     "dob": "2019-04-13",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Susie Lott",
//     "phonenumber": "(994) 416-2943",
//     "emailaddress": "susielott@accuprint.com",
//     "address": "301 Nichols Avenue, Whitestone, Indiana, 2303",
//     "balance": 267.86,
//     "MRN": "62c8d4d92758dd943777fd54",
//     "dob": "2013-06-25",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Marion Smith",
//     "phonenumber": "(995) 524-2751",
//     "emailaddress": "marionsmith@accuprint.com",
//     "address": "969 Prescott Place, Jackpot, New Hampshire, 6877",
//     "balance": 166.46,
//     "MRN": "62c8d4d91d4edd98d00a0b51",
//     "dob": "2010-06-21",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Floyd Crawford",
//     "phonenumber": "(824) 422-2229",
//     "emailaddress": "floydcrawford@accuprint.com",
//     "address": "978 Wolf Place, Bonanza, New Mexico, 4356",
//     "balance": 156.23,
//     "MRN": "62c8d4d974003c92009c87f4",
//     "dob": "2003-09-29",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Michael Stein",
//     "phonenumber": "(954) 488-2631",
//     "emailaddress": "michaelstein@accuprint.com",
//     "address": "813 Independence Avenue, Ronco, Hawaii, 9793",
//     "balance": 41.8,
//     "MRN": "62c8d4d951428ec16da872a6",
//     "dob": "2003-05-01",
//     "priorcontact": false,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Helen Warner",
//     "phonenumber": "(830) 516-2106",
//     "emailaddress": "helenwarner@accuprint.com",
//     "address": "372 Perry Terrace, Ebro, Illinois, 2372",
//     "balance": 98.8,
//     "MRN": "62c8d4d9bc8f8f12821b0d8c",
//     "dob": "2005-08-23",
//     "priorcontact": false,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Keith Fuller",
//     "phonenumber": "(971) 542-2449",
//     "emailaddress": "keithfuller@accuprint.com",
//     "address": "117 Schenectady Avenue, Macdona, Vermont, 3841",
//     "balance": 140.76,
//     "MRN": "62c8d4d93284647d1b85dab8",
//     "dob": "2021-01-25",
//     "priorcontact": true,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Karina Sparks",
//     "phonenumber": "(975) 460-2885",
//     "emailaddress": "karinasparks@accuprint.com",
//     "address": "713 Lawrence Avenue, Unionville, Nebraska, 3643",
//     "balance": 243.58,
//     "MRN": "62c8d4d96496c34cc6169b1a",
//     "dob": "2016-03-19",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Marquita Bentley",
//     "phonenumber": "(993) 570-2977",
//     "emailaddress": "marquitabentley@accuprint.com",
//     "address": "964 Nova Court, Bentley, Kentucky, 2955",
//     "balance": 238.19,
//     "MRN": "62c8d4d943428f478af401a6",
//     "dob": "2017-09-23",
//     "priorcontact": false,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Iva Vargas",
//     "phonenumber": "(922) 434-3065",
//     "emailaddress": "ivavargas@accuprint.com",
//     "address": "109 Porter Avenue, Stollings, Palau, 1644",
//     "balance": 50.28,
//     "MRN": "62c8d4d9abb00a02ddec6f88",
//     "dob": "2004-06-20",
//     "priorcontact": true,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Estelle Mcintyre",
//     "phonenumber": "(854) 584-2129",
//     "emailaddress": "estellemcintyre@accuprint.com",
//     "address": "364 Miller Place, Marne, Idaho, 7250",
//     "balance": 182.36,
//     "MRN": "62c8d4d9e1e2e8e0c297387f",
//     "dob": "2001-11-30",
//     "priorcontact": false,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Solomon Chapman",
//     "phonenumber": "(928) 567-2203",
//     "emailaddress": "solomonchapman@accuprint.com",
//     "address": "583 Bay Avenue, Glidden, Missouri, 3495",
//     "balance": 199.02,
//     "MRN": "62c8d4d977f32cb2e3d4e1e1",
//     "dob": "2020-01-31",
//     "priorcontact": false,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Chan Solomon",
//     "phonenumber": "(899) 421-3393",
//     "emailaddress": "chansolomon@accuprint.com",
//     "address": "725 Vanderveer Place, Tecolotito, American Samoa, 266",
//     "balance": 62.29,
//     "MRN": "62c8d4d902df4612f583169b",
//     "dob": "2006-08-02",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Mercer Camacho",
//     "phonenumber": "(904) 465-2926",
//     "emailaddress": "mercercamacho@accuprint.com",
//     "address": "166 Minna Street, Cobbtown, Massachusetts, 4866",
//     "balance": 206.9,
//     "MRN": "62c8d4d915deb59d5f1a4a55",
//     "dob": "2021-02-02",
//     "priorcontact": true,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Robin Weiss",
//     "phonenumber": "(889) 464-2107",
//     "emailaddress": "robinweiss@accuprint.com",
//     "address": "787 Ryerson Street, Columbus, Montana, 6248",
//     "balance": 237.83,
//     "MRN": "62c8d4d9d5dd516405fce59f",
//     "dob": "2010-09-04",
//     "priorcontact": false,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Althea Ball",
//     "phonenumber": "(834) 459-2414",
//     "emailaddress": "altheaball@accuprint.com",
//     "address": "673 Windsor Place, Dragoon, Virgin Islands, 4699",
//     "balance": 87.86,
//     "MRN": "62c8d4d90febb3732f44b281",
//     "dob": "2003-01-15",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Jocelyn Kidd",
//     "phonenumber": "(818) 493-3181",
//     "emailaddress": "jocelynkidd@accuprint.com",
//     "address": "337 Dinsmore Place, Caroline, Oregon, 9775",
//     "balance": 118.52,
//     "MRN": "62c8d4d982f2b38a527bcc26",
//     "dob": "2014-03-20",
//     "priorcontact": true,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Earline Curry",
//     "phonenumber": "(956) 562-3171",
//     "emailaddress": "earlinecurry@accuprint.com",
//     "address": "998 Highland Avenue, Adamstown, West Virginia, 3502",
//     "balance": 126.34,
//     "MRN": "62c8d4d920eaa6f604f31161",
//     "dob": "2019-08-20",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Maynard Aguirre",
//     "phonenumber": "(948) 423-2374",
//     "emailaddress": "maynardaguirre@accuprint.com",
//     "address": "670 Hanover Place, Hiwasse, Alaska, 2305",
//     "balance": 253.67,
//     "MRN": "62c8d4d958155bf0586c1ded",
//     "dob": "2015-09-25",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Constance Sanders",
//     "phonenumber": "(812) 568-3251",
//     "emailaddress": "constancesanders@accuprint.com",
//     "address": "318 Broome Street, Kapowsin, South Dakota, 5972",
//     "balance": 139.05,
//     "MRN": "62c8d4d933c4518dc6d44ac8",
//     "dob": "2007-11-19",
//     "priorcontact": false,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Bauer Valentine",
//     "phonenumber": "(971) 522-3759",
//     "emailaddress": "bauervalentine@accuprint.com",
//     "address": "671 Veterans Avenue, Nash, Ohio, 1827",
//     "balance": 72.61,
//     "MRN": "62c8d4d98b6e57e8c514033f",
//     "dob": "2013-10-21",
//     "priorcontact": false,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Mindy Ochoa",
//     "phonenumber": "(939) 446-3840",
//     "emailaddress": "mindyochoa@accuprint.com",
//     "address": "832 Bennet Court, Convent, Utah, 6177",
//     "balance": 262.47,
//     "MRN": "62c8d4d90698861cd954a0dd",
//     "dob": "2004-04-29",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Addie Hopper",
//     "phonenumber": "(965) 411-3014",
//     "emailaddress": "addiehopper@accuprint.com",
//     "address": "121 Oriental Court, Topaz, Puerto Rico, 969",
//     "balance": 236.74,
//     "MRN": "62c8d4d9fe47a351481919af",
//     "dob": "2008-02-14",
//     "priorcontact": false,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Webb Soto",
//     "phonenumber": "(894) 499-2642",
//     "emailaddress": "webbsoto@accuprint.com",
//     "address": "860 Borinquen Pl, Genoa, Maryland, 6510",
//     "balance": 169.58,
//     "MRN": "62c8d4d9d4ae68e7e06950f4",
//     "dob": "2007-12-20",
//     "priorcontact": true,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Estella Greer",
//     "phonenumber": "(844) 544-2502",
//     "emailaddress": "estellagreer@accuprint.com",
//     "address": "264 Cobek Court, Hardyville, Alabama, 9390",
//     "balance": 267.75,
//     "MRN": "62c8d4d94b1f5577c814ebff",
//     "dob": "2008-10-10",
//     "priorcontact": false,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Jenny Hewitt",
//     "phonenumber": "(888) 546-2568",
//     "emailaddress": "jennyhewitt@accuprint.com",
//     "address": "949 Whitwell Place, Rutherford, Oklahoma, 3860",
//     "balance": 153.98,
//     "MRN": "62c8d4d96db465e3487f76e0",
//     "dob": "2010-12-27",
//     "priorcontact": true,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Hendrix Ferrell",
//     "phonenumber": "(865) 414-3835",
//     "emailaddress": "hendrixferrell@accuprint.com",
//     "address": "787 Kaufman Place, Jeff, Mississippi, 8463",
//     "balance": 272.08,
//     "MRN": "62c8d4d98ca1819830606cef",
//     "dob": "2003-07-08",
//     "priorcontact": true,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Tabitha Chavez",
//     "phonenumber": "(981) 524-3963",
//     "emailaddress": "tabithachavez@accuprint.com",
//     "address": "467 Ferris Street, Carlos, Wisconsin, 8891",
//     "balance": 262.93,
//     "MRN": "62c8d4d94bbf12810bea8139",
//     "dob": "2019-02-26",
//     "priorcontact": false,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Ruth Cook",
//     "phonenumber": "(815) 526-2319",
//     "emailaddress": "ruthcook@accuprint.com",
//     "address": "842 Lincoln Place, Bridgetown, Arkansas, 4803",
//     "balance": 112.39,
//     "MRN": "62c8d4d9541b3ad1d2c3eeda",
//     "dob": "2010-04-03",
//     "priorcontact": true,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Rachael Blanchard",
//     "phonenumber": "(923) 455-2639",
//     "emailaddress": "rachaelblanchard@accuprint.com",
//     "address": "463 Tehama Street, Freelandville, Federated States Of Micronesia, 5144",
//     "balance": 204.15,
//     "MRN": "62c8d4d942aa8553bdaf3190",
//     "dob": "2008-02-11",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Lawson Best",
//     "phonenumber": "(875) 524-3769",
//     "emailaddress": "lawsonbest@accuprint.com",
//     "address": "900 Fair Street, Cochranville, New Jersey, 4601",
//     "balance": 263.74,
//     "MRN": "62c8d4d91d2f7e0ac7b12f0c",
//     "dob": "2008-03-23",
//     "priorcontact": false,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Eliza Goodman",
//     "phonenumber": "(937) 425-3333",
//     "emailaddress": "elizagoodman@accuprint.com",
//     "address": "304 Jackson Court, Alderpoint, Connecticut, 2419",
//     "balance": 22.93,
//     "MRN": "62c8d4d95f8f8f25b6ecf59c",
//     "dob": "2004-07-11",
//     "priorcontact": false,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "William Castillo",
//     "phonenumber": "(854) 442-3122",
//     "emailaddress": "williamcastillo@accuprint.com",
//     "address": "312 Aitken Place, Ola, Nevada, 2711",
//     "balance": 54.84,
//     "MRN": "62c8d4d9ac1d4af6edfc4688",
//     "dob": "2010-07-31",
//     "priorcontact": false,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Christian Bush",
//     "phonenumber": "(903) 418-3254",
//     "emailaddress": "christianbush@accuprint.com",
//     "address": "698 Ocean Court, Gouglersville, South Carolina, 1923",
//     "balance": 83.16,
//     "MRN": "62c8d4d9cb2caf1c299a656a",
//     "dob": "2011-08-08",
//     "priorcontact": false,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Monica Hartman",
//     "phonenumber": "(897) 406-3287",
//     "emailaddress": "monicahartman@accuprint.com",
//     "address": "377 Irwin Street, Monument, District Of Columbia, 8155",
//     "balance": 282.35,
//     "MRN": "62c8d4d99d54dc157cbd6ac9",
//     "dob": "2005-09-04",
//     "priorcontact": false,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Espinoza Steele",
//     "phonenumber": "(909) 549-2043",
//     "emailaddress": "espinozasteele@accuprint.com",
//     "address": "133 Fenimore Street, Harborton, Pennsylvania, 6383",
//     "balance": 83.94,
//     "MRN": "62c8d4d9307e8ddb361f9b59",
//     "dob": "2014-01-27",
//     "priorcontact": false,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Trujillo Murphy",
//     "phonenumber": "(897) 412-2209",
//     "emailaddress": "trujillomurphy@accuprint.com",
//     "address": "657 Duryea Court, Irwin, Georgia, 3433",
//     "balance": 61,
//     "MRN": "62c8d4d95041849cb53af957",
//     "dob": "2009-08-24",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Whitney Robinson",
//     "phonenumber": "(842) 587-2897",
//     "emailaddress": "whitneyrobinson@accuprint.com",
//     "address": "287 Nautilus Avenue, Lynn, California, 552",
//     "balance": 127.74,
//     "MRN": "62c8d4d99bfc2a4d582f33eb",
//     "dob": "2020-01-05",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Rowland Frank",
//     "phonenumber": "(906) 437-2887",
//     "emailaddress": "rowlandfrank@accuprint.com",
//     "address": "774 Seigel Street, Richmond, Colorado, 3263",
//     "balance": 118.45,
//     "MRN": "62c8d4d90e4b50b71613b092",
//     "dob": "2005-01-14",
//     "priorcontact": false,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Thelma Durham",
//     "phonenumber": "(855) 567-3832",
//     "emailaddress": "thelmadurham@accuprint.com",
//     "address": "622 Tiffany Place, Wyano, Arizona, 3171",
//     "balance": 152.33,
//     "MRN": "62c8d4d9a6f2d5d4b34e4bec",
//     "dob": "2004-04-27",
//     "priorcontact": true,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Randolph Miller",
//     "phonenumber": "(890) 463-2295",
//     "emailaddress": "randolphmiller@accuprint.com",
//     "address": "518 Kingsland Avenue, Bagtown, Minnesota, 2495",
//     "balance": 77.31,
//     "MRN": "62c8d4d9cfbeb9f57ff5e094",
//     "dob": "2006-06-26",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Etta Hutchinson",
//     "phonenumber": "(858) 475-3443",
//     "emailaddress": "ettahutchinson@accuprint.com",
//     "address": "184 Ovington Court, Wacissa, Guam, 6518",
//     "balance": 254.18,
//     "MRN": "62c8d4d914115194f600219a",
//     "dob": "2014-06-11",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Shaffer Dunlap",
//     "phonenumber": "(969) 595-3339",
//     "emailaddress": "shafferdunlap@accuprint.com",
//     "address": "727 Linden Boulevard, Iola, North Dakota, 2053",
//     "balance": 28.82,
//     "MRN": "62c8d4d9caeee513177123d0",
//     "dob": "2010-09-22",
//     "priorcontact": false,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Adeline Mccall",
//     "phonenumber": "(840) 568-2529",
//     "emailaddress": "adelinemccall@accuprint.com",
//     "address": "860 Coventry Road, Outlook, Rhode Island, 916",
//     "balance": 174.78,
//     "MRN": "62c8d4d99a342e74d921992f",
//     "dob": "2020-09-27",
//     "priorcontact": false,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Harding Rosales",
//     "phonenumber": "(984) 468-3121",
//     "emailaddress": "hardingrosales@accuprint.com",
//     "address": "711 Scott Avenue, Saticoy, Tennessee, 3900",
//     "balance": 175.24,
//     "MRN": "62c8d4d95f1ee7dbc95da545",
//     "dob": "2009-07-23",
//     "priorcontact": true,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Bowen Hunter",
//     "phonenumber": "(960) 587-3105",
//     "emailaddress": "bowenhunter@accuprint.com",
//     "address": "121 Lake Place, Juarez, New York, 2072",
//     "balance": 124.52,
//     "MRN": "62c8d4d9cab723d033389ccc",
//     "dob": "2008-08-07",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Chandler Love",
//     "phonenumber": "(937) 545-3501",
//     "emailaddress": "chandlerlove@accuprint.com",
//     "address": "887 Box Street, Coventry, Iowa, 1123",
//     "balance": 299.69,
//     "MRN": "62c8d4d9b5ecc22dfd7b98a1",
//     "dob": "2007-12-13",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Aida Cotton",
//     "phonenumber": "(839) 429-3542",
//     "emailaddress": "aidacotton@accuprint.com",
//     "address": "464 Barwell Terrace, Vallonia, North Carolina, 8597",
//     "balance": 148.34,
//     "MRN": "62c8d4d94af3de95024a795d",
//     "dob": "2008-07-18",
//     "priorcontact": false,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Enid Joyner",
//     "phonenumber": "(817) 458-2957",
//     "emailaddress": "enidjoyner@accuprint.com",
//     "address": "647 Oliver Street, Wollochet, Delaware, 3528",
//     "balance": 80.76,
//     "MRN": "62c8d4d9bf953242e9ddae8a",
//     "dob": "2009-11-20",
//     "priorcontact": true,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Olson Foley",
//     "phonenumber": "(954) 499-3386",
//     "emailaddress": "olsonfoley@accuprint.com",
//     "address": "529 Kent Avenue, Rodanthe, Wyoming, 913",
//     "balance": 135.67,
//     "MRN": "62c8d4d94e33b4132a37c6de",
//     "dob": "2002-04-01",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Payne Matthews",
//     "phonenumber": "(997) 442-2207",
//     "emailaddress": "paynematthews@accuprint.com",
//     "address": "323 Halleck Street, Ypsilanti, Northern Mariana Islands, 9298",
//     "balance": 60.73,
//     "MRN": "62c8d4d9670f9ca49063af02",
//     "dob": "2019-08-19",
//     "priorcontact": true,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Cummings Holmes",
//     "phonenumber": "(993) 435-3082",
//     "emailaddress": "cummingsholmes@accuprint.com",
//     "address": "761 Wogan Terrace, Lacomb, Texas, 3100",
//     "balance": 96.55,
//     "MRN": "62c8d4d90e7b517515b13ee2",
//     "dob": "2019-02-27",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Walter Hughes",
//     "phonenumber": "(995) 488-3624",
//     "emailaddress": "walterhughes@accuprint.com",
//     "address": "992 Kermit Place, Elliott, Michigan, 6782",
//     "balance": 138.15,
//     "MRN": "62c8d4d98d3545c7708c8385",
//     "dob": "2014-09-20",
//     "priorcontact": false,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Keisha Blankenship",
//     "phonenumber": "(814) 537-3196",
//     "emailaddress": "keishablankenship@accuprint.com",
//     "address": "452 Powers Street, Leland, Marshall Islands, 312",
//     "balance": 64.22,
//     "MRN": "62c8d4d911fb82d5b7d9ba52",
//     "dob": "2010-06-01",
//     "priorcontact": false,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Wendy Brennan",
//     "phonenumber": "(967) 532-2502",
//     "emailaddress": "wendybrennan@accuprint.com",
//     "address": "229 Thatford Avenue, Tyhee, Florida, 1351",
//     "balance": 12.63,
//     "MRN": "62c8d4d9d9c92ff3b925c496",
//     "dob": "2017-11-16",
//     "priorcontact": true,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Jan Sherman",
//     "phonenumber": "(931) 479-3391",
//     "emailaddress": "jansherman@accuprint.com",
//     "address": "733 Opal Court, Glendale, Maine, 3453",
//     "balance": 276.72,
//     "MRN": "62c8d4d98e5bdfb4d481706a",
//     "dob": "2012-12-28",
//     "priorcontact": false,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Pam Slater",
//     "phonenumber": "(861) 465-3645",
//     "emailaddress": "pamslater@accuprint.com",
//     "address": "494 Noble Street, Ona, Louisiana, 4666",
//     "balance": 175.62,
//     "MRN": "62c8d4d95d8a7e7db9aa7ed6",
//     "dob": "2003-03-15",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Elva Craft",
//     "phonenumber": "(880) 451-3440",
//     "emailaddress": "elvacraft@accuprint.com",
//     "address": "715 Dank Court, Frystown, Virginia, 8591",
//     "balance": 267.04,
//     "MRN": "62c8d4d93dc58b1be1386e88",
//     "dob": "2001-06-06",
//     "priorcontact": true,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Lorna Sanford",
//     "phonenumber": "(947) 562-2729",
//     "emailaddress": "lornasanford@accuprint.com",
//     "address": "481 Canarsie Road, Nicut, Kansas, 6523",
//     "balance": 165.17,
//     "MRN": "62c8d4d959e9a7edba3e9743",
//     "dob": "2010-09-10",
//     "priorcontact": false,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Nell Hardy",
//     "phonenumber": "(857) 471-3680",
//     "emailaddress": "nellhardy@accuprint.com",
//     "address": "364 Luquer Street, Fairview, Indiana, 754",
//     "balance": 17.98,
//     "MRN": "62c8d4d9008a5c05c7eebbee",
//     "dob": "2005-09-26",
//     "priorcontact": false,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Mariana Benjamin",
//     "phonenumber": "(869) 547-2920",
//     "emailaddress": "marianabenjamin@accuprint.com",
//     "address": "153 Dupont Street, Ellerslie, New Hampshire, 6171",
//     "balance": 139.52,
//     "MRN": "62c8d4d9b6b953ba829a3f8c",
//     "dob": "2010-06-12",
//     "priorcontact": false,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Case Flores",
//     "phonenumber": "(806) 453-2249",
//     "emailaddress": "caseflores@accuprint.com",
//     "address": "727 Stuyvesant Avenue, Wolcott, New Mexico, 7953",
//     "balance": 199.99,
//     "MRN": "62c8d4d9b62cbb46de069b00",
//     "dob": "2002-04-15",
//     "priorcontact": false,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Velez Jones",
//     "phonenumber": "(993) 420-3724",
//     "emailaddress": "velezjones@accuprint.com",
//     "address": "390 Newkirk Avenue, Mayfair, Hawaii, 3175",
//     "balance": 193.05,
//     "MRN": "62c8d4d9a4f1ea97b079b30b",
//     "dob": "2000-11-22",
//     "priorcontact": false,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Kerri French",
//     "phonenumber": "(821) 582-3574",
//     "emailaddress": "kerrifrench@accuprint.com",
//     "address": "697 Hillel Place, Chase, Illinois, 3311",
//     "balance": 61.61,
//     "MRN": "62c8d4d91b6b35466b9a13f7",
//     "dob": "2013-03-14",
//     "priorcontact": false,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Moody Byrd",
//     "phonenumber": "(986) 408-2854",
//     "emailaddress": "moodybyrd@accuprint.com",
//     "address": "865 Morgan Avenue, Stevens, Vermont, 7113",
//     "balance": 133.79,
//     "MRN": "62c8d4d96c2225a9f4f262a7",
//     "dob": "2010-08-16",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Gloria Graves",
//     "phonenumber": "(816) 566-2472",
//     "emailaddress": "gloriagraves@accuprint.com",
//     "address": "826 Devon Avenue, Shaft, Nebraska, 6404",
//     "balance": 211.36,
//     "MRN": "62c8d4d99a5c831896f680b8",
//     "dob": "2017-09-04",
//     "priorcontact": false,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Caroline Jefferson",
//     "phonenumber": "(896) 591-3142",
//     "emailaddress": "carolinejefferson@accuprint.com",
//     "address": "637 Lincoln Road, Rew, Kentucky, 5349",
//     "balance": 54.93,
//     "MRN": "62c8d4d9f2b562df19137cb3",
//     "dob": "2015-06-23",
//     "priorcontact": false,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Larson Ramos",
//     "phonenumber": "(838) 593-2344",
//     "emailaddress": "larsonramos@accuprint.com",
//     "address": "459 Louis Place, Comptche, Palau, 7365",
//     "balance": 126.87,
//     "MRN": "62c8d4d993ba1ba392a2d097",
//     "dob": "2016-09-22",
//     "priorcontact": false,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Gabriela Cooke",
//     "phonenumber": "(875) 566-2239",
//     "emailaddress": "gabrielacooke@accuprint.com",
//     "address": "163 Homecrest Avenue, Keyport, Idaho, 6909",
//     "balance": 22.46,
//     "MRN": "62c8d4d9a0e705d8cf4954ca",
//     "dob": "2001-04-07",
//     "priorcontact": false,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Campbell Middleton",
//     "phonenumber": "(870) 568-2763",
//     "emailaddress": "campbellmiddleton@accuprint.com",
//     "address": "113 Tillary Street, Libertytown, Missouri, 360",
//     "balance": 148.43,
//     "MRN": "62c8d4d9c0785d81d3a434cc",
//     "dob": "2018-04-10",
//     "priorcontact": false,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Kara Rowland",
//     "phonenumber": "(896) 600-2643",
//     "emailaddress": "kararowland@accuprint.com",
//     "address": "361 Dorchester Road, Matheny, American Samoa, 7276",
//     "balance": 90.77,
//     "MRN": "62c8d4d9b0c70ed579449ddb",
//     "dob": "2011-05-15",
//     "priorcontact": true,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Cox Huff",
//     "phonenumber": "(978) 476-3295",
//     "emailaddress": "coxhuff@accuprint.com",
//     "address": "281 Fane Court, Dorneyville, Massachusetts, 8167",
//     "balance": 151.63,
//     "MRN": "62c8d4d939f73aec03c2b23f",
//     "dob": "2001-05-03",
//     "priorcontact": false,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Garrison Collier",
//     "phonenumber": "(996) 466-2342",
//     "emailaddress": "garrisoncollier@accuprint.com",
//     "address": "239 Radde Place, Belmont, Montana, 9748",
//     "balance": 113.76,
//     "MRN": "62c8d4d90b830c5a4d683a7c",
//     "dob": "2008-08-09",
//     "priorcontact": false,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Thompson Banks",
//     "phonenumber": "(829) 464-3220",
//     "emailaddress": "thompsonbanks@accuprint.com",
//     "address": "570 Nolans Lane, Loomis, Virgin Islands, 7246",
//     "balance": 196.83,
//     "MRN": "62c8d4d99478ca2593b317b0",
//     "dob": "2003-11-17",
//     "priorcontact": false,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Ware Myers",
//     "phonenumber": "(874) 508-2227",
//     "emailaddress": "waremyers@accuprint.com",
//     "address": "892 Harwood Place, Sardis, Oregon, 9070",
//     "balance": 16.89,
//     "MRN": "62c8d4d9e03d61d9e0b70f82",
//     "dob": "2006-03-22",
//     "priorcontact": true,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Robert Kerr",
//     "phonenumber": "(853) 429-3754",
//     "emailaddress": "robertkerr@accuprint.com",
//     "address": "906 Dodworth Street, Manchester, West Virginia, 2432",
//     "balance": 248.6,
//     "MRN": "62c8d4d9bd77c3744b626035",
//     "dob": "2015-06-24",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Lidia Schultz",
//     "phonenumber": "(923) 440-3303",
//     "emailaddress": "lidiaschultz@accuprint.com",
//     "address": "824 Seigel Court, Bowden, Alaska, 1670",
//     "balance": 247.84,
//     "MRN": "62c8d4d9b994c2bc1713c3e0",
//     "dob": "2005-01-17",
//     "priorcontact": false,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Nielsen Flowers",
//     "phonenumber": "(801) 445-2242",
//     "emailaddress": "nielsenflowers@accuprint.com",
//     "address": "886 Engert Avenue, Savannah, South Dakota, 2124",
//     "balance": 0.89,
//     "MRN": "62c8d4d917d006d473fb3f4d",
//     "dob": "2015-03-29",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Annie Richardson",
//     "phonenumber": "(886) 526-2034",
//     "emailaddress": "annierichardson@accuprint.com",
//     "address": "252 Bulwer Place, Brady, Ohio, 367",
//     "balance": 40.24,
//     "MRN": "62c8d4d9dfbf9225a3d672e1",
//     "dob": "2002-11-15",
//     "priorcontact": false,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Flynn Lindsay",
//     "phonenumber": "(826) 478-3714",
//     "emailaddress": "flynnlindsay@accuprint.com",
//     "address": "169 Dikeman Street, Vowinckel, Utah, 8794",
//     "balance": 43.33,
//     "MRN": "62c8d4d9fbe9bf6bf907d944",
//     "dob": "2006-01-14",
//     "priorcontact": true,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Mcgowan Black",
//     "phonenumber": "(924) 555-2377",
//     "emailaddress": "mcgowanblack@accuprint.com",
//     "address": "713 Quay Street, Allison, Puerto Rico, 9101",
//     "balance": 191.74,
//     "MRN": "62c8d4d9a8caffdfbe671f6d",
//     "dob": "2013-04-17",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Langley Espinoza",
//     "phonenumber": "(866) 510-3328",
//     "emailaddress": "langleyespinoza@accuprint.com",
//     "address": "915 Malbone Street, Idamay, Maryland, 4413",
//     "balance": 150.72,
//     "MRN": "62c8d4d987cc6eabd179aaa3",
//     "dob": "2007-06-04",
//     "priorcontact": true,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Mamie Vaughn",
//     "phonenumber": "(950) 542-3865",
//     "emailaddress": "mamievaughn@accuprint.com",
//     "address": "282 Polar Street, Harold, Alabama, 7416",
//     "balance": 21.39,
//     "MRN": "62c8d4d9801c55c4a48fb184",
//     "dob": "2007-07-22",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Juliet Adams",
//     "phonenumber": "(854) 556-3191",
//     "emailaddress": "julietadams@accuprint.com",
//     "address": "625 Tapscott Street, Linganore, Oklahoma, 6217",
//     "balance": 29.69,
//     "MRN": "62c8d4d915a8a6f178cfbb04",
//     "dob": "2015-01-05",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Mollie Powell",
//     "phonenumber": "(850) 430-3650",
//     "emailaddress": "molliepowell@accuprint.com",
//     "address": "145 Anna Court, Grahamtown, Mississippi, 9015",
//     "balance": 215.95,
//     "MRN": "62c8d4d9eb74ee74882c00e7",
//     "dob": "2013-07-24",
//     "priorcontact": false,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Fisher Manning",
//     "phonenumber": "(917) 582-2559",
//     "emailaddress": "fishermanning@accuprint.com",
//     "address": "693 Rodney Street, Nile, Wisconsin, 7648",
//     "balance": 128.08,
//     "MRN": "62c8d4d9e2ec3e16f34fe088",
//     "dob": "2020-08-13",
//     "priorcontact": false,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Rene Thompson",
//     "phonenumber": "(932) 548-3101",
//     "emailaddress": "renethompson@accuprint.com",
//     "address": "738 Woodruff Avenue, Glenville, Arkansas, 1631",
//     "balance": 161.62,
//     "MRN": "62c8d4d9aa288bc334bc11ec",
//     "dob": "2005-10-18",
//     "priorcontact": false,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Pamela Mclean",
//     "phonenumber": "(824) 582-2331",
//     "emailaddress": "pamelamclean@accuprint.com",
//     "address": "737 Richards Street, Dixie, Federated States Of Micronesia, 1437",
//     "balance": 107.09,
//     "MRN": "62c8d4d9dcd0e021babd4e49",
//     "dob": "2018-05-04",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Adkins Leach",
//     "phonenumber": "(870) 402-3662",
//     "emailaddress": "adkinsleach@accuprint.com",
//     "address": "629 Dekalb Avenue, Stonybrook, New Jersey, 7390",
//     "balance": 195.54,
//     "MRN": "62c8d4d97eeb58b51b46cb13",
//     "dob": "2011-03-09",
//     "priorcontact": false,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Leanne Cabrera",
//     "phonenumber": "(803) 576-2050",
//     "emailaddress": "leannecabrera@accuprint.com",
//     "address": "607 Vandervoort Avenue, Johnsonburg, Connecticut, 7255",
//     "balance": 43.23,
//     "MRN": "62c8d4d9975953065c032069",
//     "dob": "2007-02-08",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Branch Harrington",
//     "phonenumber": "(944) 439-3665",
//     "emailaddress": "branchharrington@accuprint.com",
//     "address": "442 Bay Parkway, Bakersville, Nevada, 5357",
//     "balance": 106.87,
//     "MRN": "62c8d4d9d3bf3a04483de04b",
//     "dob": "2007-01-04",
//     "priorcontact": false,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Valerie Foster",
//     "phonenumber": "(926) 405-3964",
//     "emailaddress": "valeriefoster@accuprint.com",
//     "address": "963 Mayfair Drive, Sparkill, South Carolina, 693",
//     "balance": 204.56,
//     "MRN": "62c8d4d9237cc11644aaad40",
//     "dob": "2013-10-12",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Lessie Walton",
//     "phonenumber": "(827) 586-3783",
//     "emailaddress": "lessiewalton@accuprint.com",
//     "address": "540 Homecrest Court, Otranto, District Of Columbia, 813",
//     "balance": 253.95,
//     "MRN": "62c8d4d97bc1a4d0ae16f258",
//     "dob": "2015-10-28",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Waller Park",
//     "phonenumber": "(888) 567-2505",
//     "emailaddress": "wallerpark@accuprint.com",
//     "address": "327 Campus Place, Nadine, Pennsylvania, 6511",
//     "balance": 254.46,
//     "MRN": "62c8d4d99b0f8bda85f8c289",
//     "dob": "2007-08-10",
//     "priorcontact": true,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Chang Woodward",
//     "phonenumber": "(823) 475-2979",
//     "emailaddress": "changwoodward@accuprint.com",
//     "address": "166 Jackson Place, Tyro, Georgia, 9510",
//     "balance": 75.19,
//     "MRN": "62c8d4d9691493a990aa12d3",
//     "dob": "2014-06-27",
//     "priorcontact": false,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Glass Berry",
//     "phonenumber": "(904) 553-2011",
//     "emailaddress": "glassberry@accuprint.com",
//     "address": "455 Delevan Street, Henrietta, California, 3443",
//     "balance": 287.98,
//     "MRN": "62c8d4d994e71ceca703f967",
//     "dob": "2015-07-21",
//     "priorcontact": true,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Audra Shaffer",
//     "phonenumber": "(943) 553-2418",
//     "emailaddress": "audrashaffer@accuprint.com",
//     "address": "162 Polhemus Place, Vincent, Colorado, 6084",
//     "balance": 182.04,
//     "MRN": "62c8d4d980039d3522d3c29d",
//     "dob": "2016-10-27",
//     "priorcontact": false,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Roth Barrett",
//     "phonenumber": "(934) 432-2751",
//     "emailaddress": "rothbarrett@accuprint.com",
//     "address": "153 Hinsdale Street, Sims, Arizona, 5552",
//     "balance": 285.97,
//     "MRN": "62c8d4d9e5b172d2658e4857",
//     "dob": "2012-08-18",
//     "priorcontact": false,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Blevins Davenport",
//     "phonenumber": "(950) 428-2060",
//     "emailaddress": "blevinsdavenport@accuprint.com",
//     "address": "603 Portal Street, Lisco, Minnesota, 8185",
//     "balance": 203.76,
//     "MRN": "62c8d4d9b93d57e9a567e6e1",
//     "dob": "2008-06-19",
//     "priorcontact": true,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Lara Vinson",
//     "phonenumber": "(896) 425-3634",
//     "emailaddress": "laravinson@accuprint.com",
//     "address": "195 Kenilworth Place, Urbana, Guam, 7702",
//     "balance": 284.97,
//     "MRN": "62c8d4d990e72f32a97f4f8e",
//     "dob": "2003-10-19",
//     "priorcontact": false,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Alana Nolan",
//     "phonenumber": "(833) 527-2577",
//     "emailaddress": "alananolan@accuprint.com",
//     "address": "537 Stryker Court, Chical, North Dakota, 1414",
//     "balance": 143.01,
//     "MRN": "62c8d4d983f1ffefd3c42c24",
//     "dob": "2004-07-06",
//     "priorcontact": false,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Vanessa Burnett",
//     "phonenumber": "(914) 493-3434",
//     "emailaddress": "vanessaburnett@accuprint.com",
//     "address": "164 Chapel Street, Greenbackville, Rhode Island, 8507",
//     "balance": 97.68,
//     "MRN": "62c8d4d9fe2e15214ecc69f0",
//     "dob": "2003-02-12",
//     "priorcontact": false,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Kline Horne",
//     "phonenumber": "(874) 470-3869",
//     "emailaddress": "klinehorne@accuprint.com",
//     "address": "346 Williams Court, Fidelis, Tennessee, 1268",
//     "balance": 90.09,
//     "MRN": "62c8d4d9a352f88c40bf1e51",
//     "dob": "2013-06-26",
//     "priorcontact": false,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Twila Wiggins",
//     "phonenumber": "(937) 460-2502",
//     "emailaddress": "twilawiggins@accuprint.com",
//     "address": "301 Suydam Street, Stockdale, New York, 7091",
//     "balance": 130.39,
//     "MRN": "62c8d4d959eae6f82b17ce5d",
//     "dob": "2013-02-12",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Flossie Livingston",
//     "phonenumber": "(838) 463-3177",
//     "emailaddress": "flossielivingston@accuprint.com",
//     "address": "657 Friel Place, Silkworth, Iowa, 5661",
//     "balance": 294.79,
//     "MRN": "62c8d4d9b8bcdfb013144720",
//     "dob": "2008-02-19",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Inez Goodwin",
//     "phonenumber": "(886) 580-3488",
//     "emailaddress": "inezgoodwin@accuprint.com",
//     "address": "142 Chauncey Street, Cressey, North Carolina, 8458",
//     "balance": 60.09,
//     "MRN": "62c8d4d9029e7ba05c6ccb60",
//     "dob": "2005-02-27",
//     "priorcontact": true,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Ginger Fowler",
//     "phonenumber": "(933) 548-3601",
//     "emailaddress": "gingerfowler@accuprint.com",
//     "address": "901 Grimes Road, Kerby, Delaware, 5108",
//     "balance": 226.36,
//     "MRN": "62c8d4d9b1fd71758609fa4d",
//     "dob": "2009-12-06",
//     "priorcontact": false,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Warner Duke",
//     "phonenumber": "(990) 536-2173",
//     "emailaddress": "warnerduke@accuprint.com",
//     "address": "214 Jerome Street, Cumminsville, Wyoming, 6749",
//     "balance": 252.87,
//     "MRN": "62c8d4d9c5907cda3ecf4f78",
//     "dob": "2000-08-17",
//     "priorcontact": true,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Hodge Mckay",
//     "phonenumber": "(987) 479-2593",
//     "emailaddress": "hodgemckay@accuprint.com",
//     "address": "716 Louise Terrace, Fillmore, Northern Mariana Islands, 2542",
//     "balance": 85.74,
//     "MRN": "62c8d4d9b31d1b709641dbce",
//     "dob": "2020-10-14",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Jody Ramirez",
//     "phonenumber": "(975) 428-2583",
//     "emailaddress": "jodyramirez@accuprint.com",
//     "address": "774 Bond Street, Greenfields, Texas, 5246",
//     "balance": 152.78,
//     "MRN": "62c8d4d910d63a769ce55fa4",
//     "dob": "2016-08-15",
//     "priorcontact": false,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Lynn Velez",
//     "phonenumber": "(850) 514-2489",
//     "emailaddress": "lynnvelez@accuprint.com",
//     "address": "708 Hill Street, Gloucester, Michigan, 3906",
//     "balance": 17.17,
//     "MRN": "62c8d4d96686dc9c1e01a843",
//     "dob": "2007-12-21",
//     "priorcontact": true,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Young Strong",
//     "phonenumber": "(990) 447-2862",
//     "emailaddress": "youngstrong@accuprint.com",
//     "address": "462 Huron Street, Caledonia, Marshall Islands, 9535",
//     "balance": 266.37,
//     "MRN": "62c8d4d9e58e4b4229d3be7f",
//     "dob": "2020-11-08",
//     "priorcontact": false,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Elvira Hampton",
//     "phonenumber": "(938) 475-2046",
//     "emailaddress": "elvirahampton@accuprint.com",
//     "address": "767 Laurel Avenue, Starks, Florida, 9722",
//     "balance": 38.51,
//     "MRN": "62c8d4d965085fdcfc0ec7c4",
//     "dob": "2001-03-26",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Haynes Herrera",
//     "phonenumber": "(888) 568-2573",
//     "emailaddress": "haynesherrera@accuprint.com",
//     "address": "920 Monroe Street, Dexter, Maine, 2231",
//     "balance": 242.97,
//     "MRN": "62c8d4d9167797e8a494341f",
//     "dob": "2015-01-19",
//     "priorcontact": true,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Denise Johnston",
//     "phonenumber": "(822) 545-2697",
//     "emailaddress": "denisejohnston@accuprint.com",
//     "address": "741 Hamilton Avenue, Russellville, Louisiana, 1835",
//     "balance": 201.23,
//     "MRN": "62c8d4d9bfa993069dd4889d",
//     "dob": "2005-03-15",
//     "priorcontact": true,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Olive Wheeler",
//     "phonenumber": "(953) 421-2597",
//     "emailaddress": "olivewheeler@accuprint.com",
//     "address": "655 Fleet Walk, Ada, Virginia, 1246",
//     "balance": 245.26,
//     "MRN": "62c8d4d98167506d253e4223",
//     "dob": "2005-03-21",
//     "priorcontact": true,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Clay Frederick",
//     "phonenumber": "(885) 497-3891",
//     "emailaddress": "clayfrederick@accuprint.com",
//     "address": "338 Dover Street, Bourg, Kansas, 887",
//     "balance": 257.89,
//     "MRN": "62c8d4d952f6cf6499c3dd1a",
//     "dob": "2001-03-30",
//     "priorcontact": false,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Slater Nichols",
//     "phonenumber": "(900) 576-2460",
//     "emailaddress": "slaternichols@accuprint.com",
//     "address": "771 Rugby Road, Statenville, Indiana, 3574",
//     "balance": 178.71,
//     "MRN": "62c8d4d90f1e6750ec91eaa7",
//     "dob": "2018-10-05",
//     "priorcontact": false,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Leonor Kemp",
//     "phonenumber": "(869) 533-3843",
//     "emailaddress": "leonorkemp@accuprint.com",
//     "address": "320 Woodside Avenue, Eagletown, New Hampshire, 4597",
//     "balance": 210.77,
//     "MRN": "62c8d4d924951b2e2f822de7",
//     "dob": "2011-09-18",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Chaney Downs",
//     "phonenumber": "(852) 457-3255",
//     "emailaddress": "chaneydowns@accuprint.com",
//     "address": "485 Fulton Street, Clarksburg, New Mexico, 1516",
//     "balance": 113.57,
//     "MRN": "62c8d4d90fc526b409921ad2",
//     "dob": "2004-04-10",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Hopper Richmond",
//     "phonenumber": "(893) 478-2746",
//     "emailaddress": "hopperrichmond@accuprint.com",
//     "address": "318 Meserole Avenue, Madrid, Hawaii, 6814",
//     "balance": 120.18,
//     "MRN": "62c8d4d9e8c84feef711717d",
//     "dob": "2022-06-24",
//     "priorcontact": true,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Hester Fernandez",
//     "phonenumber": "(801) 486-3631",
//     "emailaddress": "hesterfernandez@accuprint.com",
//     "address": "172 Bragg Court, Chelsea, Illinois, 7910",
//     "balance": 293.29,
//     "MRN": "62c8d4d913634fd35504abbd",
//     "dob": "2002-03-26",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Oneal Price",
//     "phonenumber": "(848) 512-3960",
//     "emailaddress": "onealprice@accuprint.com",
//     "address": "628 Bevy Court, Veguita, Vermont, 8975",
//     "balance": 124.3,
//     "MRN": "62c8d4d98501f9a678aaebc7",
//     "dob": "2001-08-06",
//     "priorcontact": false,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Patrick Jacobson",
//     "phonenumber": "(980) 489-2720",
//     "emailaddress": "patrickjacobson@accuprint.com",
//     "address": "673 Hancock Street, Crayne, Nebraska, 749",
//     "balance": 43.63,
//     "MRN": "62c8d4d953386a9034501c56",
//     "dob": "2011-01-12",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Mcknight Webb",
//     "phonenumber": "(805) 543-3706",
//     "emailaddress": "mcknightwebb@accuprint.com",
//     "address": "687 Herkimer Place, Montura, Kentucky, 9819",
//     "balance": 265.48,
//     "MRN": "62c8d4d9746c73b2845bcb02",
//     "dob": "2011-03-26",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Callahan Knox",
//     "phonenumber": "(913) 474-2137",
//     "emailaddress": "callahanknox@accuprint.com",
//     "address": "532 Narrows Avenue, Leyner, Palau, 9391",
//     "balance": 153.54,
//     "MRN": "62c8d4d92cd33daee69f1970",
//     "dob": "2001-01-02",
//     "priorcontact": true,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Merle Long",
//     "phonenumber": "(998) 581-3413",
//     "emailaddress": "merlelong@accuprint.com",
//     "address": "400 Bancroft Place, Klagetoh, Idaho, 9628",
//     "balance": 41.32,
//     "MRN": "62c8d4d9ff5d46c05bb8b73f",
//     "dob": "2009-05-10",
//     "priorcontact": true,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Sonja Foreman",
//     "phonenumber": "(842) 531-3271",
//     "emailaddress": "sonjaforeman@accuprint.com",
//     "address": "922 Osborn Street, Bend, Missouri, 5618",
//     "balance": 39.53,
//     "MRN": "62c8d4d9143640243766b038",
//     "dob": "2014-02-26",
//     "priorcontact": false,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Barnes Morin",
//     "phonenumber": "(827) 428-2881",
//     "emailaddress": "barnesmorin@accuprint.com",
//     "address": "250 Bergen Street, Rehrersburg, American Samoa, 1228",
//     "balance": 268.16,
//     "MRN": "62c8d4d92991bce3c9a0340a",
//     "dob": "2006-11-28",
//     "priorcontact": true,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Sloan Simpson",
//     "phonenumber": "(909) 489-3608",
//     "emailaddress": "sloansimpson@accuprint.com",
//     "address": "325 Cranberry Street, Kenmar, Massachusetts, 2797",
//     "balance": 154.9,
//     "MRN": "62c8d4d9fd88e3c09427383d",
//     "dob": "2019-12-01",
//     "priorcontact": false,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Eve Burke",
//     "phonenumber": "(923) 546-3084",
//     "emailaddress": "eveburke@accuprint.com",
//     "address": "663 Lake Street, Sutton, Montana, 2101",
//     "balance": 108.68,
//     "MRN": "62c8d4d9f6e3a75c994b7e8f",
//     "dob": "2020-09-05",
//     "priorcontact": true,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Leann Mendez",
//     "phonenumber": "(942) 486-3720",
//     "emailaddress": "leannmendez@accuprint.com",
//     "address": "817 Henderson Walk, Barstow, Virgin Islands, 1788",
//     "balance": 298.05,
//     "MRN": "62c8d4d95e2fdaf6e023107b",
//     "dob": "2004-06-25",
//     "priorcontact": false,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Hollie Garner",
//     "phonenumber": "(870) 539-2604",
//     "emailaddress": "holliegarner@accuprint.com",
//     "address": "986 Stratford Road, Ventress, Oregon, 5825",
//     "balance": 253.53,
//     "MRN": "62c8d4d982b5a2a6a25203d8",
//     "dob": "2010-05-11",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Tessa Lopez",
//     "phonenumber": "(809) 444-2895",
//     "emailaddress": "tessalopez@accuprint.com",
//     "address": "923 Varick Avenue, Clarktown, West Virginia, 4039",
//     "balance": 117.63,
//     "MRN": "62c8d4d9a70dcfe256873552",
//     "dob": "2000-03-15",
//     "priorcontact": true,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Suzette Bennett",
//     "phonenumber": "(907) 586-2376",
//     "emailaddress": "suzettebennett@accuprint.com",
//     "address": "542 Fillmore Avenue, Waverly, Alaska, 6561",
//     "balance": 195.93,
//     "MRN": "62c8d4d98ea15da388b81dc8",
//     "dob": "2019-12-03",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "June Burris",
//     "phonenumber": "(805) 488-3654",
//     "emailaddress": "juneburris@accuprint.com",
//     "address": "228 River Street, Vicksburg, South Dakota, 4256",
//     "balance": 130.32,
//     "MRN": "62c8d4d9365d8536c7a61b41",
//     "dob": "2004-11-29",
//     "priorcontact": false,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Rogers Underwood",
//     "phonenumber": "(838) 559-3388",
//     "emailaddress": "rogersunderwood@accuprint.com",
//     "address": "504 Wyckoff Street, Hampstead, Ohio, 1068",
//     "balance": 55.33,
//     "MRN": "62c8d4d906c88e206adef117",
//     "dob": "2020-04-10",
//     "priorcontact": false,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Carey Cohen",
//     "phonenumber": "(854) 444-3774",
//     "emailaddress": "careycohen@accuprint.com",
//     "address": "680 Kay Court, Volta, Utah, 4811",
//     "balance": 161.21,
//     "MRN": "62c8d4d9aa1f4ffa7ce50d9e",
//     "dob": "2009-06-29",
//     "priorcontact": true,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Meagan Bishop",
//     "phonenumber": "(997) 471-3767",
//     "emailaddress": "meaganbishop@accuprint.com",
//     "address": "203 Randolph Street, Hessville, Puerto Rico, 682",
//     "balance": 45.53,
//     "MRN": "62c8d4d9c21c4e9f5bc62a41",
//     "dob": "2015-12-03",
//     "priorcontact": false,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Knapp Holman",
//     "phonenumber": "(975) 548-3962",
//     "emailaddress": "knappholman@accuprint.com",
//     "address": "871 High Street, Lumberton, Maryland, 2810",
//     "balance": 75.77,
//     "MRN": "62c8d4d942ca00ffa9a88bc6",
//     "dob": "2006-11-16",
//     "priorcontact": true,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Boyd Hebert",
//     "phonenumber": "(993) 437-2612",
//     "emailaddress": "boydhebert@accuprint.com",
//     "address": "456 Montieth Street, Cascades, Alabama, 1454",
//     "balance": 220.34,
//     "MRN": "62c8d4d9019400cd3cacc97e",
//     "dob": "2012-05-24",
//     "priorcontact": true,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Lelia Mejia",
//     "phonenumber": "(874) 477-3506",
//     "emailaddress": "leliamejia@accuprint.com",
//     "address": "535 Dobbin Street, Remington, Oklahoma, 5840",
//     "balance": 113.67,
//     "MRN": "62c8d4d9d14fe5fef3753dfc",
//     "dob": "2018-08-29",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Rebecca Valdez",
//     "phonenumber": "(874) 414-2706",
//     "emailaddress": "rebeccavaldez@accuprint.com",
//     "address": "895 Stillwell Place, Nettie, Mississippi, 959",
//     "balance": 9.54,
//     "MRN": "62c8d4d957f30eb6357c3441",
//     "dob": "2013-07-24",
//     "priorcontact": false,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Workman Gallegos",
//     "phonenumber": "(953) 427-3287",
//     "emailaddress": "workmangallegos@accuprint.com",
//     "address": "574 Cedar Street, Lookingglass, Wisconsin, 1776",
//     "balance": 26.38,
//     "MRN": "62c8d4d93b95e619895f8496",
//     "dob": "2013-01-02",
//     "priorcontact": false,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Stout Hurst",
//     "phonenumber": "(842) 447-2663",
//     "emailaddress": "stouthurst@accuprint.com",
//     "address": "269 Belmont Avenue, Ferney, Arkansas, 5546",
//     "balance": 53.67,
//     "MRN": "62c8d4d944c04866e057213a",
//     "dob": "2011-03-10",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Wolf Cline",
//     "phonenumber": "(934) 491-2998",
//     "emailaddress": "wolfcline@accuprint.com",
//     "address": "516 Clinton Street, Belvoir, Federated States Of Micronesia, 5590",
//     "balance": 84.62,
//     "MRN": "62c8d4d966a6654d1ec001d4",
//     "dob": "2006-12-01",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Fanny Cooper",
//     "phonenumber": "(871) 495-2863",
//     "emailaddress": "fannycooper@accuprint.com",
//     "address": "871 Boerum Street, Hinsdale, New Jersey, 7067",
//     "balance": 72.73,
//     "MRN": "62c8d4d94d60523cb49328f3",
//     "dob": "2003-08-18",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Tanner Head",
//     "phonenumber": "(824) 466-3448",
//     "emailaddress": "tannerhead@accuprint.com",
//     "address": "129 Howard Alley, Gasquet, Connecticut, 993",
//     "balance": 11.89,
//     "MRN": "62c8d4d9adc46ce5a4c423d6",
//     "dob": "2021-04-13",
//     "priorcontact": true,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Odessa Buchanan",
//     "phonenumber": "(906) 442-2464",
//     "emailaddress": "odessabuchanan@accuprint.com",
//     "address": "731 Clermont Avenue, Lavalette, Nevada, 9479",
//     "balance": 44.47,
//     "MRN": "62c8d4d93e50b3d977ea1ab7",
//     "dob": "2014-11-03",
//     "priorcontact": false,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Buchanan Moss",
//     "phonenumber": "(958) 496-3197",
//     "emailaddress": "buchananmoss@accuprint.com",
//     "address": "966 Lenox Road, Hackneyville, South Carolina, 3480",
//     "balance": 103.52,
//     "MRN": "62c8d4d9c621285d83855b2b",
//     "dob": "2013-04-11",
//     "priorcontact": false,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Austin Mcpherson",
//     "phonenumber": "(833) 464-2382",
//     "emailaddress": "austinmcpherson@accuprint.com",
//     "address": "193 Navy Walk, Hanover, District Of Columbia, 9351",
//     "balance": 212.85,
//     "MRN": "62c8d4d9718e9bd5db5e8766",
//     "dob": "2011-11-10",
//     "priorcontact": false,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Nikki Mendoza",
//     "phonenumber": "(937) 490-2694",
//     "emailaddress": "nikkimendoza@accuprint.com",
//     "address": "186 Florence Avenue, Sunbury, Pennsylvania, 4299",
//     "balance": 267.18,
//     "MRN": "62c8d4d996e2de3178916b98",
//     "dob": "2016-08-10",
//     "priorcontact": true,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Ayers West",
//     "phonenumber": "(940) 426-2230",
//     "emailaddress": "ayerswest@accuprint.com",
//     "address": "766 Berkeley Place, Sunriver, Georgia, 7662",
//     "balance": 124.44,
//     "MRN": "62c8d4d9d854203f814967ab",
//     "dob": "2010-09-13",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Lorrie Knight",
//     "phonenumber": "(942) 530-3143",
//     "emailaddress": "lorrieknight@accuprint.com",
//     "address": "247 Auburn Place, Cliffside, California, 9446",
//     "balance": 101.5,
//     "MRN": "62c8d4d925303f08888e5578",
//     "dob": "2016-05-30",
//     "priorcontact": false,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Adele Jordan",
//     "phonenumber": "(865) 446-2593",
//     "emailaddress": "adelejordan@accuprint.com",
//     "address": "137 Juliana Place, Bethpage, Colorado, 2816",
//     "balance": 70.04,
//     "MRN": "62c8d4d9a32534a5e72cb54e",
//     "dob": "2021-12-14",
//     "priorcontact": true,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Farmer Lang",
//     "phonenumber": "(993) 423-2563",
//     "emailaddress": "farmerlang@accuprint.com",
//     "address": "498 Burnett Street, Rockingham, Arizona, 3802",
//     "balance": 114.32,
//     "MRN": "62c8d4d924e17ee05d5a80b3",
//     "dob": "2022-04-10",
//     "priorcontact": false,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Fran Roth",
//     "phonenumber": "(853) 519-2540",
//     "emailaddress": "franroth@accuprint.com",
//     "address": "842 Williams Avenue, Conway, Minnesota, 3203",
//     "balance": 151.15,
//     "MRN": "62c8d4d94bb32dbdb23a30e0",
//     "dob": "2016-04-28",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Lilly Harding",
//     "phonenumber": "(900) 417-3396",
//     "emailaddress": "lillyharding@accuprint.com",
//     "address": "409 Monroe Place, Shindler, Guam, 8012",
//     "balance": 134.62,
//     "MRN": "62c8d4d990a425b2ec081e8a",
//     "dob": "2006-07-14",
//     "priorcontact": false,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Moreno Reid",
//     "phonenumber": "(990) 472-2323",
//     "emailaddress": "morenoreid@accuprint.com",
//     "address": "853 Post Court, Edinburg, North Dakota, 1833",
//     "balance": 25.47,
//     "MRN": "62c8d4d9fd9d347f45f63d06",
//     "dob": "2013-05-07",
//     "priorcontact": false,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Day Marquez",
//     "phonenumber": "(868) 515-2111",
//     "emailaddress": "daymarquez@accuprint.com",
//     "address": "639 Montauk Court, Elliston, Rhode Island, 8833",
//     "balance": 85.96,
//     "MRN": "62c8d4d93147acffd2c8098c",
//     "dob": "2007-07-14",
//     "priorcontact": false,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Cook Perry",
//     "phonenumber": "(878) 427-3381",
//     "emailaddress": "cookperry@accuprint.com",
//     "address": "718 Miller Avenue, Edenburg, Tennessee, 3934",
//     "balance": 231.13,
//     "MRN": "62c8d4d9af8e37173f344270",
//     "dob": "2016-11-12",
//     "priorcontact": true,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Emerson Shaw",
//     "phonenumber": "(924) 517-3915",
//     "emailaddress": "emersonshaw@accuprint.com",
//     "address": "577 Linden Street, Hebron, New York, 9644",
//     "balance": 18.87,
//     "MRN": "62c8d4d98e0b7880c923e7c5",
//     "dob": "2004-01-16",
//     "priorcontact": true,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Saundra Henderson",
//     "phonenumber": "(840) 498-2723",
//     "emailaddress": "saundrahenderson@accuprint.com",
//     "address": "646 Canal Avenue, Brookfield, Iowa, 6451",
//     "balance": 223.78,
//     "MRN": "62c8d4d9b64818b12e88e5d8",
//     "dob": "2021-09-20",
//     "priorcontact": false,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Lynette Turner",
//     "phonenumber": "(993) 424-2040",
//     "emailaddress": "lynetteturner@accuprint.com",
//     "address": "296 Midwood Street, Winfred, North Carolina, 2747",
//     "balance": 267.31,
//     "MRN": "62c8d4d9b4e7f286dee50f51",
//     "dob": "2014-05-29",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Nannie Larsen",
//     "phonenumber": "(906) 589-3234",
//     "emailaddress": "nannielarsen@accuprint.com",
//     "address": "924 Goodwin Place, Durham, Delaware, 7054",
//     "balance": 121.56,
//     "MRN": "62c8d4d9ddd4d380b0ce2c3b",
//     "dob": "2016-06-24",
//     "priorcontact": true,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Dyer Duran",
//     "phonenumber": "(834) 415-3439",
//     "emailaddress": "dyerduran@accuprint.com",
//     "address": "470 Conover Street, Sunnyside, Wyoming, 4084",
//     "balance": 13.35,
//     "MRN": "62c8d4d94e4a49c56745ccf4",
//     "dob": "2010-10-22",
//     "priorcontact": true,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Naomi Key",
//     "phonenumber": "(950) 508-2615",
//     "emailaddress": "naomikey@accuprint.com",
//     "address": "570 Lorimer Street, Kaka, Northern Mariana Islands, 5293",
//     "balance": 232.28,
//     "MRN": "62c8d4d985646577b6bc79b3",
//     "dob": "2011-04-11",
//     "priorcontact": true,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Irene Harmon",
//     "phonenumber": "(901) 474-2832",
//     "emailaddress": "ireneharmon@accuprint.com",
//     "address": "892 Willoughby Avenue, Hendersonville, Texas, 753",
//     "balance": 60.54,
//     "MRN": "62c8d4d9afee4686b5ad6a39",
//     "dob": "2003-05-17",
//     "priorcontact": false,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Walker Wilson",
//     "phonenumber": "(836) 579-2536",
//     "emailaddress": "walkerwilson@accuprint.com",
//     "address": "567 Alabama Avenue, Innsbrook, Michigan, 4350",
//     "balance": 127.08,
//     "MRN": "62c8d4d9d682f803960d81e1",
//     "dob": "2001-01-19",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Sarah Cox",
//     "phonenumber": "(895) 596-2113",
//     "emailaddress": "sarahcox@accuprint.com",
//     "address": "545 Adams Street, Winchester, Marshall Islands, 3272",
//     "balance": 161.26,
//     "MRN": "62c8d4d986ac17a138e8aac5",
//     "dob": "2012-11-09",
//     "priorcontact": false,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Mildred Bass",
//     "phonenumber": "(827) 576-2165",
//     "emailaddress": "mildredbass@accuprint.com",
//     "address": "265 Ford Street, Allentown, Florida, 5121",
//     "balance": 52.16,
//     "MRN": "62c8d4d9db0b48f5b944870b",
//     "dob": "2004-06-15",
//     "priorcontact": true,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Patrice Blair",
//     "phonenumber": "(978) 439-3970",
//     "emailaddress": "patriceblair@accuprint.com",
//     "address": "625 Railroad Avenue, Brandermill, Maine, 5215",
//     "balance": 152.46,
//     "MRN": "62c8d4d9b8ae010d9f4abba3",
//     "dob": "2004-04-23",
//     "priorcontact": false,
//     "pending": false,
//     "template": "Template One",
//     "group": []
//   },
//   {
//     "fullname": "Rosella Forbes",
//     "phonenumber": "(999) 523-3520",
//     "emailaddress": "rosellaforbes@accuprint.com",
//     "address": "618 Fanchon Place, Westerville, Louisiana, 6810",
//     "balance": 228.05,
//     "MRN": "62c8d4d97293225f9caa5847",
//     "dob": "2008-04-12",
//     "priorcontact": false,
//     "pending": true,
//     "template": "Template One",
//     "group": []
//   }
// ]
