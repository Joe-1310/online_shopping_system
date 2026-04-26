package com.example.online_shopping.repository;

import com.example.online_shopping.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface ProductRepository extends JpaRepository <Product, Long>, JpaSpecificationExecutor<Product> {
    Long countByCategoryId(Long categoryId);

}
