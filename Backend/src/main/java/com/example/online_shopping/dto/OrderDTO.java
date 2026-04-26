package com.example.online_shopping.dto;

import com.example.online_shopping.Enum.OrderStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record OrderDTO(
        Long orderId,
        Long userId,
        String Name,
        BigDecimal totalPrice,
        OrderStatus status,
        LocalDate createdAt,
        List<OrderItemDTO> items
) {
}