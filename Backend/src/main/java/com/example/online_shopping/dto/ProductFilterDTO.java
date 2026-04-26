package com.example.online_shopping.dto;
import java.math.BigDecimal;

public record ProductFilterDTO (
    Long id,           
    String name,
    Integer stock,     
    Long categoryId,
    BigDecimal minPrice,
    BigDecimal maxPrice
) {}
