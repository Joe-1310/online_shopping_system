package com.example.online_shopping.service;

import com.example.online_shopping.model.Category;
import com.example.online_shopping.repository.CategoryRepository;
import com.example.online_shopping.repository.ProductRepository;

import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.EmptyResultDataAccessException;

import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

@Service
public class CategoryService {
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;


    public CategoryService(CategoryRepository categoryRepository, ProductRepository productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    public Long getProductCountByCategory(Long categoryId) {
    return productRepository.countByCategoryId(categoryId);
    }

    // Method to add a new category
    public Category addNewCategory(Category categoryName) {
        // Check if category is null
        if (categoryName == null) {
            throw new IllegalArgumentException("Category cannot be null");
        }

        // Check if the category name is null or empty
        if (categoryName.getName() == null || categoryName.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Category name cannot be null or empty");
        }

        // Check if a category with the same name already exists
        if (categoryRepository.findByNameIgnoreCase(categoryName.getName()).isPresent()) {
            throw new DataIntegrityViolationException("Category with name '" + categoryName.getName() + "' already exists");
        }

        try {
            // Ensure we're creating a new category by setting ID to null
            categoryName.setId(null);
            return categoryRepository.save(categoryName);
        } catch (DataIntegrityViolationException e) {
            throw new DataIntegrityViolationException("Failed to save category: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new RuntimeException("An unexpected error occurred while saving the category", e);
        }
    }

    // Method to get all categories
    public List<Category> getAllCategories() {
        try {
            return categoryRepository.findAll();
        } catch (Exception e) {
            throw new RuntimeException("An error occurred while retrieving categories", e);
        }
    }
    
    // Method to get categories with pagination
    public Page<Category> getCategoriesWithPagination(Pageable pageable) {
        try {
            return categoryRepository.findAll(pageable);
        } catch (Exception e) {
            throw new RuntimeException("An error occurred while retrieving paginated categories", e);
        }
    }

    // Method to get a category by ID
    public Category getCategoryById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Category ID cannot be null");
        }
        
        try {
            return categoryRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Category not found with ID: " + id));
        } catch (NoSuchElementException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("An error occurred while retrieving the category", e);
        }
    }

    // Method to update a category
    public Category updateCategory(Long id, Category updatedCategory) {
        if (id == null) {
            throw new IllegalArgumentException("Category ID cannot be null");
        }
        
        if (updatedCategory == null) {
            throw new IllegalArgumentException("Updated category cannot be null");
        }
        
        if (updatedCategory.getName() == null || updatedCategory.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Category name cannot be null or empty");
        }
        
        try {
            // Check if category exists
            Category existingCategory = categoryRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Category not found with ID: " + id));
            
            // Check if the new name already exists for a different category
            Optional<Category> categoryWithSameName = categoryRepository.findByNameIgnoreCase(updatedCategory.getName());
            if (categoryWithSameName.isPresent() && !categoryWithSameName.get().getId().equals(id)) {
                throw new DataIntegrityViolationException("Category with name '" + updatedCategory.getName() + "' already exists");
            }
            
            // Update the category
            existingCategory.setName(updatedCategory.getName());
            return categoryRepository.save(existingCategory);
        } catch (NoSuchElementException | DataIntegrityViolationException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("An error occurred while updating the category", e);
        }
    }

    // Method to delete a category
    public void deleteCategory(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("Category ID cannot be null");
        }
        
        try {
            // Check if category exists
            if (!categoryRepository.existsById(id)) {
                throw new NoSuchElementException("Category not found with ID: " + id);
            }
            
            categoryRepository.deleteById(id);
        } catch (EmptyResultDataAccessException e) {
            throw new NoSuchElementException("Category not found with ID: " + id);
        } catch (DataIntegrityViolationException e) {
            throw new DataIntegrityViolationException("Cannot delete category because it is referenced by products", e);
        } catch (Exception e) {
            throw new RuntimeException("An error occurred while deleting the category", e);
        }
    }
    
    // Method to find a category by name
    public Optional<Category> findCategoryByName(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Category name cannot be null or empty");
        }
        
        try {
            return categoryRepository.findByNameIgnoreCase(name);
        } catch (Exception e) {
            throw new RuntimeException("An error occurred while searching for the category", e);
        }
    }
}
