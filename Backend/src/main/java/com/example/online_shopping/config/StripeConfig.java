package com.example.online_shopping.config;

import com.stripe.Stripe;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Configuration
public class StripeConfig {

    private static final Logger logger = LoggerFactory.getLogger(StripeConfig.class);

    @Value("${stripe.secret-key}")
    private String apiKey;

    @PostConstruct
    public void init() {
        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.equals("sk_test_your_stripe_secret_key_here")) {
            logger.warn("Stripe secret key is not properly configured. Please update the stripe.secret-key property in application.properties");
            logger.warn("Using a placeholder key - this will not work for actual payments");
            Stripe.apiKey = "sk_test_51S3NvF0h2EBNQQfq9inz0ncFMyJwW8xXsgwU6FZXh11tLQRPc0KsLCwB3Sk9ngrqjQwTiEoa5FsvhNyyXo3KZjYV000neyJ0JZ";
        } else {
            Stripe.apiKey = apiKey;
            logger.info("Stripe API initialized successfully");
        }
    }
}