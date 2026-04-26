package com.example.online_shopping.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderItemDetailsDTO {
    private Long id;
    private ProductDetailsDTO product;
    private int quantity;
    private BigDecimal price;
}
