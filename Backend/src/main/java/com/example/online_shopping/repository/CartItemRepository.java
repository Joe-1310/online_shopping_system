package com.example.online_shopping.repository;

import com.example.online_shopping.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    
    @Query("SELECT ci FROM CartItem ci JOIN FETCH ci.product WHERE ci.user.id = :userId")
    List<CartItem> findByUserIdWithProduct(Long userId);
    Optional<CartItem> findByUserIdAndProductId(@Param("userId") Long userId, @Param("productId") Long productId);
    void deleteByUserId(Long userId);
    @Modifying
    @Query("DELETE FROM CartItem c WHERE c.user.id = :userId")
    void deleteAllByUserId(@Param("userId") Long userId);


}