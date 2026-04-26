package com.example.online_shopping.mapper;

import com.example.online_shopping.dto.CartItemDTO;
import com.example.online_shopping.model.CartItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CartMapper {

    @Mapping(source = "product.id", target = "productId")
    @Mapping(source = "product.name", target = "productName")
    @Mapping(source = "product.price", target = "price")
    CartItemDTO toCartItemDto(CartItem cartItem);

    List<CartItemDTO> toCartItemDtoList(List<CartItem> cartItems);
}