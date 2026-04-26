package com.example.online_shopping.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RegisterResponseDto {

    private Long id;
    private String username;
    private String email;
    private String role;
    private String message;

}
