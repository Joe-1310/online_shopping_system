package com.example.online_shopping.controller;

//import com.nimbusds.jose.shaded.gson.JsonSyntaxException;

import com.google.gson.JsonSyntaxException;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stripe")
public class StripeWebhookController {

    private static final Logger log = LoggerFactory.getLogger(StripeWebhookController.class);

    @Value("${stripe.webhook-secret}")
    private String endpointSecret;

    @PostMapping(value = "/webhook", consumes = "application/json")
    public ResponseEntity<String> handleStripeEvent(
            @RequestHeader("Stripe-Signature") String sigHeader,
            @RequestBody String payload) {

        if (endpointSecret == null || endpointSecret.trim().isEmpty() || 
            endpointSecret.equals("whsec_your_webhook_secret_here")) {
            log.warn("Stripe webhook secret is not properly configured. Webhook verification will be skipped.");
            return ResponseEntity.ok("Webhook received (signature verification skipped)");
        }

        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, endpointSecret);
        } catch (SignatureVerificationException e) {
            log.warn("Webhook signature verification failed: {}", e.getMessage());
            return ResponseEntity.status(400).body("Invalid signature");
        } catch (JsonSyntaxException e) {
            log.warn("Webhook invalid JSON: {}", e.getMessage());
            return ResponseEntity.status(400).body("Invalid payload");
        }

        // Handle the events you need
        switch (event.getType()) {
            case "checkout.session.completed" -> {
                Session session = (Session) event.getDataObjectDeserializer()
                        .getObject()
                        .orElse(null);
                if (session != null) {
                    log.info("Checkout completed. sessionId={}, paymentStatus={}",
                            session.getId(), session.getPaymentStatus());
                }
            }
            case "payment_intent.succeeded" -> {
                PaymentIntent intent = (PaymentIntent) event.getDataObjectDeserializer()
                        .getObject()
                        .orElse(null);
                if (intent != null) {
                    log.info("Payment succeeded. intentId={}, amount={}",
                            intent.getId(), intent.getAmount());
                }
            }
            case "payment_intent.payment_failed" -> {
                log.info("Payment failed.");
            }
            default -> log.info("Unhandled event type: {}", event.getType());
        }

        return ResponseEntity.ok("success");
    }
}