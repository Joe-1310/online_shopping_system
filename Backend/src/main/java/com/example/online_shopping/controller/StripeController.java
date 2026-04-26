package com.example.online_shopping.controller;

import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@CrossOrigin(origins = "*")  // ✅ allow requests from your HTML page

@RestController
@RequestMapping("/api/payment")
public class StripeController {

    @PostMapping("/create-payment-intent")
    public ResponseEntity<Map<String, String>> createPaymentIntent(@RequestBody Map<String, Object> request)
            throws StripeException {

        Long amount = Long.valueOf(request.get("amount").toString());
        String currency = request.get("currency").toString();

        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(amount) // in cents
                .setCurrency(currency)
                .build();

        PaymentIntent intent = PaymentIntent.create(params);

        Map<String, String> response = new HashMap<>();
        response.put("clientSecret", intent.getClientSecret());

        return ResponseEntity.ok(response);
    }
}