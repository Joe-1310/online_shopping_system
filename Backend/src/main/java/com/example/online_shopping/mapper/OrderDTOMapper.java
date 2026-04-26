package com.example.online_shopping.mapper;

import com.example.online_shopping.dto.OrderDTO;
import com.example.online_shopping.dto.OrderItemDTO;
import com.example.online_shopping.model.Order;
import com.example.online_shopping.model.OrderItem;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface OrderDTOMapper {
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(source = "items", target = "orderItems")
    Order toOrder(OrderDTO orderDTO);

    @Mapping(target = "order", ignore = true)
    @Mapping(source = "productId", target = "product.id")
    OrderItem toOrderItem(OrderItemDTO orderItemDTO);

    @AfterMapping
    default void linkChildren(@MappingTarget Order order) {
        if (order.getOrderItems() != null) {
            for (OrderItem item : order.getOrderItems()) {
                item.setOrder(order); // set back-reference
            }
        }
    }

}
