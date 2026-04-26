package com.example.online_shopping.controller;

import com.example.online_shopping.service.OAuthService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.http.HttpClient;
import java.net.http.HttpResponse;
import java.net.http.HttpRequest;
import java.net.URI;
import java.util.Map;

@RestController
@RequestMapping("/oauth")
public class OAuthController {
    private final OAuthService oAuthService;

    @Value("${spring.security.oauth2.client.registration.github.client-id}")
    private String githubClientId;

    @Value("${spring.security.oauth2.client.registration.github.client-secret}")
    private String githubClientSecret;

    @Value("${spring.security.oauth2.client.registration.github.redirect-uri}")
    private String githubRedirectUri;

    public OAuthController(OAuthService oAuthService) {
        this.oAuthService = oAuthService;
    }

    @PostMapping("/google")
    public ResponseEntity<?> loginWithGoogle(@RequestBody Map<String, String> request, HttpServletResponse response) {
        String idToken = request.get("idToken");
        return oAuthService.processGoogleLogin(idToken, response);
    }

    @GetMapping("/github")
    public void redirectToGithub(HttpServletResponse response) throws IOException {
        String githubAuthUrl = "https://github.com/login/oauth/authorize" +
                "?client_id=" + githubClientId +
                "&redirect_uri=" + githubRedirectUri +
                "&scope=user:email";
        response.sendRedirect(githubAuthUrl);
    }

    @GetMapping("/github/callback")
    public void githubCallback(@RequestParam("code") String code,
                               HttpServletResponse response) throws IOException {
        try {
            HttpRequest tokenRequest = HttpRequest.newBuilder()
                    .uri(URI.create("https://github.com/login/oauth/access_token"))
                    .header("Accept", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(
                            "client_id=" + githubClientId +
                                    "&client_secret=" + githubClientSecret +
                                    "&code=" + code +
                                    "&redirect_uri=" + githubRedirectUri
                    ))
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .build();

            HttpClient client = HttpClient.newHttpClient();
            HttpResponse<String> tokenResponse = client.send(tokenRequest, HttpResponse.BodyHandlers.ofString());

            ObjectMapper mapper = new ObjectMapper();
            String accessToken = mapper.readTree(tokenResponse.body()).get("access_token").asText();

            oAuthService.processGithubLogin(accessToken, response);

            response.sendRedirect("http://localhost:4200/shop/dashboard");

        } catch (Exception e) {
            response.sendRedirect("http://localhost:4200/public/login?error=github");
        }
    }

}
