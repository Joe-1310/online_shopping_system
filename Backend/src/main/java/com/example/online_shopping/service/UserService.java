package com.example.online_shopping.service;

import com.example.online_shopping.dto.RegisterRequestDto;
import com.example.online_shopping.dto.RegisterResponseDto;
import com.example.online_shopping.exception.EmailAlreadyExistsException;
import com.example.online_shopping.model.Permission;
import com.example.online_shopping.model.Role;
import com.example.online_shopping.model.Order;
import com.example.online_shopping.model.User;
import com.example.online_shopping.model.UserPrincipal;
import com.example.online_shopping.repository.RoleRepository;
import com.example.online_shopping.repository.OrderRepository;
import com.example.online_shopping.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private RoleRepository roleRepo;

    @Autowired
    AuthenticationManager authManager;

    @Autowired
    private JwtService jwtService;

    @Value("${jwt.security.customer.role}")
    private String customerRole;

    private BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    public UserService(UserRepository userRepository, OrderRepository orderRepository) {
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
    }

    public RegisterResponseDto registerUser(RegisterRequestDto registerRequest) throws Exception {

        if (userRepo.existsByEmail(registerRequest.getEmail())) {
            throw new EmailAlreadyExistsException("Email already exists: " + registerRequest.getEmail());
        }

        if (!registerRequest.getPassword().equals(registerRequest.getConfirmPassword())) {
            throw new Exception("Passwords doesn't match");
        }

        User user = new User();
        user.setUsername(registerRequest.getUsername());
        user.setEmail(registerRequest.getEmail());

        String encodedPassword = encoder.encode(registerRequest.getPassword());
        user.setPassword(encodedPassword);

        // Set role (default to CUSTOMER if not provided)
        String roleName = customerRole;
        Role role = roleRepo.findByRoleName(roleName);
        user.setRole(role);

        User savedUser = userRepo.save(user);

        return new RegisterResponseDto(
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getEmail(),
                savedUser.getRole().getRoleName(),
                "User registered successfully"
        );
    }

    public Map<String, String> verifyUser(String username, String password) {
        Authentication authentication = authManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password));

        if (authentication.isAuthenticated()) {
            UserPrincipal userDetails = (UserPrincipal) authentication.getPrincipal();

            String role = userDetails.getAuthorities().stream()
                    .findFirst()
                    .map(GrantedAuthority::getAuthority)
                    .orElse("ROLE_" + customerRole);
            String accessToken = jwtService.generateAccessToken(username, role);
            String refreshToken = jwtService.generateRefreshToken(username);

            return Map.of(
                    "accessToken", accessToken,
                    "refreshToken", refreshToken);
        }
        throw new RuntimeException("Invalid credentials");
    }

    public Map<String, String> refreshAccessToken(String refreshToken) {
        try {
            String username = jwtService.extractUsername(refreshToken);

            User user = userRepo.findByUsername(username);
            if (user == null) {
                throw new RuntimeException("User not found");
            }

            if (jwtService.isTokenExpired(refreshToken)) {
                throw new RuntimeException("Refresh token expired");
            }

            String role = "ROLE_" + user.getRole().getRoleName();
            String newAccessToken = jwtService.generateAccessToken(username, role);

            String newRefreshToken = jwtService.generateRefreshToken(username);

            return Map.of(
                    "accessToken", newAccessToken,
                    "refreshToken", newRefreshToken);
        } catch (Exception e) {
            throw new RuntimeException("Invalid refresh token");
        }
    }

    public ResponseEntity<?> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Not authenticated");
        }

        String username = authentication.getName();
        User user = userRepo.findByUsername(username);

        List<String> permissions = user.getRole().getPermissions()
                .stream()
                .map(Permission::getPermissionName)
                .toList();

        return ResponseEntity.ok(Map.of(
                "username", user.getUsername(),
                "email", user.getEmail(),
                "role", user.getRole().getRoleName(),
                "permissions", permissions
        ));
    }

    public User updateCurrentUser(User userUpdate) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Not authenticated");
        }

        String username = authentication.getName();
        User currentUser = userRepo.findByUsername(username);

        if (currentUser == null) {
            throw new RuntimeException("User not found");
        }

        // Update only allowed fields (username and email)
        if (userUpdate.getUsername() != null && !userUpdate.getUsername().trim().isEmpty()) {
            currentUser.setUsername(userUpdate.getUsername());
        }

        if (userUpdate.getEmail() != null && !userUpdate.getEmail().trim().isEmpty()) {
            // Check if email is already taken by another user
            User existingUserWithEmail = userRepo.findByEmail(userUpdate.getEmail());
            if (existingUserWithEmail != null && !existingUserWithEmail.getId().equals(currentUser.getId())) {
                throw new RuntimeException("Email already exists");
            }
            currentUser.setEmail(userUpdate.getEmail());
        }

        return userRepo.save(currentUser);
    }


    public Page<User> getUsers(int page, int size, String name, String email, String role, Long id) {
        Pageable pageable = PageRequest.of(page, size);

        try {
            System.out.println("UserService.getUsers() called - attempting to fetch users");

            // Ensure string parameters are properly handled and not null/empty
            String cleanName = (name != null && !name.trim().isEmpty()) ? name.trim() : null;
            String cleanEmail = (email != null && !email.trim().isEmpty()) ? email.trim() : null;
            String cleanRole = (role != null && !role.trim().isEmpty()) ? role.trim() : null;

            // If filters are provided, use the custom query, otherwise use simple findAll
            if (cleanName == null && cleanEmail == null && cleanRole == null && id == null) {
                System.out.println("No filters provided, using findAll()");
                return userRepository.findAll(pageable);
            } else {
                System.out.println("Filters provided, using findUsersWithFilters()");
                System.out.println("Filter values - name: " + cleanName + ", email: " + cleanEmail +
                        ", role: " + cleanRole + ", id: " + id);
                return userRepository.findUsersWithFilters(cleanName, cleanEmail, cleanRole, id, pageable);
            }
        } catch (Exception e) {
            System.err.println("ERROR in UserService.getUsers(): " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public void updateUserRole(Long userId, String newRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        Role role = roleRepo.findByRoleName(newRole);

        user.setRole(role);
        userRepository.save(user);
    }

    public Long getUserOrderCount(Long userId) {
        return orderRepository.countByUserId(userId);
    }

    public String getUserLastOrderDate(Long userId) {
        Optional<Order> lastOrder = orderRepository.findFirstByUserIdOrderByCreatedAtDesc(userId);
        return lastOrder.map(order -> order.getCreatedAt().toString()).orElse(null);
    }

}
