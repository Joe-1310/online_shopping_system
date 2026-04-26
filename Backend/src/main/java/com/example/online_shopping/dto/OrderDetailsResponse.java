package com.example.online_shopping.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderDetailsResponse {
    private Long id;
    private UserDetailsDTO user;
    private BigDecimal totalPrice;
    private String status;
    private LocalDate createdAt;
    private List<OrderItemDetailsDTO> orderItems;
}
