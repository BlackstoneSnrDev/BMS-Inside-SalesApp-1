import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { UsersService } from './auth.service';

@Injectable()

export class AuthGuard implements  CanActivate {

  constructor(private usersService: UsersService, private router: Router) {}

  canActivate(): Observable<boolean> | boolean{

      return this.usersService.verifyAuth()
      .pipe(
        tap( isAuth => {
          if(!isAuth){
            this.router.navigateByUrl('login')
          }
        })
      )
  }

  
}