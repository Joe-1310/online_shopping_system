package com.example.online_shopping.repository;

import com.example.online_shopping.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    User findByUsername(String username);

    User findByEmail(String email);

    boolean existsByEmail(String email);

    Page<User> findAll(Pageable pageable);

    @Query("SELECT u FROM User u JOIN u.role r WHERE " +
            "(:name IS NULL OR :name = '' OR LOWER(u.username) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
            "(:email IS NULL OR :email = '' OR LOWER(u.email) LIKE LOWER(CONCAT('%', :email, '%'))) AND " +
            "(:role IS NULL OR :role = '' OR UPPER(r.roleName) = UPPER(:role)) AND " +
            "(:id IS NULL OR u.id = :id)")
    Page<User> findUsersWithFilters(
            @Param("name") String name,
            @Param("email") String email,
            @Param("role") String role,
            @Param("id") Long id,
            Pageable pageable);

}
