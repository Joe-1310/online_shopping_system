package com.example.online_shopping.controller;

import com.example.online_shopping.dto.InvoiceDTO;
import com.example.online_shopping.model.Order;
import com.example.online_shopping.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;


    @GetMapping("/export")
    public ResponseEntity<?> exportInvoice(
            @RequestParam Long customerId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        InvoiceDTO invoice = invoiceService.getOrderForInvoice(customerId, startDate, endDate);
        return ResponseEntity.ok(invoice);
    }
}






