package com.example.online_shopping.service;

import com.example.online_shopping.model.User;
import com.example.online_shopping.model.UserPrincipal;
import com.example.online_shopping.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.exceptions.JedisConnectionException;

import java.util.Collections;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class MyUserDetailsService implements UserDetailsService {

    private final UserRepository repo;
    private final Jedis jedis;

    @Autowired
    public MyUserDetailsService(UserRepository repo, @Autowired(required = false) Jedis jedis) {
        this.repo = repo;
        this.jedis = jedis;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = repo.findByUsername(username);

        if (user == null) {
            throw new UsernameNotFoundException("User not found: " + username);
        }

        Set<String> permissions = Collections.emptySet();

        if (jedis == null) {
            System.out.println("Redis not available, falling back to DB...");
            permissions = user.getRole().getPermissions().stream()
                    .map(p -> p.getPermissionName())
                    .collect(Collectors.toSet());
        } else {
            String redisKey = "role:" + user.getRole().getRoleName();

            permissions = jedis.smembers(redisKey);

            if (permissions == null || permissions.isEmpty()) {
                permissions = user.getRole().getPermissions().stream()
                        .map(p -> p.getPermissionName())
                        .collect(Collectors.toSet());

                if (!permissions.isEmpty()) {
                    jedis.del(redisKey);
                    jedis.sadd(redisKey, permissions.toArray(new String[0]));
                    System.out.println("Cached permissions for " + redisKey + " in Redis.");
                }
            } else{
                System.out.println("Retrieved Permissions from Redis: " + permissions);
            }
        }

        return new UserPrincipal(user, permissions);
    }
}