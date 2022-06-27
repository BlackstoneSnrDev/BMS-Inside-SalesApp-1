import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { tap, map } from "rxjs/operators";
import { Auth } from '../interfaces/auth.interface';

@Injectable({providedIn: 'root'})

export class UsersService {

  private loggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private userDataURL: string = '';
  private _auth: Auth | undefined;

  get isLoggedIn() {

    return this.loggedIn.asObservable();

  }

  get auth(): Auth {
    return {...this._auth!}
  }

  constructor( private _http: HttpClient, private router: Router
    ) {
      
      this.userDataURL = "https://reqres.in/api/users/";

    }

    verifyAuth(): Observable<boolean>{

      if(!localStorage.getItem('BMSUserToken')){

        return of(false)

      }

        return this._http.get<Auth>(this.userDataURL + '1')
        .pipe(
          map(auth => {
            this._auth = auth
            this.loggedIn.next(true);

            return true
          })
        )
      
    }

  getUserData(): Observable<any>{
    
    return this._http.get<Auth>(this.userDataURL + '1')
    .pipe(
      
      tap(auth => this._auth = auth),
      tap(auth => localStorage.setItem('BMSUserToken', auth.data.id) )

    )

  }

  logout() {

    this.loggedIn.next(false);
    this.router.navigateByUrl('login');
    localStorage.removeItem('BMSUserToken')
  }
}