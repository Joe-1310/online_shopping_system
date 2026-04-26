package com.example.online_shopping.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import io.jsonwebtoken.io.IOException;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import javax.annotation.PostConstruct;
import java.io.FileInputStream;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {
    @PostConstruct
    public void init() throws IOException, java.io.IOException {
        ClassPathResource resource = new ClassPathResource("online-shopping-e-and-firebase-adminsdk-fbsvc-ea0af39e5f.json");
        try (InputStream serviceAccount = resource.getInputStream()) {
            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .setStorageBucket("online-shopping-e-and.firebasestorage.app")
                    .build();

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
            }
        }
    }
}
