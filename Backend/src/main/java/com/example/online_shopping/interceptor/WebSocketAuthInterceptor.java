package com.example.online_shopping.interceptor;

import com.example.online_shopping.service.JwtService;
import com.example.online_shopping.service.MyUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.List;
import java.util.Map;

@Component
public class WebSocketAuthInterceptor implements HandshakeInterceptor {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private MyUserDetailsService userDetailsService;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
        List<String> authHeaders = request.getHeaders().get("Authorization");

        if (authHeaders != null && !authHeaders.isEmpty()) {
            String token = authHeaders.get(0).substring(7);

            String username = jwtService.extractUsername(token);
            if (username != null) {
                var userDetails = userDetailsService.loadUserByUsername(username);

                if (jwtService.validateToken(token, userDetails)) {
                    attributes.put("username", username);
                    attributes.put("authorities", userDetails.getAuthorities());
                    return true;
                }
            }
        }

        return false;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
    }
}

