package com.example.online_shopping.service;

import com.example.online_shopping.model.User;
import com.example.online_shopping.repository.RoleRepository;
import com.example.online_shopping.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import java.net.http.HttpRequest;
import java.net.http.HttpClient;
import java.net.http.HttpResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpResponse;
import java.util.Collections;
import java.util.Map;
import java.util.UUID;

@Service
public class OAuthService {
    private final UserRepository userRepo;
    private final RoleRepository roleRepo;
    private final JwtService jwtService;

    @Value("${jwt.security.customer.role}")
    private String customerRole;

    @Value("${jwt.access-token.expiration-minutes}")
    private int accessTokenExpirationMinutes;

    @Value("${jwt.refresh-token.expiration-minutes}")
    private int refreshTokenExpirationMinutes;

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;

    private final GoogleIdTokenVerifier googleVerifier;

    public OAuthService(UserRepository userRepo, RoleRepository roleRepo, JwtService jwtService,
                        @Value("${spring.security.oauth2.client.registration.google.client-id}") String googleClientId) {
        this.userRepo = userRepo;
        this.roleRepo = roleRepo;
        this.jwtService = jwtService;
        this.googleClientId = googleClientId;

        this.googleVerifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(), new JacksonFactory()
        ).setAudience(Collections.singletonList(googleClientId)).build();
    }

    public ResponseEntity<?> processGoogleLogin(String idTokenString, HttpServletResponse response) {
        try {
            GoogleIdToken idToken = googleVerifier.verify(idTokenString);
            if (idToken == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid Google token");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");

            if (!userRepo.existsByEmail(email)) {
                User newUser = new User();
                newUser.setUsername(email.split("@")[0]);
                newUser.setEmail(email);
                newUser.setRole(roleRepo.findByRoleName(customerRole));
                newUser.setPassword("oauth2-login");
                userRepo.save(newUser);
            }
            User user = userRepo.findByUsername(email.split("@")[0]);

            return issueTokensAndSetCookies(user, response);

        } catch (Exception e) {
            System.out.println(e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Google login failed: " + e.getMessage());
        }
    }

    public ResponseEntity<?> processGithubLogin(String accessToken, HttpServletResponse response) {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.github.com/user"))
                    .header("Authorization", "Bearer " + accessToken)
                    .build();

            HttpClient client = HttpClient.newHttpClient();
            HttpResponse<String> httpResponse = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (httpResponse.statusCode() != 200) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid GitHub token");
            }

            ObjectMapper mapper = new ObjectMapper();
            JsonNode node = mapper.readTree(httpResponse.body());

            String email = node.has("email") && !node.get("email").isNull()
                    ? node.get("email").asText()
                    : node.get("login").asText() + "@github.com";
            String username = node.get("login").asText();
            String name = node.has("name") && !node.get("name").isNull()
                    ? node.get("name").asText()
                    : username;

            if (!userRepo.existsByEmail(email)) {
                User newUser = new User();
                newUser.setUsername(username);
                newUser.setEmail(email);
                newUser.setRole(roleRepo.findByRoleName(customerRole));
                newUser.setPassword("oauth2-login");
                userRepo.save(newUser);
            }
            User user = userRepo.findByUsername(username);

            return issueTokensAndSetCookies(user, response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("GitHub login failed: " + e.getMessage());
        }
    }

    private ResponseEntity<?> issueTokensAndSetCookies(User user, HttpServletResponse response) {
        String role = "ROLE_" + user.getRole().getRoleName();
        String accessToken = jwtService.generateAccessToken(user.getUsername(), role);
        String refreshToken = jwtService.generateRefreshToken(user.getUsername());

        Cookie accessCookie = new Cookie("accessToken", accessToken);
        accessCookie.setHttpOnly(true);
        accessCookie.setSecure(false);
        accessCookie.setPath("/");
        accessCookie.setMaxAge(accessTokenExpirationMinutes * 60);

        Cookie refreshCookie = new Cookie("refreshToken", refreshToken);
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
}
