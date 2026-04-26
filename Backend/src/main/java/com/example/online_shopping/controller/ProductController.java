package com.example.online_shopping.controller;

import com.example.online_shopping.dto.CachedPage;
import com.example.online_shopping.dto.PaginationDTO;
import com.example.online_shopping.dto.ProductFilterDTO;
import com.example.online_shopping.model.Product;
import com.example.online_shopping.service.FirebaseStorageService;
import com.example.online_shopping.service.ProductService;
import io.jsonwebtoken.io.IOException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/v1/products")
public class ProductController {
    @Autowired
    private final ProductService productService;
    private final FirebaseStorageService firebaseStorageService;


    public ProductController(ProductService productService, FirebaseStorageService firebaseStorageService) {
        this.productService = productService;
        this.firebaseStorageService = firebaseStorageService;
    }

    @PostMapping("/add")
    public ResponseEntity<Product> addNewProduct(@RequestBody Product product) {
        try {
            return ResponseEntity.ok(productService.createProduct(product));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        try {
            Product newProduct;
            newProduct = productService.updateProduct(id, product);
            if (newProduct != null)
                return ResponseEntity.ok(newProduct);
            else
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteProduct(@PathVariable Long id) {
        try {
            Product existingProduct;
            existingProduct = productService.deleteProduct(id);
            if (existingProduct != null)
                return new ResponseEntity<>("deleted", HttpStatus.OK);
            else
                return new ResponseEntity<>("Failed to delete", HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("Failed to delete", HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id) {
        Product product = productService.getProductById(id);
        if (product != null) {
            return ResponseEntity.ok(product);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @GetMapping("")
    public ResponseEntity<CachedPage<Product>> getProducts(@ModelAttribute ProductFilterDTO productFilterDTO, @ModelAttribute PaginationDTO paginationDTO) {
        CachedPage<Product> products = productService.getProducts(productFilterDTO, paginationDTO);
        return ResponseEntity.ok(products);
    }

    @PutMapping("/{id}/image")
    public ResponseEntity<String> uploadImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file
    ) throws IOException, java.io.IOException {
        String oldImageUrl = productService.getProductById(id).getImageUrl();
        firebaseStorageService.deleteByUrl(oldImageUrl);
        String imageUrl = firebaseStorageService.uploadProductImage(id, file);
        productService.saveImageUrl(id, imageUrl);
        return ResponseEntity.ok(imageUrl);
    }

   /* @PutMapping("/{id}/image")
    public ResponseEntity<String> editImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file
    ) throws IOException, java.io.IOException {
        String oldImageUrl = productService.getProductById(id).getImageUrl();
        firebaseStorageService.deleteByUrl(oldImageUrl);
        String imageUrl = firebaseStorageService.uploadProductImage(id, file);
        productService.saveImageUrl(id, imageUrl);
        return ResponseEntity.ok(imageUrl);
    }*/
}
