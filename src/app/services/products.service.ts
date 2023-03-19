import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { catchError, retry } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { CreateProduct, Product, UpdateProduct } from '../models/product.model';

import { environment } from './../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  urlApi = `${environment.API_URL}/api/products`

  //urlApi2 = 'https://young-sands-07814.herokuapp1.com/api/products'

  constructor(private http: HttpClient) { }

  getAllProduct() {
    console.log(environment)
    return this.http.get<Product[]>(this.urlApi)
  }

  getAllProductById(id: string) {
    return this.http.get<Product>(`${this.urlApi}/${id}`).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === HttpStatusCode.Conflict) {
          return throwError(() => new Error('Algo esta fallando en el server'));
        }
        if (error.status === HttpStatusCode.NotFound) {
          return throwError(() => new Error('El producto no existe'));
        }
        if (error.status === HttpStatusCode.Unauthorized) {
          return throwError(() => new Error('No estas permitido'));
        }
        return throwError(() => new Error('Ups algo salio mal'));
      })
    )
  }

  create(data: CreateProduct) {
    console.log(data)
    return this.http.post<Product>(this.urlApi, data)
  }

  update(id: string, data: UpdateProduct) {
    return this.http.put<Product>(`${this.urlApi}/${id}`, data)
  }

  Delete(id: string) {
    return this.http.delete<boolean>(`${this.urlApi}/${id}`)
  }

  getProductsByPages(offset: number, limit: number) {
    return this.http.get<Product[]>(this.urlApi, { params: { offset, limit } }).pipe(
      retry(2));
  }

}
