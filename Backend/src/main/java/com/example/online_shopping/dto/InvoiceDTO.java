package com.example.online_shopping.dto;

import com.example.online_shopping.model.Product;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceDTO {
    private Long userId;
    private String username;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalAmount;
    private List<Product> products;
}
