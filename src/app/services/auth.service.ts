import { Injectable, NgZone } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { tap, map } from "rxjs/operators";
import { Auth } from '../interfaces/auth.interface';

import { User } from '../services/user';
import * as auth from 'firebase/auth';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/compat/firestore'; 
 
@Injectable({providedIn: 'root'})

export class UsersService {

  private loggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private tenantName = new BehaviorSubject<any>(null);
  private user = new BehaviorSubject<object>({user: null});
  private template = new BehaviorSubject<any>(null);
  dbObjKey = this.tenantName.asObservable();
  userInfo = this.user.asObservable();
  activeTemplate = this.template.asObservable();


  private userDataURL: string = '';
  private _auth: Auth | undefined;

  get isLoggedIn() {
    this.getUserData(this.userData?.uid)
    return this.loggedIn.asObservable();

  }

//   getCurrentUser() {
//     console.log("getCurrentUser" + this.userData?.uid);
//     this.getUserData(this.userData?.uid)
//   }

  userData: any; // Save logged in user data
  
  constructor(
    private http: HttpClient, 
    public afs: AngularFirestore, // Inject Firestore service
    public afAuth: AngularFireAuth, // Inject Firebase auth service
    public router: Router,
    public ngZone: NgZone // NgZone service to remove outside scope warning
  ) {
    /* Saving user data in localstorage when 
    logged in and setting up null when logged out */
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.userData = user;
        localStorage.setItem('user', JSON.stringify(this.userData));
        JSON.parse(localStorage.getItem('user')!);
        this.loggedIn.next(true);
        this.router.navigateByUrl('call-information');
      } else {
        localStorage.setItem('user', 'null');
        JSON.parse(localStorage.getItem('user')!);
      }
    });
  }
    // Sign in with email/password
    SignIn(email: string, password: string) {
        return this.afAuth
          .signInWithEmailAndPassword(email, password)
          .then((result) => {
            console.log(result.user);
          })
          .catch((error) => {
            window.alert(error.message);
          });
      }
      
  SignOut() {
    return this.afAuth.signOut().then(() => {
      localStorage.removeItem('user');
      this.router.navigate(['sign-in']);
      this.loggedIn.next(false);
      this.router.navigateByUrl('login');
    });
  }

  getUserData(uid: any) {
      let localTenantName :string;
      if (uid) {
        const data = this.afs.collection('Tenant').ref;
        data.where('uids', 'array-contains', uid).get().then((docs) => {
          docs.forEach((doc) => {
              localTenantName = doc.id
              this.tenantName.next(doc.id)
          })
        }).then((res) => {
            const localUserData = this.afs.collection('Tenant').doc(localTenantName).collection('users').doc(uid).ref;
            localUserData.get().then((res) => {
                let localUserInfo: any = res.data();
                this.template.next(localUserInfo.activeTemplate) 
                this.user.next(localUserInfo);
            })
        })
      } else {
          // console.log('no uid');
      }
  }


    /* Setting up user data when sign in with username/password, 
  sign up with username/password and sign in with social auth  
  provider in Firestore database using AngularFirestore + AngularFirestoreDocument service */
  SetUserData(user: any) {
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(
      `users/${user.uid}`
    );
    const userData: User = {
      tenant: user.tenant,
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
    };
    return userRef.set(userData, {
      merge: true,
    });
  }

}