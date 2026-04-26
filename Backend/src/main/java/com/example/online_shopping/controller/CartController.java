package com.example.online_shopping.controller;

import com.example.online_shopping.dto.AddToCartRequestDto;
import com.example.online_shopping.dto.CartDTO;
import com.example.online_shopping.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;


@RestController
@RequestMapping("/api/v1/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public ResponseEntity<CartDTO> viewCart(Authentication authentication) {
        String username = authentication.getName();
        CartDTO cart = cartService.getCartForUser(username);
        return ResponseEntity.ok(cart);
    }

    @PostMapping
    public ResponseEntity<?> addToCart(
            @Valid @RequestBody AddToCartRequestDto addToCartRequest,
            Authentication authentication) {
        try {
            // Get user ID from authentication
            String username = authentication.getName();

            CartDTO cartDTO = cartService.addToCart(
                    username,
                    addToCartRequest.getProductId(),
                    addToCartRequest.getQuantity()
            );

            return ResponseEntity.ok(cartDTO);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while adding item to cart");
        }
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<?> removeFromCart(
            @PathVariable Long productId,
            Authentication authentication) {
        try {
            String username = authentication.getName();

            CartDTO cartDTO = cartService.removeFromCart(username, productId);

            return ResponseEntity.ok(cartDTO);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while removing item from cart");
        }
    }

    @PutMapping("/{productId}")
    public ResponseEntity<?> updateCartItemQuantity(
            @PathVariable Long productId,
            @RequestParam Integer quantity,
            Authentication authentication) {
        try {
            String username = authentication.getName();

            CartDTO cartDTO = cartService.updateCartItemQuantity(username, productId, quantity);

            return ResponseEntity.ok(cartDTO);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while updating cart item");
        }
    }

    @DeleteMapping
    public ResponseEntity<?> clearCart(Authentication authentication) {
        try {
            String username = authentication.getName();
            cartService.clearCart(username);
            Map<String, String> response = Map.of("message", "Cart cleared successfully");
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, String> errorResponse = Map.of("error", e.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}