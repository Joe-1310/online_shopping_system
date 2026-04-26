package com.example.online_shopping.dto;

import java.math.BigDecimal;
import java.util.List;

public record CartDTO(
        List<CartItemDTO> items
) {
}