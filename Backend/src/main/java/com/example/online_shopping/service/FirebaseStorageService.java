package com.example.online_shopping.service;

import io.jsonwebtoken.io.IOException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Value;

import java.util.UUID;

@Service
public class FirebaseStorageService {

    @Value("${firebase.storage.bucket}")
    private String bucketName;

    public String uploadProductImage(Long productId, MultipartFile file) throws IOException, java.io.IOException {

        String original = file.getOriginalFilename() != null ? file.getOriginalFilename() : "image";
        String ext = original.contains(".") ? original.substring(original.lastIndexOf('.')) : "";
        String objectName = "products/" + productId + "/" + UUID.randomUUID() + ext;

        String downloadToken = UUID.randomUUID().toString();

        var bucket = com.google.firebase.cloud.StorageClient.getInstance().bucket(bucketName);

        // token + content type
        var blobId = com.google.cloud.storage.BlobId.of(bucket.getName(), objectName);
        var blobInfo = com.google.cloud.storage.BlobInfo.newBuilder(blobId)
                .setContentType(file.getContentType())
                .setMetadata(java.util.Map.of("firebaseStorageDownloadTokens", downloadToken))
                .build();

        // upload
        bucket.getStorage().create(blobInfo, file.getBytes());

        String url = String.format(
                "https://firebasestorage.googleapis.com/v0/b/%s/o/%s?alt=media&token=%s",
                bucket.getName(),
                java.net.URLEncoder.encode(objectName, java.nio.charset.StandardCharsets.UTF_8),
                downloadToken
        );

        return url;
    }

    public void deleteByUrl(String imageUrl) {
        try {
            // استخرج اسم الكائن من الـ URL
            // expect: .../o/products%2F{productId}%2F{uuid}.png?alt=media&token=...
            String pathPart = imageUrl.split("/o/")[1].split("\\?")[0];
            String objectName = java.net.URLDecoder.decode(pathPart, java.nio.charset.StandardCharsets.UTF_8);
            var bucket = com.google.firebase.cloud.StorageClient.getInstance().bucket(bucketName);
            var blob = bucket.get(objectName);
            if (blob != null) blob.delete();
        } catch (Exception ignored) {}
    }
}

