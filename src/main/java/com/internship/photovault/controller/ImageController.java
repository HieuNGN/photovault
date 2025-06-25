package com.internship.photovault.controller;

import com.internship.photovault.service.ImageService;
import com.internship.photovault.entity.Image;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.List;

@RestController
@RequestMapping("/api/v1/images")
public class ImageController {

    private final ImageService imageService;

    // Constructor Injection for the service
    public ImageController(ImageService imageService) {
        this.imageService = imageService;
    }

    @PostMapping("/upload")
    public ResponseEntity<Image> uploadImage(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        // Delegate the storage logic to the service
        Image savedImage = imageService.storeImage(file);

        // Return a 201 Created status with the saved image's metadata in the body
        return ResponseEntity.status(HttpStatus.CREATED).body(savedImage);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resource> serveImage(@PathVariable Long id) {
        // Retrieve the combined resource and metadata object from the service
        ImageService.ImageResource imageResource = imageService.loadImageAsResource(id);

        // Build the response with the correct headers
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, imageResource.metadata().getContentType())
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + imageResource.metadata().getFileName() + "\"")
                .body(imageResource.resource());
    }
    @GetMapping
    public ResponseEntity<List<Image>> getAllImages() {
        List<Image> images = imageService.listAllImages();
        return ResponseEntity.ok(images);
    }
}