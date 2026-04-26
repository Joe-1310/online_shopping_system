package com.example.online_shopping.controller;

import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.online_shopping.model.User;
import com.example.online_shopping.service.UserService;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {
    
    private final UserService userService;
    
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<Page<User>> getUsers(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(required = false) String name,
        @RequestParam(required = false) String email,
        @RequestParam(required = false) String role,
        @RequestParam(required = false) Long id
    ) {
        try {
            System.out.println("UserController.getUsers() called with params: page=" + page + 
                             ", size=" + size + ", name=" + name + ", email=" + email + 
                             ", role=" + role + ", id=" + id);
            Page<User> users = userService.getUsers(page, size, name, email, role, id);
            System.out.println("UserService returned " + users.getTotalElements() + " total users");
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            System.err.println("ERROR in UserController.getUsers(): " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<String> updateUserRole(@PathVariable Long id, @RequestBody Map<String, String> roleUpdate) {
        try {
            String newRole = roleUpdate.get("role");
            if (newRole == null || newRole.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Role cannot be empty");
            }
            
            userService.updateUserRole(id, newRole);
            return ResponseEntity.ok("User role updated successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to update user role");
        }
    }

    @GetMapping("/{id}/order-count")
    public ResponseEntity<Long> getUserOrderCount(@PathVariable Long id) {
        try {
            Long orderCount = userService.getUserOrderCount(id);
            return ResponseEntity.ok(orderCount);
        } catch (Exception e) {
            System.err.println("ERROR in getUserOrderCount(): " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}/last-order-date")
    public ResponseEntity<String> getUserLastOrderDate(@PathVariable Long id) {
        try {
            String lastOrderDate = userService.getUserLastOrderDate(id);
            if (lastOrderDate != null) {
                return ResponseEntity.ok(lastOrderDate);
            } else {
                return ResponseEntity.ok().build(); // Returns 200 with no body (null)
            }
        } catch (Exception e) {
            System.err.println("ERROR in getUserLastOrderDate(): " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}