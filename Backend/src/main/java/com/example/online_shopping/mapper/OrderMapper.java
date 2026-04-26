package com.example.online_shopping.mapper;

import com.example.online_shopping.dto.OrderDTO;
import com.example.online_shopping.dto.OrderItemDTO;
import com.example.online_shopping.model.Order;
import com.example.online_shopping.model.OrderItem;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    @Mapping(source = "id", target = "orderId")
    @Mapping(source = "order.user.id", target = "userId")
    @Mapping(source = "order.user.username", target = "Name")
    @Mapping(source = "orderItems", target = "items")
    OrderDTO toOrderDto(Order order);

    @Mapping(source = "product.id", target = "productId")
    @Mapping(source = "product.name", target = "productName")
    @Mapping(source = "product.description", target = "productDescription")
    @Mapping(source = "product.imageUrl", target = "imageUrl")
    OrderItemDTO toOrderItemDto(OrderItem orderItem);

    List<OrderDTO> toOrderDtoList(List<Order> orders);
}