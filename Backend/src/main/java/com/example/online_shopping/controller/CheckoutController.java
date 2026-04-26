package com.example.online_shopping.controller;

import com.example.online_shopping.dto.CartDTO;
import com.example.online_shopping.dto.CartItemDTO;
import com.example.online_shopping.service.CartService;
import com.example.online_shopping.service.StripeService;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/stripe")
public class CheckoutController {

    private static final Logger logger = LoggerFactory.getLogger(CheckoutController.class);

    private final StripeService stripeService;
    private final CartService cartService;

    public CheckoutController(StripeService stripeService, CartService cartService) {
        this.stripeService = stripeService;
        this.cartService = cartService;
    }

    @PostMapping("/create-checkout-session")
    public ResponseEntity<?> createCheckoutSession(
            @RequestBody CheckoutSessionRequest request,
            Authentication authentication) {
        
        try {
            logger.info("Creating checkout session for user: {}", authentication.getName());
            
            String username = authentication.getName();
            
            // Get the user's current cart
            CartDTO userCart = cartService.getCartForUser(username);
            logger.info("Retrieved cart for user: {}, items count: {}", username, 
                userCart != null ? userCart.items().size() : 0);
            
            if (userCart == null || userCart.items() == null || userCart.items().isEmpty()) {
                logger.warn("Cart is empty for user: {}", username);
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Cart is empty"));
            }

            // Calculate total amount in cents (Stripe requires amounts in cents)
            BigDecimal totalAmount = userCart.items().stream()
                .map(item -> item.price().multiply(BigDecimal.valueOf(item.quantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            long amountInCents = totalAmount.multiply(BigDecimal.valueOf(100)).longValue();
            logger.info("Total amount in cents: {}", amountInCents);

            // Create Stripe checkout session
            logger.info("Creating Stripe checkout session with {} items", userCart.items().size());
            Session session = stripeService.createCheckoutSessionWithItems(
                userCart.items(),
                request.successUrl(),
                request.cancelUrl()
            );

            Map<String, String> response = new HashMap<>();
            response.put("sessionId", session.getId());
            
            logger.info("Successfully created checkout session: {}", session.getId());
            return ResponseEntity.ok(response);

        } catch (StripeException e) {
            logger.error("Stripe error creating checkout session: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to create checkout session: " + e.getMessage()));
        } catch (Exception e) {
            logger.error("Unexpected error creating checkout session: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "An error occurred: " + e.getMessage()));
        }
    }

    @GetMapping("/test")
    public ResponseEntity<?> testEndpoint() {
        logger.info("Test endpoint called");
        return ResponseEntity.ok(Map.of("message", "Checkout controller is working"));
    }

    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        logger.info("Health check endpoint called");
        return ResponseEntity.ok(Map.of(
            "status", "healthy",
            "timestamp", java.time.LocalDateTime.now().toString(),
            "service", "checkout-controller"
        ));
    }

    // Request DTO for checkout session creation
    public record CheckoutSessionRequest(
        String successUrl,
        String cancelUrl
    ) {}
}
