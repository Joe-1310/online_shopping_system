package com.example.online_shopping.controller;

import com.example.online_shopping.dto.CustomerInfoDto;
import com.example.online_shopping.dto.OrderDTO;
import com.example.online_shopping.dto.OrderDetailsResponse;
import com.example.online_shopping.dto.ProductCustomerRequestDto;
import com.example.online_shopping.service.NotificationService;
import com.example.online_shopping.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/v1/orders")
public class OrderController {

    private final OrderService orderService;
    private final NotificationService notificationService;
    @Value("${jwt.security.customer.role}")
    private String customerRole;

    public OrderController(OrderService orderService, NotificationService notificationService) {
        this.orderService = orderService;
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<OrderDTO>> getOrders(Authentication authentication) {
        String role = authentication.getAuthorities().iterator().next().getAuthority();
        String username = authentication.getName();
        List<OrderDTO> orders = null;
        if (Objects.equals(role, "ROLE_" + customerRole)) {
            orders = orderService.getCustomerOrders(username);
        } else {
            orders = orderService.getAllOrders();
        }
        return ResponseEntity.ok(orders);
    }

    @PostMapping
    public ResponseEntity<?> addOrder(@RequestBody OrderDTO orderDTO, Authentication authentication) {
        try {
            String username = authentication.getName();
            System.out.println("Creating order for user: " + username);
            System.out.println("Original orderDTO: " + orderDTO);
            
            OrderDTO orderWithUser = new OrderDTO(
                orderDTO.orderId(),
                orderDTO.userId(),
                username, 
                orderDTO.totalPrice(),
                orderDTO.status(),
                orderDTO.createdAt(),
                orderDTO.items()
            );
            
            System.out.println("OrderDTO with user: " + orderWithUser);
            OrderDTO saved = orderService.createOrder(orderWithUser);
            notificationService.notifyAdmin(saved);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception e) {
            System.err.println("Error creating order: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/admin/products/customers")
    public ResponseEntity<?> getCustomersByProductAndDateRange(
            @Valid @RequestBody ProductCustomerRequestDto request) {

        try {
            List<CustomerInfoDto> customers = orderService.getCustomersByProductAndDateRange(request);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("customers", customers);
            response.put("totalCount", customers.size());
            response.put("productId", request.getProductId());
            response.put("dateRange", Map.of(
                    "startDate", request.getStartDate().toString(),
                    "endDate", request.getEndDate().toString()
            ));

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());
            if (request != null) {
                errorResponse.put("productId", request.getProductId());
            }

            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    @GetMapping("/paged")
    public ResponseEntity<Page<OrderDTO>> getAllOrdersPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDirection,
            @RequestParam(required = false) Long orderId,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate
    ) {
        try {
            Sort.Direction direction = Sort.Direction.fromString(sortDirection);
            Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
            
            
            LocalDate parsedStartDate = null;
            LocalDate parsedEndDate = null;
            
            if (startDate != null && !startDate.isEmpty()) {
                parsedStartDate = LocalDate.parse(startDate);
            }
            if (endDate != null && !endDate.isEmpty()) {
                parsedEndDate = LocalDate.parse(endDate);
            }
            
            Page<OrderDTO> orders = orderService.getOrdersWithFilters(
                    orderId, userId, username, status, parsedStartDate, parsedEndDate, pageable);
            
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<OrderDetailsResponse> getOrderDetails(@PathVariable Long id) {
        try {
            OrderDetailsResponse orderDetails = orderService.getOrderDetails(id);
            return ResponseEntity.ok(orderDetails);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}