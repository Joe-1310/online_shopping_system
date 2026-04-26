import { Component, OnInit } from '@angular/core';
import { Category } from '../../../../shared/models/category.model';
import { Product } from '../../../../shared/models/product.model';
import { CategoryService } from '../../../../shared/services/category.service';
import { ProductService } from '../../../../shared/services/product.service';
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  categoriesWithProducts: { category: Category; products: Product[] }[] = [];
  loading = true;

  constructor(
    private categoryService: CategoryService,
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit() {
    this.categoryService.getCategories().subscribe((categories) => {
      const requests = categories.map((category) =>
        this.productService.getProducts({ categoryId: category.id, size: 10, page: 0 })
      );

      forkJoin(requests).subscribe((responses) => {
        this.categoriesWithProducts = categories
          .map((category, index) => ({
            category,
            products: responses[index].content,
          }))
          .filter((section) => section.products && section.products.length > 0);

        this.loading = false;
      });
    });
  }

  navigateToProduct(productId: number) {
    this.router.navigate(['/public/products', productId]);
  }

  onImageLoad(event: Event) {
    const img = event.target as HTMLImageElement;
    img.style.opacity = '1';
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src =
      'https://firebasestorage.googleapis.com/v0/b/online-shopping-e-and.firebasestorage.app/o/products%2FpalceHolder%2Felementor-placeholder-image.png?alt=media&token=636eae23-a48c-4cb2-90cc-b85276d25555';
  }
}
