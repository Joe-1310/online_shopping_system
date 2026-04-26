package com.example.online_shopping.service;

import com.example.online_shopping.dto.CartItemDTO;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StripeService {

    public Session createCheckoutSession(Long amount, String currency, String successUrl, String cancelUrl) throws StripeException {
        SessionCreateParams params = SessionCreateParams.builder()
                .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD)
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(successUrl)
                .setCancelUrl(cancelUrl)
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setQuantity(1L)
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency(currency)
                                                .setUnitAmount(amount) // cents
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName("Default Product")
                                                                .build()
                                                )
                                                .build()
                                )
                                .build()
                )
                .build();

        return Session.create(params);
    }

    public Session createCheckoutSessionWithItems(List<CartItemDTO> cartItems, String successUrl, String cancelUrl) throws StripeException {
        SessionCreateParams.Builder paramsBuilder = SessionCreateParams.builder()
                .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD)
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(successUrl)
                .setCancelUrl(cancelUrl);

        // Add each cart item as a line item
        for (CartItemDTO item : cartItems) {
            // Convert price to cents (Stripe requires amounts in cents)
            long unitAmountInCents = item.price().multiply(java.math.BigDecimal.valueOf(100)).longValue();
            
            paramsBuilder.addLineItem(
                    SessionCreateParams.LineItem.builder()
                            .setQuantity((long) item.quantity())
                            .setPriceData(
                                    SessionCreateParams.LineItem.PriceData.builder()
                                            .setCurrency("usd") // You can make this configurable
                                            .setUnitAmount(unitAmountInCents)
                                            .setProductData(
                                                    SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                            .setName(item.productName())
                                                            .build()
                                            )
                                            .build()
                            )
                            .build()
            );
        }

        return Session.create(paramsBuilder.build());
    }
}