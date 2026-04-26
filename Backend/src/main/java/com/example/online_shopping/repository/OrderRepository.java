package com.example.online_shopping.repository;

import com.example.online_shopping.dto.OrderDTO;
import com.example.online_shopping.model.Order;
import com.example.online_shopping.model.User;

import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(Long userId);
    @Query("SELECT DISTINCT o.user FROM Order o " +
            "JOIN o.orderItems oi " +
            "WHERE oi.product.id = :productId " +
            "AND o.createdAt >= :startDate " +
            "AND o.createdAt <= :endDate " +
            "ORDER BY o.user.username")
    List<User> findCustomersByProductAndDateRange(
            @Param("productId") Long productId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
    List<Order> findByUserIdAndCreatedAtBetween(
            @Param("userId") Long userId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
    Long countByUserId(Long userId);
    Optional<Order> findFirstByUserIdOrderByCreatedAtDesc(Long userId);
    Page<Order> findByUserIdOrderByCreatedAtDesc(Long userId, org.springframework.data.domain.Pageable pageable);
    
    @Query("SELECT o FROM Order o WHERE " +
           "(:orderId IS NULL OR o.id = :orderId) AND " +
           "(:userId IS NULL OR o.user.id = :userId) AND " +
           "(:username IS NULL OR :username = '' OR LOWER(o.user.username) LIKE LOWER(CONCAT('%', :username, '%'))) AND " +
           "(:status IS NULL OR :status = '' OR UPPER(o.status) = UPPER(:status)) AND " +
           "(:startDate IS NULL OR DATE(o.createdAt) >= :startDate) AND " +
           "(:endDate IS NULL OR DATE(o.createdAt) <= :endDate) " +
           "ORDER BY o.createdAt DESC")
    Page<Order> findOrdersWithFilters(
            @Param("orderId") Long orderId,
            @Param("userId") Long userId,
            @Param("username") String username,
            @Param("status") String status,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            Pageable pageable);
}