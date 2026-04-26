package com.example.online_shopping.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CustomerInfoDto {
    private Long id;
    private String name;
    private String email;
}
