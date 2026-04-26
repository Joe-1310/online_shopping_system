package com.example.online_shopping.service;

import com.example.online_shopping.dto.CartItemDTO;
import com.example.online_shopping.dto.CustomerInfoDto;
import com.example.online_shopping.dto.OrderDTO;
import com.example.online_shopping.dto.OrderDetailsResponse;
import com.example.online_shopping.dto.OrderItemDetailsDTO;
import com.example.online_shopping.dto.ProductCustomerRequestDto;
import com.example.online_shopping.dto.ProductDetailsDTO;
import com.example.online_shopping.dto.UserDetailsDTO;
import com.example.online_shopping.mapper.OrderDTOMapper;
import com.example.online_shopping.mapper.OrderMapper;
import com.example.online_shopping.model.*;
import com.example.online_shopping.repository.OrderRepository;
import com.example.online_shopping.repository.ProductRepository;
import com.example.online_shopping.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;

    private final UserRepository userRepository;

    private final ProductRepository productRepository;

    private final OrderMapper orderMapper;

    private final OrderDTOMapper orderDTOMapper;


    public OrderService(OrderRepository orderRepository, UserRepository userRepository, ProductRepository productRepository, OrderMapper orderMapper, OrderDTOMapper orderDTOMapper) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.orderMapper = orderMapper;
        this.orderDTOMapper = orderDTOMapper;

    }

    @Transactional(readOnly = true)
    public List<OrderDTO> getAllOrders() {
        List<Order> ordersFromDb = orderRepository.findAll();

        return orderMapper.toOrderDtoList(ordersFromDb);
    }

    @Transactional(readOnly = true)
    public List<OrderDTO> getCustomerOrders(String userName) {
        User user = userRepository.findByUsername(userName);
        List<Order> ordersFromDb = orderRepository.findByUserId(user.getId());
        return orderMapper.toOrderDtoList(ordersFromDb);
    }

    @Transactional
    public OrderDTO createOrder(OrderDTO orderDTO) {
        Order newOrder = orderDTOMapper.toOrder(orderDTO);
        User user = null;
        if (orderDTO.userId() != null) {
            user = userRepository.findById(orderDTO.userId())
                    .orElse(null);
        } else if (orderDTO.Name() != null) {
            user = userRepository.findByUsername(orderDTO.Name());
        }
        if (user == null) {
            throw new IllegalArgumentException("User not found");
        }
        newOrder.setUser(user);

        if (newOrder.getOrderItems() != null) {
            for (OrderItem item : newOrder.getOrderItems()) {
                Long pid = item.getProduct() != null ? item.getProduct().getId() : null;
                if (pid == null) {
                    throw new IllegalArgumentException("Each item must include productId");
                }
                Product product = productRepository.getReferenceById(pid);
                item.setProduct(product);
                if (item.getQuantity() > item.getProduct().getStock()) {
                    throw new IllegalArgumentException("Not enough stock for product: " + item.getProduct().getName());
                }

                item.setOrder(newOrder);

            }
        }
        try {
            Order saved = orderRepository.save(newOrder);
            return orderMapper.toOrderDto(saved);
        } catch (Exception e) {
            throw new IllegalArgumentException("Error creating order");
        }

    }

    public List<CustomerInfoDto> getCustomersByProductAndDateRange(ProductCustomerRequestDto request) {

        if (!productRepository.existsById(request.getProductId())) {
            throw new RuntimeException("Product not found with id: " + request.getProductId());
        }

        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new RuntimeException("Start date cannot be after end date");
        }

        List<User> customers = orderRepository.findCustomersByProductAndDateRange(
                request.getProductId(), request.getStartDate(), request.getEndDate());

        return customers.stream()
                .map(user -> new CustomerInfoDto(user.getId(), user.getUsername(), user.getEmail()))
                .collect(Collectors.toList());
    }

    public OrderDetailsResponse getOrderDetails(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));

        OrderDetailsResponse response = new OrderDetailsResponse();
        response.setId(order.getId());
        response.setTotalPrice(order.getTotalPrice());
        response.setStatus(order.getStatus().toString());
        response.setCreatedAt(order.getCreatedAt());

        UserDetailsDTO userDTO = new UserDetailsDTO();
        userDTO.setId(order.getUser().getId());
        userDTO.setUsername(order.getUser().getUsername());
        userDTO.setEmail(order.getUser().getEmail());
        userDTO.setRole(order.getUser().getRole().getRoleName());
        response.setUser(userDTO);

        List<OrderItemDetailsDTO> orderItemDTOs = order.getOrderItems().stream()
                .map(this::mapOrderItemToDTO)
                .collect(Collectors.toList());
        response.setOrderItems(orderItemDTOs);

        return response;
    }

    private OrderItemDetailsDTO mapOrderItemToDTO(OrderItem orderItem) {
        OrderItemDetailsDTO dto = new OrderItemDetailsDTO();
        dto.setId(orderItem.getId());
        dto.setQuantity(orderItem.getQuantity());
        dto.setPrice(orderItem.getPrice());

        ProductDetailsDTO productDTO = new ProductDetailsDTO();
        productDTO.setId(orderItem.getProduct().getId());
        productDTO.setName(orderItem.getProduct().getName());
        productDTO.setDescription(orderItem.getProduct().getDescription());
        productDTO.setPrice(orderItem.getProduct().getPrice());
        productDTO.setStock(orderItem.getProduct().getStock());
        productDTO.setCategoryName(orderItem.getProduct().getCategory().getName());

        dto.setProduct(productDTO);
        return dto;
    }


    public Page<OrderDTO> getAllOrdersPaged(Pageable pageable) {
        Page<Order> orders = orderRepository.findAll(pageable);
        return orders.map(orderMapper::toOrderDto);
    }

    public Page<OrderDTO> getOrdersWithFilters(
            Long orderId,
            Long userId,
            String username,
            String status,
            LocalDate startDate,
            LocalDate endDate,
            Pageable pageable) {

        System.out.println("OrderService.getOrdersWithFilters called with:");
        System.out.println("orderId: " + orderId + ", userId: " + userId + ", username: " + username);
        System.out.println("status: " + status + ", startDate: " + startDate + ", endDate: " + endDate);

        // Clean up string parameters
        String cleanUsername = username != null && !username.trim().isEmpty() ? username.trim() : null;
        String cleanStatus = status != null && !status.trim().isEmpty() ? status.trim() : null;

        Page<Order> orders = orderRepository.findOrdersWithFilters(
                orderId, userId, cleanUsername, cleanStatus, startDate, endDate, pageable);

        System.out.println("Repository returned " + orders.getTotalElements() + " total elements");
        return orders.map(orderMapper::toOrderDto);
    }

    public Page<OrderDTO> getOrdersByUserId(Long userId, Pageable pageable) {
        Page<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return orders.map(orderMapper::toOrderDto);
    }


}