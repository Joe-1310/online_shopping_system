package com.example.online_shopping.dto;

import java.math.BigDecimal;

public record CartItemDTO(
        Long productId,
        String productName,
        int quantity,
        BigDecimal price
) {
}