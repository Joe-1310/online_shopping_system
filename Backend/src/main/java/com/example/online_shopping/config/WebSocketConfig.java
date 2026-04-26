package com.example.online_shopping.config;

import com.example.online_shopping.interceptor.WebSocketAuthInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {


   public void configureMessageBroker(MessageBrokerRegistry config){
       config.enableSimpleBroker("/topic");
       config.setApplicationDestinationPrefixes("/app");
   }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        /*
         * ENDPOINT REGISTRATION:
         * This is where clients initially connect before upgrading to STOMP
         */

        registry.addEndpoint("/ws")  // Clients connect to ws://localhost:8080/ws
                .setAllowedOriginPatterns("*")  // Allow all origins (be careful in production!)
                .addInterceptors(new WebSocketAuthInterceptor()) // Add the authentication interceptor
                .withSockJS();  // Enable SockJS fallback for older browsers
    }
}
