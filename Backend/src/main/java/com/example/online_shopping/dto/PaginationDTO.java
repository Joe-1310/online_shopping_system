package com.example.online_shopping.dto;

import org.springframework.web.bind.annotation.RequestParam;

public record PaginationDTO (
        Integer page,
        Integer size,
        String sortBy,
        String direction
) {
}
