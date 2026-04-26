import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../models/category.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private readonly apiUrl = `${environment.apiUrl}/api/v1/categories`;

  constructor(private http: HttpClient) {}

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.apiUrl);
  }

  getCategoriesPaginated(page: number = 0, size: number = 100): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sortBy', 'id')
      .set('sortDirection', 'asc');

    return this.http.get<any>(this.apiUrl, { params });
  }

  getCategoryById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }

  createCategory(category: Category): Observable<any> {
    const categoryData = { name: category.name };
    return this.http.post<any>(this.apiUrl, categoryData);
  }

  updateCategory(id: number, category: Category): Observable<any> {
    const categoryData = { name: category.name };
    return this.http.put<any>(`${this.apiUrl}/${id}`, categoryData);
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  getCategoryProductCount(categoryId: number): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/${categoryId}/product-count`);
  }
}
