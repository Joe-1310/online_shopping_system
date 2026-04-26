package com.example.online_shopping.config;

import com.example.online_shopping.model.Role;
import com.example.online_shopping.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import redis.clients.jedis.Jedis;

@Configuration
public class RedisDataLoader {

    @Bean
    CommandLineRunner loadRolesIntoRedis(RoleRepository roleRepository, Jedis jedis) {
        return args -> {
            if (jedis == null) {
                System.out.println("Skipping Redis role/permission loading (Redis not available).");
                return;
            }

            try {
                roleRepository.findAll().forEach(role -> {
                    String redisKey = "role:" + role.getRoleName();

                    jedis.del(redisKey);

                    role.getPermissions().forEach(permission ->
                            jedis.sadd(redisKey, permission.getPermissionName())
                    );
                });

                System.out.println("Roles and permissions loaded into Redis.");
            } catch (Exception e) {
                System.out.println("Failed to load roles into Redis: " + e.getMessage());
            }
        };
    }
}
