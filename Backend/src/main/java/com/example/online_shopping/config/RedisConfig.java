package com.example.online_shopping.config;

import com.example.online_shopping.dto.CachedPage;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.cache.CacheManager;
import org.springframework.cache.support.NoOpCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import redis.clients.jedis.Jedis;

@Configuration
public class RedisConfig {

    @Bean
    public CacheManager cacheManager(RedisConnectionFactory connectionFactory, ObjectMapper objectMapper) {
        try {
            Jackson2JsonRedisSerializer<CachedPage> serializer =
                    new Jackson2JsonRedisSerializer<>(objectMapper, CachedPage.class);

            RedisCacheConfiguration cacheConfig = RedisCacheConfiguration.defaultCacheConfig()
                    .entryTtl(Duration.ofMinutes(10))
                    .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(serializer))
                    .disableCachingNullValues();

            // Test Redis connection
            connectionFactory.getConnection().ping();
            System.out.println("Connected to Redis, caching enabled.");

            return RedisCacheManager.builder(connectionFactory)
                    .cacheDefaults(cacheConfig)
                    .build();
        } catch (Exception e) {
            System.out.println("Redis not available. Falling back to NoOpCacheManager.");
            return new NoOpCacheManager();
        }
    }

    @Bean
    public Jedis jedis() {
        try {
            Jedis jedis = new Jedis("localhost", 6379);
            jedis.ping();
            System.out.println("Connected to Redis.");
            return jedis;
        } catch (Exception e) {
            System.out.println("Redis not available. Continuing without caching.");
            return null;
        }
    }
}
