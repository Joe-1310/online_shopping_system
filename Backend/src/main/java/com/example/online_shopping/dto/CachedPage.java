package com.example.online_shopping.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class CachedPage<T> {
    private List<T> content;
    private int pageNumber;
    private int pageSize;
    private long totalElements;

    public static <T> CachedPage<T> fromPage(Page<T> page) {
        return new CachedPage<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements()
        );
    }

    public Page<T> toPage() {
        return new PageImpl<>(content, PageRequest.of(pageNumber, pageSize), totalElements);
    }
}
