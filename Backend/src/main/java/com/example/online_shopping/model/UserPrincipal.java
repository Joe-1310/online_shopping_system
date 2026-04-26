package com.example.online_shopping.model;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

public class UserPrincipal implements UserDetails {

    private User user;
    private final Set<String> cachedPermissions;

    public UserPrincipal(User user, Set<String> cachedPermissions) {
        this.user = user;
        this.cachedPermissions = cachedPermissions != null ? cachedPermissions : Collections.emptySet();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        Set<GrantedAuthority> authorities = new HashSet<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_" + user.getRole().getRoleName()));

        cachedPermissions.forEach(permission ->
                authorities.add(new SimpleGrantedAuthority(permission))
        );

        return authorities;
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        return user.getUsername();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
