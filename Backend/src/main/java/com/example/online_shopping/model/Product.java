package com.example.online_shopping.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private Integer stock;
    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;
    private String imageUrl;
}
