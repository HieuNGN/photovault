package com.internship.photovault.controller;

import com.internship.photovault.entity.Image;
import com.internship.photovault.exception.ImageNotFoundException;
import com.internship.photovault.exception.InvalidFileTypeException;
import com.internship.photovault.service.ImageService;
import jakarta.validation.constraints.NotNull;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/images")
@CrossOrigin(origins = "*")
@Validated
public class ImageController {

    private final ImageService imageService;

    public ImageController(ImageService imageService) {
        this.imageService = imageService;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadImage(@RequestParam("file") @NotNull MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "File cannot be empty"));
            }

            Image savedImage = imageService.saveImage(file);
            return ResponseEntity.ok(Map.of(
                    "message", "Image uploaded successfully",
                    "image", savedImage
            ));
        } catch (InvalidFileTypeException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to upload image: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<Page<Image>> getAllImages(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "uploadDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Pageable pageable = PageRequest.of(page, size,
                sortDir.equalsIgnoreCase("desc") ?
                        Sort.by(sortBy).descending() : Sort.by(sortBy).ascending());

        Page<Image> images = imageService.getAllImages(pageable);
        return ResponseEntity.ok(images);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getImageById(@PathVariable Long id) {
        try {
            Image image = imageService.getImageById(id);
            return ResponseEntity.ok(image);
        } catch (ImageNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadImage(@PathVariable Long id) {
        try {
            Image image = imageService.getImageById(id);
            Resource resource = imageService.loadImageAsResource(image.getStoredFilename());

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(image.getContentType()))
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + image.getOriginalFilename() + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/favorite")
    public ResponseEntity<?> toggleFavorite(@PathVariable Long id) {
        try {
            Image image = imageService.toggleFavorite(id);
            return ResponseEntity.ok(Map.of(
                    "message", "Favorite status updated",
                    "isFavorite", image.getIsFavorite()
            ));
        } catch (ImageNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/favorites")
    public ResponseEntity<List<Image>> getFavorites() {
        List<Image> favorites = imageService.getFavorites();
        return ResponseEntity.ok(favorites);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Image>> searchImages(@RequestParam String query) {
        List<Image> results = imageService.searchImages(query);
        return ResponseEntity.ok(results);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = imageService.getImageStats();
        return ResponseEntity.ok(stats);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteImage(@PathVariable Long id) {
        try {
            imageService.moveToTrash(id);
            return ResponseEntity.ok(Map.of("message", "Image moved to trash"));
        } catch (ImageNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/archive")
    public ResponseEntity<?> toggleArchive(@PathVariable Long id) {
        try {
            Image image = imageService.toggleArchive(id);
            return ResponseEntity.ok(Map.of(
                    "message", "Archive status updated",
                    "isArchived", image.getIsArchived()
            ));
        } catch (ImageNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
