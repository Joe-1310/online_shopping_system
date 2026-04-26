package com.example.online_shopping.service;

import com.example.online_shopping.dto.OrderDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service

public class NotificationService {
    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public NotificationService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate= messagingTemplate;
    }

    public void notifyAdmin(OrderDTO orderDTO){
        messagingTemplate.convertAndSend("/topic/admin/orders", orderDTO);
    }

}
