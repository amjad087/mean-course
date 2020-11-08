import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AuthData } from './auth-data.model';
import { environment } from '../../environments/environment';
const BACKEND_URL = environment.apiUrl + 'auth/';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private token;
  private userId: string;
  private userAuthenticated = false;
  private authTokenListner = new Subject<boolean>();
  private tokenTimer: any;
  constructor(private http: HttpClient, private router: Router) { }

  createUser(email: string, password: string) {
    const authData: AuthData = { email, password };

    this.http.post<{message: string, createdPost: any}>(BACKEND_URL + 'signup', authData)
    .subscribe(res => {
      this.router.navigate(['/auth/login']);
    }, error => {
      console.log(error);
    });
  }

  getAuthTokenListner() {
    return this.authTokenListner.asObservable();
  }

  getUserId() {
    return this.userId;
  }

  autoLogin() {
    const authData = this.getAuthData();
    if (!authData) {
      return;
    }

    const token = authData.token;
    const userId = authData.userId;
    const expDate = authData.expDate;

    const expiryDate = new Date(expDate);
    // const now = new Date();
    const expiresIn = expiryDate.getTime() - new Date().getTime();
    if (expiresIn > 0) {
      this.token = token;
      this.userId = userId;
      const expDuration = expiresIn / 1000;
      this.setTokenTimer(expDuration);
      this.userAuthenticated = true;
      this.authTokenListner.next(true);
    }

  }

  login(email: string, password: string) {
    const authData: AuthData = { email, password };
    this.http.post<{message: string, userId: string, token: string, expiresIn: number }>
    (BACKEND_URL + 'login', authData)
    .subscribe(response => {
      if (response.token) {
        this.token = response.token;
        this.userId = response.userId;
        const expDuration = response.expiresIn;
        this.setTokenTimer(expDuration);
        this.saveAuthData(response);
        this.userAuthenticated = true;
        this.authTokenListner.next(true);
        this.router.navigate(['/']);
      }
    }, error => {
      console.log(error);
    });
  }

  private setTokenTimer(expDuration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, expDuration * 1000); // multiplied by 1000 because setTimeout works in miliseconds
  }

  private saveAuthData(response: any) {
    const token = response.token;
    const userId = response.userId;
    const expiresIn = response.expiresIn;

    const now = new Date();
    const expDate = new Date(now.getTime() + expiresIn * 1000);

    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
    localStorage.setItem('expDate', expDate.toISOString());
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('expDate');
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const expDate = localStorage.getItem('expDate');
    if (!token || !userId || !expDate) {
      return;
    }

    return {
      token,
      userId,
      expDate
    };
  }

  getToken() {
    return this.token;
  }

  isUserAuthenticated() {
    return this.userAuthenticated;
  }

  logout() {
    this.token = null;
    this.userId = null;
    this.userAuthenticated = false;
    this.clearAuthData();
    this.authTokenListner.next(false);
    clearTimeout(this.tokenTimer);
    this.router.navigate(['/']);
  }
}
