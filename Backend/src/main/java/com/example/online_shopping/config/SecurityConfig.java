package com.example.online_shopping.config;

import com.example.online_shopping.Enum.PermissionEnum;
import com.example.online_shopping.model.User;
import com.example.online_shopping.repository.UserRepository;
import com.example.online_shopping.service.JwtService;
import jakarta.servlet.http.Cookie;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private JwtFilter jwtFilter;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private UserRepository userRepo;

    @Value("${jwt.security.customer.role}")
    private String customerRole;

    @Value("${jwt.access-token.expiration-minutes}")
    private int accessTokenExpirationMinutes;

    @Value("${jwt.refresh-token.expiration-minutes}")
    private int refreshTokenExpirationMinutes;

    @Value("${frontend.url}")
    private String frontendUrl;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http.cors(cors -> cors.configurationSource(corsConfigurationSource()));

        return http.csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(request -> request
                        .requestMatchers("/auth/register", "/auth/login", "/auth/refresh", "/oauth/google", "/oauth/github", "/oauth/github/*").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/products", "/api/v1/products/*", "/api/v1/categories", "/auth/me", "/api/v1/category/*").permitAll()

                        .requestMatchers(HttpMethod.POST, "/api/v1/cart").hasAuthority(PermissionEnum.CART_CREATE.name())
                        .requestMatchers(HttpMethod.GET, "/api/v1/cart").hasAuthority(PermissionEnum.CART_READ.name())
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/cart/*").hasAuthority(PermissionEnum.CART_DELETE.name())
                        .requestMatchers(HttpMethod.POST, "/api/v1/stripe/create-checkout-session").hasAuthority(PermissionEnum.CART_READ.name())
                        .requestMatchers(HttpMethod.GET, "/api/v1/stripe/test", "/api/v1/stripe/health").permitAll()

                        .requestMatchers(HttpMethod.GET, "/api/v1/orders").hasAnyAuthority(PermissionEnum.ORDER_LIST.name(), PermissionEnum.ORDER_READ.name())
                        .requestMatchers(HttpMethod.POST, "/api/v1/orders").hasAuthority(PermissionEnum.ORDER_CREATE.name())
                        .requestMatchers(HttpMethod.GET, "/api/v1/invoices").hasAuthority(PermissionEnum.INVOICE_READ.name())

                        .requestMatchers(HttpMethod.POST, "/api/v1/products").hasAuthority(PermissionEnum.PRODUCT_CREATE.name())
                        .requestMatchers(HttpMethod.PUT, "/api/v1/products/*").hasAuthority(PermissionEnum.PRODUCT_UPDATE.name())
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/products/*").hasAuthority(PermissionEnum.PRODUCT_DELETE.name())

                        .requestMatchers(HttpMethod.POST, "/api/v1/category").hasAuthority(PermissionEnum.CATEGORY_CREATE.name())
                        .requestMatchers(HttpMethod.PUT, "/api/v1/category").hasAuthority(PermissionEnum.CATEGORY_UPDATE.name())
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/category/*").hasAuthority(PermissionEnum.CATEGORY_DELETE.name())

                        .requestMatchers(HttpMethod.POST, "/api/v1/admin/products/customers").hasAuthority(PermissionEnum.ADMIN_PRODUCTS_CUSTOMERS.name())

                        .requestMatchers(HttpMethod.POST, "/auth/logout").hasAnyAuthority(PermissionEnum.CUSTOMER_LOGOUT.name(), PermissionEnum.ADMIN_LOGOUT.name())

                        .anyRequest().authenticated()
                )
                .formLogin(form -> form.disable())
                .httpBasic(basic -> basic.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .build();


    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of(frontendUrl));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

}
