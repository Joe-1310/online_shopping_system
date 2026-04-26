package com.example.online_shopping.controller;

import com.example.online_shopping.model.Category;
import com.example.online_shopping.service.CategoryService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/categories")
public class CategoryController {
    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    // Add a new category
    @PostMapping
    public ResponseEntity<ApiResponse> addNewCategory(@RequestBody Category category) {
        try {
            Category createdCategory = categoryService.addNewCategory(category);
            if(createdCategory != null)
                return ResponseEntity.ok(new ApiResponse("Category created successfully", "success"));
            else
                return ResponseEntity.badRequest().body(new ApiResponse("Failed to create category", "error"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse("Error creating category: " + e.getMessage(), "error"));
        }
    }

    // Get all categories
    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        try {
            return ResponseEntity.ok(categoryService.getAllCategories());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get categories with pagination
    @GetMapping("/paged")
    public ResponseEntity<Page<Category>> getCategoriesWithPagination(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Pageable pageable = PageRequest.of(page, size);
            Page<Category> categories = categoryService.getCategoriesWithPagination(pageable);
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Get category by ID
    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable Long id) {
        try {
            Category category = categoryService.getCategoryById(id);
            return ResponseEntity.ok(category);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Update category
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse> updateCategory(@PathVariable Long id, @RequestBody Category category) {
        try {
            Category updatedCategory = categoryService.updateCategory(id, category);
            if(updatedCategory != null)
                return ResponseEntity.ok(new ApiResponse("Category updated successfully", "success"));
            else
                return ResponseEntity.badRequest().body(new ApiResponse("Failed to update category", "error"));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse("Category not found", "error"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(e.getMessage(), "error"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse("Error updating category: " + e.getMessage(), "error"));
        }
    }

    // Delete category
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteCategory(@PathVariable Long id) {
        try {
            categoryService.deleteCategory(id);
            return ResponseEntity.ok(new ApiResponse("Category deleted successfully", "success"));
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiResponse("Category not found", "error"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(new ApiResponse(e.getMessage(), "error"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ApiResponse("Error deleting category: " + e.getMessage(), "error"));
        }
    }

    // Find category by name
    @GetMapping("/search")
    public ResponseEntity<Category> findCategoryByName(@RequestParam String name) {
        try {
            Optional<Category> category = categoryService.findCategoryByName(name);
            return category.map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}/product-count")
    public ResponseEntity<Long> getCategoryProductCount(@PathVariable Long id) {
    try {
        Long count = categoryService.getProductCountByCategory(id);
        return ResponseEntity.ok(count);
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
    }
}

    public class ApiResponse {
        private String message;
        private String status;

        public ApiResponse(String message, String status) {
            this.message = message;
            this.status = status;
        }

        // getters and setters
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }
}