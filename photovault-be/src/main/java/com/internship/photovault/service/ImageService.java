package com.internship.photovault.service;

import com.internship.photovault.config.FileValidationConfig;
import com.internship.photovault.entity.Image;
import com.internship.photovault.exception.ImageNotFoundException;
import com.internship.photovault.exception.InvalidFileTypeException;
import com.internship.photovault.repository.ImageRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class ImageService {

    private final Path storageLocation;
    private final ImageRepository imageRepository;
    private final FileValidationConfig fileValidationConfig;

    public ImageService(@Value("${DB_LOCATION}") String storageLocationPath,
                        ImageRepository imageRepository,
                        FileValidationConfig fileValidationConfig) {
        this.storageLocation = Paths.get(storageLocationPath).toAbsolutePath().normalize();
        this.imageRepository = imageRepository;
        this.fileValidationConfig = fileValidationConfig;

        try {
            Files.createDirectories(this.storageLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not create the storage directory.", e);
        }
    }

    public Image saveImage(MultipartFile file) throws IOException {
        // File size validation
        long maxFileSize = 10 * 1024 * 1024; // 10MB
        if (file.getSize() > maxFileSize) {
            throw new MaxUploadSizeExceededException(maxFileSize);
        }

        // Validate file type using injected config
        if (!fileValidationConfig.isValidImageType(file.getContentType())) {
            throw new InvalidFileTypeException("Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.");
        }

        // Generate unique filename
        String originalFileName = file.getOriginalFilename();
        String fileExtension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        String storedFilename = UUID.randomUUID() + fileExtension;

        // Store the file
        Path targetLocation = this.storageLocation.resolve(storedFilename);
        Files.copy(file.getInputStream(), targetLocation);

        // Create and save image entity
        Image image = new Image();
        image.setOriginalFilename(originalFileName);
        image.setFilename(originalFileName);
        image.setStoredFilename(storedFilename);
        image.setFilePath(targetLocation.toString());
        image.setFileSize(file.getSize());
        image.setContentType(file.getContentType());
        image.setUploadDate(LocalDateTime.now());

        return imageRepository.save(image);
    }

    // Proper Page filtering for active images only, deprecated method, manual and slow
//    public Page<Image> getAllImages(Pageable pageable) {
//        Page<Image> allImages = imageRepository.findAll(pageable);
//        List<Image> activeImages = allImages.getContent().stream()
//                .filter(image -> !image.getIsDeleted() && !image.getIsArchived())
//                .toList();
//
//        return new PageImpl<>(activeImages, pageable, getTotalActiveImageCount());
//    }

    public Page<Image> getAllImages(Pageable pageable) {
        return imageRepository.findAllActiveImages(pageable);
    }

    // return active (non-deleted, non-archived) images
    public List<Image> getAllImages() {
        return imageRepository.findAllActiveImages();
    }

    public List<Image> getFavorites() {
        return imageRepository.findFavoriteImages();
    }

    public List<Image> getTrashedImages() {
        return imageRepository.findTrashImages();
    }

    // Use search in repo instead of non-optimized manual search
    public List<Image> searchImages(String query) {
        return imageRepository.searchByOriginalFilename(query);
    }

//    safe to remove, not used
//    private long getTotalActiveImageCount() {
//        return imageRepository.findAll().stream()
//                .filter(image -> !image.getIsDeleted() && !image.getIsArchived())
//                .count();
//    }

    // Separate method for getting image by ID without deletion check (for internal use)
    // Make the internal method public for thumbnail access
    public Image getImageByIdInternal(Long id) {
        return imageRepository.findById(id)
                .orElseThrow(() -> new ImageNotFoundException("Image not found with id: " + id));
    }

    // Public method that checks for deletion
    public Image getImageById(Long id) {
        Image image = getImageByIdInternal(id);
        if (image.getIsDeleted()) {
            throw new ImageNotFoundException("Image has been deleted with id: " + id);
        }
        return image;
    }

    public List<Image> getArchivedImages() {
        return imageRepository.findArchivedImages();
    }


    // Simplified resource loading without database lookup
    public Resource loadImageAsResource(String filename) {
        if (filename == null || filename.trim().isEmpty()) {
            throw new IllegalArgumentException("Filename cannot be null or empty");
        }

        if (filename.contains("..") || filename.contains("/") || filename.contains("\\")) {
            throw new IllegalArgumentException("Invalid filename: path traversal detected");
        }

        try {
            Path filePath = this.storageLocation.resolve(filename).normalize();
            if (!filePath.startsWith(this.storageLocation)) {
                throw new IllegalArgumentException("Invalid filename: outside storage directory");
            }
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("Could not read the file: " + filename);
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("Error: " + e.getMessage());
        }
    }

    public Image toggleFavorite(Long id) {
        Image image = getImageById(id);
        image.setIsFavorite(!image.getIsFavorite());
        return imageRepository.save(image);
    }

    public Map<String, Object> getImageStats() {
        return Map.of(
                "totalImages", imageRepository.countActiveImages(),
                "favorites", imageRepository.countFavoriteImages(),
                "archived", imageRepository.countArchivedImages(),
                "trash", imageRepository.countTrashedImages()
        );
    }

    public Image toggleArchive(Long id) {
        Image image = getImageById(id);
        image.setIsArchived(!image.getIsArchived());
        return imageRepository.save(image);
    }

    public void moveToTrash(Long id) {
        Image image = getImageById(id);
        image.setIsDeleted(true);
        imageRepository.save(image);
    }

    // Fixed: Use internal method to bypass deletion check
    public Image restoreFromTrash(Long id) {
        Image image = getImageByIdInternal(id);
        if (!image.getIsDeleted()) {
            throw new IllegalStateException("Image is not in trash");
        }
        image.setIsDeleted(false);
        return imageRepository.save(image);
    }

    // Fixed: Use internal method and renamed for consistency
    public void deletePermanently(Long id) {
        Image image = getImageByIdInternal(id);

        // Delete the physical file
        try {
            Path filePath = this.storageLocation.resolve(image.getStoredFilename());
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // Log the error but don't fail the operation
            System.err.println("Failed to delete physical file: " + e.getMessage());
        }

        // Delete from database
        imageRepository.delete(image);
    }
}