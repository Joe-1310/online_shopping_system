package com.example.online_shopping.dto;

import java.math.BigDecimal;

public record OrderItemDTO(
        Long productId,
        int quantity,
        BigDecimal price,
        String productName,
        String productDescription,
        String imageUrl
) {}