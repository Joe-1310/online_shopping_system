package com.example.online_shopping.service;

import com.example.online_shopping.dto.CartDTO;
import com.example.online_shopping.dto.CartItemDTO;
import com.example.online_shopping.mapper.CartMapper;
import com.example.online_shopping.model.CartItem;
import com.example.online_shopping.model.Product;
import com.example.online_shopping.model.User;
import com.example.online_shopping.repository.CartItemRepository;
import com.example.online_shopping.repository.ProductRepository;
import com.example.online_shopping.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final CartMapper cartMapper;
    private final ProductRepository productRepository;

    public CartService(CartItemRepository cartItemRepository, UserRepository userRepository, CartMapper cartMapper, ProductRepository productRepository) {
        this.cartItemRepository = cartItemRepository;
        this.userRepository = userRepository;
        this.cartMapper = cartMapper;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public CartDTO getCartForUser(String username) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        List<CartItem> cartItemsFromDb = cartItemRepository.findByUserIdWithProduct(user.getId());
        List<CartItemDTO> itemDTOs = cartMapper.toCartItemDtoList(cartItemsFromDb);
        return new CartDTO(itemDTOs);
    }

    @Transactional
    public CartDTO addToCart(String username, Long productId, Integer quantity) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getStock() < quantity) {
            throw new RuntimeException("Insufficient stock. Available: " + product.getStock());
        }

        Optional<CartItem> existingCartItemOpt = cartItemRepository.findByUserIdAndProductId(user.getId(), productId);

        CartItem cartItem;
        if (existingCartItemOpt.isPresent()) {

            cartItem = existingCartItemOpt.get();
            int newQuantity = cartItem.getQuantity() + quantity;

            if (newQuantity > product.getStock()) {
                throw new RuntimeException("Total quantity exceeds available stock. Available: " + product.getStock());
            }

            cartItem.setQuantity(newQuantity);
        } else {
            cartItem = CartItem.builder()
                    .user(user)
                    .product(product)
                    .quantity(quantity)
                    .build();
        }

        cartItemRepository.save(cartItem);

        return getCartForUser(user.getUsername());
    }

    @Transactional
    public CartDTO removeFromCart(String username, Long productId) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        Optional<CartItem> cartItemOpt = cartItemRepository.findByUserIdAndProductId(user.getId(), productId);

        if (cartItemOpt.isEmpty()) {
            throw new RuntimeException("Product not found in cart");
        }

        cartItemRepository.delete(cartItemOpt.get());

        return getCartForUser(username);
    }

    @Transactional
    public CartDTO updateCartItemQuantity(String username, Long productId, Integer newQuantity) {

        if (newQuantity <= 0) {
            throw new RuntimeException("Quantity must be greater than 0");
        }

        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        Optional<CartItem> cartItemOpt = cartItemRepository.findByUserIdAndProductId(user.getId(), productId);

        if (cartItemOpt.isEmpty()) {
            throw new RuntimeException("Product not found in cart");
        }

        CartItem cartItem = cartItemOpt.get();
        Product product = cartItem.getProduct();

        if (newQuantity > product.getStock()) {
            throw new RuntimeException("Quantity exceeds available stock. Available: " + product.getStock());
        }

        cartItem.setQuantity(newQuantity);
        cartItemRepository.save(cartItem);

        return getCartForUser(username);
    }

    @Transactional
    public void clearCart(String username) {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found");
        }

        cartItemRepository.deleteByUserId(user.getId());
    }


}