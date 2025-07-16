package com.internship.photovault.controller;

import com.internship.photovault.entity.Image;
import com.internship.photovault.entity.User;
import com.internship.photovault.exception.ImageNotFoundException;
import com.internship.photovault.exception.InvalidFileTypeException;
import com.internship.photovault.service.ImageService;
import com.internship.photovault.service.UserService;
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

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/images")
//@CrossOrigin(origins = "*")
@Validated
public class ImageController {

    private final ImageService imageService;
    private final UserService userService;

    public ImageController(ImageService imageService, UserService userService) {
        this.imageService = imageService;
        this.userService = userService;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadImage(@RequestParam("file") @NotNull MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "File cannot be empty"));
            }

            User currentUser = userService.getCurrentUser();
//            Image savedImage = imageService.saveImage(file, currentUser);

            Image savedImage = imageService.saveImage(file, currentUser);
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

    @PostMapping("/upload/multiple")
    public ResponseEntity<?> uploadMultipleImages(@RequestParam("files") @NotNull MultipartFile[] files) {
        try {
            if (files.length == 0) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "No files uploaded"));
            }


            List<Map<String, Object>> results = new ArrayList<>();
            List<Image> successfulUploads = new ArrayList<>();
            List<Map<String, String>> failedUploads = new ArrayList<>();

            for (int i = 0; i < files.length; i++) {
                MultipartFile file = files[i];
                try {
                    if (!file.isEmpty()) {
                        Image savedImage = imageService.saveImage(file, userService.getCurrentUser());
                        successfulUploads.add(savedImage);
                        results.add(Map.of(
                                "index", i,
                                "filename", file.getOriginalFilename(),
                                "status", "success",
                                "image", savedImage
                        ));
                    } else {
                        failedUploads.add(Map.of(
                                "index", String.valueOf(i),
                                "filename", file.getOriginalFilename() != null ? file.getOriginalFilename() : "unknown",
                                "error", "File is empty"
                        ));
                    }
                } catch (InvalidFileTypeException e) {
                    failedUploads.add(Map.of(
                            "index", String.valueOf(i),
                            "filename", file.getOriginalFilename() != null ? file.getOriginalFilename() : "unknown",
                            "error", e.getMessage()
                    ));
                } catch (Exception e) {
                    failedUploads.add(Map.of(
                            "index", String.valueOf(i),
                            "filename", file.getOriginalFilename() != null ? file.getOriginalFilename() : "unknown",
                            "error", "Upload failed: " + e.getMessage()
                    ));
                }
            }

            return ResponseEntity.ok(Map.of(
                    "message", String.format("Processed %d files: %d successful, %d failed",
                            files.length, successfulUploads.size(), failedUploads.size()),
                    "successful", successfulUploads.size(),
                    "failed", failedUploads.size(),
                    "results", results,
                    "errors", failedUploads
            ));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to process uploads: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<Page<Image>> getAllImages(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "sortBy", defaultValue = "uploadDate") String sortBy,
            @RequestParam(value = "sortDir", defaultValue = "desc") String sortDir) {

        User currentUser = userService.getCurrentUser();

        Pageable pageable = PageRequest.of(page, size,
                sortDir.equalsIgnoreCase("desc") ?
                        Sort.by(sortBy).descending() : Sort.by(sortBy).ascending());

        Page<Image> images = imageService.getAllImages(currentUser, pageable);
            return ResponseEntity.ok(images);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getImageById(@PathVariable("id") Long id) {
        try {
            User currentUser = userService.getCurrentUser();
            Image image = imageService.getImageById(id, currentUser);
            return ResponseEntity.ok(image);
        } catch (ImageNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadImage(@PathVariable("id") Long id) {
        try {
            User currentUser = userService.getCurrentUser();
            Image image = imageService.getImageById(id, currentUser);
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
    public ResponseEntity<?> toggleFavorite(@PathVariable("id") Long id) {
        try {
            User currentUser = userService.getCurrentUser();
            Image image = imageService.toggleFavorite(id, currentUser);
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
        User currentUser = userService.getCurrentUser();
        List<Image> favorites = imageService.getFavorites(currentUser);
        return ResponseEntity.ok(favorites);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Image>> searchImages(@RequestParam("query") String query) {
        List<Image> results = imageService.searchImages(query, userService.getCurrentUser());
        return ResponseEntity.ok(results);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        User currentUser = userService.getCurrentUser();
        Map<String, Object> stats = imageService.getImageStats(currentUser);
        return ResponseEntity.ok(stats);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteImage(@PathVariable("id") Long id) {
        try {
            User currentUser = userService.getCurrentUser();
            imageService.moveToTrash(id, currentUser);
//            imageService.moveToTrash(id);
            return ResponseEntity.ok(Map.of("message", "Item moved to trash"));
        } catch (ImageNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/archive")
    public ResponseEntity<?> toggleArchive(@PathVariable("id") Long id) {
        try {
            User currentUser = userService.getCurrentUser();
            Image image = imageService.toggleArchive(id, currentUser);
            return ResponseEntity.ok(Map.of(
                    "message", "Archive status updated",
                    "isArchived", image.getIsArchived()
            ));
        } catch (ImageNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/archived")
    public ResponseEntity<List<Image>> getArchivedImages() {
        User currentUser = userService.getCurrentUser();
        List<Image> archivedImages = imageService.getArchivedImages(currentUser);
        return ResponseEntity.ok(archivedImages);
    }

//    adding the backend endpoints for the trash and restore functions
    @GetMapping("/trash")
    public ResponseEntity<List<Image>> getTrashedImages() {
        User currentUser = userService.getCurrentUser();
        List<Image> trashedImages = imageService.getTrashedImages(currentUser);
        return ResponseEntity.ok(trashedImages);
    }
    @PutMapping("/{id}/restore")
    public ResponseEntity<?> restoreImage(@PathVariable("id") Long id) {
        try {
            User currentUser = userService.getCurrentUser();
            Image image = imageService.restoreFromTrash(id, currentUser);
            return ResponseEntity.ok(Map.of(
                    "message", "Item restored from trash",
                    "image", image
            ));
        } catch (ImageNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
    @DeleteMapping("/{id}/permanent")
    public ResponseEntity<?> deletePermanently(@PathVariable("id") Long id) {
        try {
            imageService.deletePermanently(id, userService.getCurrentUser());
            return ResponseEntity.ok(Map.of("message", "Item permanently deleted"));
        } catch (ImageNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/{id}/thumbnail")
    public ResponseEntity<Resource> getThumbnail(@PathVariable("id") Long id) {
        try {
            // Use internal method to bypass deletion check
            User currentUser = userService.getCurrentUser();
            Image image = imageService.getImageByIdInternal(id);
            Resource resource = imageService.loadImageAsResource(image.getStoredFilename());

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(image.getContentType()))
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}