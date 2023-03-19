import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Auth } from './../models/auth.models';
import { User } from '../models/user.models';
import { Token } from '@angular/compiler';
import { tap } from 'rxjs/operators';

import { environment } from './../../environments/environments';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  urlApi = `${environment.API_URL}/api/auth`

  constructor(private http: HttpClient,
    private TokenService: TokenService) { }

  login(email: string, password: string) {
    return this.http.post<Auth>(`${this.urlApi}/login`, { email, password })
      .pipe(tap(response => this.TokenService.saveToken(response.access_token)))
  }

  profile() {
    return this.http.get<User>(`${this.urlApi}/profile`, {
      // headers: {
      //   Authorization: `Bearer ${token}`,
      // }
    })
  }
}
