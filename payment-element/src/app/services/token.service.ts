import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NormalizedCardData } from '../data.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TokenService {

  constructor(private http: HttpClient) { }

  getToken(normalizedCardData: NormalizedCardData): Observable<any> {
    return this.http.post<{ token: string }>(
      'http://localhost:3000/api/v1/tokenize', normalizedCardData
    )
  }

  // makePayment(token: string, amount: number): Observable<any> {
  //   return this.http.post<{ status: string, transactionId: string}>(
  //     'localhost:3000/pay', { token, amount: amount}
  //   )
  // }
}
