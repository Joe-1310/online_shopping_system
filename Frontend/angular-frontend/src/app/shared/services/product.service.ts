import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { Product, PaginatedResponse, ProductListParams } from '../models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/products`;
  private readonly baseUrl = `${environment.apiUrl}/api/v1`;

  constructor(private http: HttpClient) {}

  getProductById(id: number | string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  getProducts(
    page: number,
    size: number,
    sortBy: string,
    sortDirection: string,
    filters?: {
      id?: number;
      name?: string;
      stock?: number;
      categoryId?: number;
      minPrice?: number;
      maxPrice?: number;
    }
  ): Observable<any>;

  getProducts(params?: ProductListParams): Observable<PaginatedResponse<Product>>;

  getProducts(
    pageOrParams?: number | ProductListParams,
    size?: number,
    sortBy?: string,
    sortDirection?: string,
    filters?: {
      id?: number;
      name?: string;
      stock?: number;
      categoryId?: number;
      minPrice?: number;
      maxPrice?: number;
    }
  ): Observable<any> {
    if (typeof pageOrParams === 'number') {
      let params = new HttpParams()
        .set('page', pageOrParams.toString())
        .set('size', size!.toString())
        .set('sortBy', sortBy!)
        .set('sortDirection', sortDirection!);

      if (filters) {
        if (filters.id) {
          params = params.set('id', filters.id.toString());
        }
        if (filters.name) {
          params = params.set('name', filters.name);
        }
        if (filters.stock !== undefined) {
          params = params.set('stock', filters.stock.toString());
        }
        if (filters.categoryId) {
          params = params.set('categoryId', filters.categoryId.toString());
        }
        if (filters.minPrice !== undefined) {
          params = params.set('minPrice', filters.minPrice.toString());
        }
        if (filters.maxPrice !== undefined) {
          params = params.set('maxPrice', filters.maxPrice.toString());
        }
      }

      const url = `${this.apiUrl}`;
      return this.http.get<any>(url, { params });
    }

    const params = pageOrParams as ProductListParams;
    let httpParams = new HttpParams();

    if (params) {
      if (params.page !== undefined) {
        httpParams = httpParams.set('page', params.page.toString());
      }
      if (params.size !== undefined) {
        httpParams = httpParams.set('size', params.size.toString());
      }
      if (params.sortBy) {
        httpParams = httpParams.set('sortBy', params.sortBy);
      }
      if (params.direction) {
        httpParams = httpParams.set('direction', params.direction);
      }

      if (params.name && params.name.trim()) {
        httpParams = httpParams.set('name', params.name.trim());
      }
      if (params.minPrice !== undefined && params.minPrice !== null) {
        httpParams = httpParams.set('minPrice', params.minPrice.toString());
      }
      if (params.maxPrice !== undefined && params.maxPrice !== null) {
        httpParams = httpParams.set('maxPrice', params.maxPrice.toString());
      }
      if (params.categoryId !== undefined && params.categoryId !== null) {
        httpParams = httpParams.set('categoryId', params.categoryId.toString());
      }
    }

    return this.http.get<PaginatedResponse<Product>>(this.apiUrl, { params: httpParams });
  }


  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/add`, product);
  }


  updateProduct(id: number, product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/update/${id}`, product);
  }


  deleteProduct(id: number): Observable<string> {
    return this.http.delete(`${this.apiUrl}/delete/${id}`, {
      responseType: 'text'
    });
  }

  uploadProductImage(id: number, file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    console.log(file);

    return this.http.put(`${this.apiUrl}/${id}/image`, formData, {
      responseType: 'text'
    });
  }
}