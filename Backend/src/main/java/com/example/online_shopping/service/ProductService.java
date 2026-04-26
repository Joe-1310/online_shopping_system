package com.example.online_shopping.service;
import com.example.online_shopping.dto.CachedPage;
import com.example.online_shopping.dto.PaginationDTO;
import com.example.online_shopping.dto.ProductFilterDTO;
import com.example.online_shopping.model.Category;
import com.example.online_shopping.model.Product;
import com.example.online_shopping.repository.CategoryRepository;
import com.example.online_shopping.repository.ProductRepository;
import com.example.online_shopping.specification.ProductSpecification;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.zip.DataFormatException;

@Service
public class ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository CategoryRepository;

    @Value("${pagination.page.default.value}")
    private int defaultPage;

    @Value("${pagination.size.default.value}")
    private int defaultSize;

    @Value("${pagination.sortby.default.value}")
    private String defaultSortBy;

    @Value("${pagination.sortdirection.default.value}")
    private String defaultSortDirection;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.CategoryRepository = categoryRepository;
    }
  
    @CachePut(value = "products", key = "#product.id")
    public Product createProduct(Product product) throws DataFormatException{
        try {
            Category category = CategoryRepository.findById(product.getCategory().getId()).orElseThrow(() -> new RuntimeException("Category not found"));
            product.setCategory(category);
            // We need to check if product already exists by the same vendor
            return productRepository.save(product);
        } catch (Exception e) {
            throw new DataFormatException("Error creating product");
        }

    }
    @CachePut(value = "products", key = "#id")
    public Product updateProduct(Long id, Product updatedProduct) throws IllegalArgumentException {
        Product existingProduct = productRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found with id " + id));

        existingProduct.setName(updatedProduct.getName());
        existingProduct.setDescription(updatedProduct.getDescription());
        existingProduct.setPrice(updatedProduct.getPrice());
        existingProduct.setStock(updatedProduct.getStock());
        existingProduct.setImageUrl(updatedProduct.getImageUrl());
        if (updatedProduct.getCategory() != null && updatedProduct.getCategory().getId() != null) {
            Category category = CategoryRepository.findById(updatedProduct.getCategory().getId())
                    .orElseThrow(() -> new IllegalArgumentException("Category not found with id " + updatedProduct.getCategory().getId()));
            existingProduct.setCategory(category);
        }

        return productRepository.save(existingProduct);
    }
    @CacheEvict(value = "products", key = "#id")
    public Product deleteProduct(Long id) throws DataFormatException{
        try {
            Product existing = productRepository.findById(id).orElse(null);
            if (existing != null) {
                productRepository.delete(existing);
            }
            return existing;
        } catch (Exception e) {
            throw new DataFormatException("Error deleting product");
        }
    }


    @Cacheable(value = "products", key = "#id")
    public Product getProductById(Long id) {

        return productRepository.findById(id).orElse(null);
    }

    @Cacheable(value = "products", key = "T(java.util.Objects).hash(#productFilterDTO, #paginationDTO)") // Not sure about this
    public CachedPage<Product> getProducts(ProductFilterDTO productFilterDTO, PaginationDTO paginationDTO) {
        int page = (paginationDTO != null && paginationDTO.page() != null) ? paginationDTO.page() : defaultPage;
        int size = (paginationDTO != null && paginationDTO.size() != null) ? paginationDTO.size() : defaultSize;

        String sortBy = paginationDTO.sortBy() != null ? paginationDTO.sortBy() : defaultSortBy;
        String direction = paginationDTO.direction() != null ? paginationDTO.direction() : defaultSortDirection;

        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Specification<Product> spec = (root, query, cb) -> cb.conjunction();

        if (productFilterDTO != null) {
            if (productFilterDTO.id() != null) {
            spec = spec.and(ProductSpecification.hasId(productFilterDTO.id()));
            }
            if (productFilterDTO.name() != null) {
                spec = spec.and(ProductSpecification.hasName(productFilterDTO.name()));
            }
            if (productFilterDTO.stock() != null) {
            spec = spec.and(ProductSpecification.hasStock(productFilterDTO.stock()));
            }
            if (productFilterDTO.categoryId() != null) {
                spec = spec.and(ProductSpecification.hasCategory(productFilterDTO.categoryId()));
            }
            if (productFilterDTO.minPrice() != null) {
                spec = spec.and(ProductSpecification.priceGreaterThanOrEqual(productFilterDTO.minPrice()));
            }
            if (productFilterDTO.maxPrice() != null) {
                spec = spec.and(ProductSpecification.priceLessThanOrEqual(productFilterDTO.maxPrice()));
            }
        }

        return CachedPage.fromPage(productRepository.findAll(spec, pageable));
    }

    @Transactional
    public Product saveImageUrl(Long productId, String imageUrl) {
        Product p = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        p.setImageUrl(imageUrl);
        return productRepository.save(p);
    }
    @Transactional
    public Product editImage(Long productId, String imageUrl) {
        Product p = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        p.setImageUrl(imageUrl);
        return productRepository.save(p);
    }

    /*public void deleteImage(Long id) {
        Product p = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        p.setImageUrl(p.getImageUrl());
        productRepository.delete(p);
    }*/
}
