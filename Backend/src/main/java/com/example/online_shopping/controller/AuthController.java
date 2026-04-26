package com.example.online_shopping.controller;

import com.example.online_shopping.dto.CustomerInfoDto;
import com.example.online_shopping.dto.ProductCustomerRequestDto;
import com.example.online_shopping.dto.RegisterRequestDto;
import com.example.online_shopping.dto.RegisterResponseDto;
import com.example.online_shopping.model.User;
import com.example.online_shopping.service.OrderService;
import com.example.online_shopping.service.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserService service;

    @Value("${jwt.access-token.expiration-minutes}")
    private int accessTokenExpirationMinutes;

    @Value("${jwt.refresh-token.expiration-minutes}")
    private int refreshTokenExpirationMinutes;

    @Autowired
    private OrderService orderService;


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User user, HttpServletResponse response) {
        Map<String, String> tokens = service.verifyUser(user.getUsername(), user.getPassword());

        Cookie accessCookie = new Cookie("accessToken", tokens.get("accessToken"));
        accessCookie.setHttpOnly(true);
        accessCookie.setSecure(false);
        accessCookie.setPath("/");
        accessCookie.setMaxAge(accessTokenExpirationMinutes * 60);

        Cookie refreshCookie = new Cookie("refreshToken", tokens.get("refreshToken"));
        refreshCookie.setHttpOnly(true);
        refreshCookie.setSecure(false);
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge(refreshTokenExpirationMinutes * 60);

        response.addCookie(accessCookie);
        response.addCookie(refreshCookie);

        return ResponseEntity.ok(Map.of(
                "message", "Login successful",
                "username", user.getUsername()
        ));
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(
            @Valid @RequestBody RegisterRequestDto registerRequest, HttpServletResponse response) {
        try {
            RegisterResponseDto user = service.registerUser(registerRequest);

            Map<String, String> tokens = service.verifyUser(registerRequest.getUsername(), registerRequest.getPassword());

            ResponseCookie accessCookie = ResponseCookie.from("accessToken", tokens.get("accessToken"))
                    .httpOnly(true)
                    .secure(false)
                    .sameSite("Strict")
                    .path("/")
                    .maxAge(accessTokenExpirationMinutes * 60L)
                    .build();

            ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", tokens.get("refreshToken"))
                    .httpOnly(true)
                    .secure(false)
                    .sameSite("Strict")
                    .path("/")
                    .maxAge(refreshTokenExpirationMinutes * 60L)
                    .build();

            response.addHeader(HttpHeaders.SET_COOKIE, accessCookie.toString());
            response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

            return new ResponseEntity<>(user, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = null;
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("refreshToken".equals(cookie.getName())) {
                    refreshToken = cookie.getValue();
                    break;
                }
            }
        }
        if (refreshToken == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Refresh token missing");
        }

        Map<String, String> tokens = service.refreshAccessToken(refreshToken);

        Cookie accessCookie = new Cookie("accessToken", tokens.get("accessToken"));
        accessCookie.setHttpOnly(true);
        accessCookie.setSecure(false);
        accessCookie.setPath("/");
        accessCookie.setMaxAge(accessTokenExpirationMinutes * 60);

        Cookie refreshCookie = new Cookie("refreshToken", tokens.get("refreshToken"));
        refreshCookie.setHttpOnly(true);
        refreshCookie.setSecure(false);
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge(refreshTokenExpirationMinutes * 60);

        response.addCookie(accessCookie);
        response.addCookie(refreshCookie);

        return ResponseEntity.ok("Access token refreshed");
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        return service.getCurrentUser();
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateCurrentUser(@RequestBody User userUpdate) {
        try {
            User updatedUser = service.updateCurrentUser(userUpdate);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        Cookie accessCookie = new Cookie("accessToken", null);
        accessCookie.setHttpOnly(true);
        accessCookie.setSecure(false);
        accessCookie.setPath("/");
        accessCookie.setMaxAge(0);

        Cookie refreshCookie = new Cookie("refreshToken", null);
        refreshCookie.setHttpOnly(true);
        refreshCookie.setSecure(false);
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge(0);

        response.addCookie(accessCookie);
        response.addCookie(refreshCookie);

        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @PostMapping("/products/customers")
    public ResponseEntity<?> getCustomersByProductAndDateRange(
            @Valid @RequestBody ProductCustomerRequestDto request) {

        try {
            List<CustomerInfoDto> customers = orderService.getCustomersByProductAndDateRange(request);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("customers", customers);
            response.put("totalCount", customers.size());
            response.put("productId", request.getProductId());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("error", e.getMessage());

            return ResponseEntity.badRequest().body(errorResponse);
        }
    }
}

