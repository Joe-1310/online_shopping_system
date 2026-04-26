package com.example.online_shopping.service;

import com.example.online_shopping.dto.InvoiceDTO;
import com.example.online_shopping.dto.OrderDTO;
import com.example.online_shopping.exception.InvalidRequestException;
import com.example.online_shopping.exception.ResourceNotFoundException;
import com.example.online_shopping.model.*;
import com.example.online_shopping.repository.OrderRepository;
import com.example.online_shopping.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;


@Service
@RequiredArgsConstructor
public class InvoiceService {
    private final OrderRepository orderRepository;


    public InvoiceDTO getOrderForInvoice(Long userId, LocalDate startDate, LocalDate endDate) {
        List<Order> orders = orderRepository.findByUserIdAndCreatedAtBetween(userId, startDate, endDate);
        if (orders.isEmpty()) {
            throw new ResourceNotFoundException("No orders found for user with id: " + userId + " in the specified date range");
        }

        // Initialize variables to collect data from all orders
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<Product> allProducts = new ArrayList<>();
        String username = orders.get(0).getUser().getUsername();

        // Collect data from all orders in the date range
        for (Order order : orders) {
            totalAmount = totalAmount.add(order.getTotalPrice());

            // Extract products from order items
            if (order.getOrderItems() != null) {
                for (OrderItem item : order.getOrderItems()) {
                    if (item.getProduct() != null) {
                        allProducts.add(item.getProduct());
                    }
                }
            }
        }

        // Build and return the invoice DTO with data from all orders
        return InvoiceDTO.builder()
                .userId(userId)
                .username(username)
                .startDate(startDate)
                .endDate(endDate)
                .totalAmount(totalAmount)
                .products(allProducts)
                .build();
    }







}