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
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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

    public ImageService(@Value("${photovault.storage.location:./uploads}") String storageLocationPath,
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

    // Proper Page filtering for active images only
    public Page<Image> getAllImages(Pageable pageable) {
        Page<Image> allImages = imageRepository.findAll(pageable);
        List<Image> activeImages = allImages.getContent().stream()
                .filter(image -> !image.getIsDeleted() && !image.getIsArchived())
                .toList();

        return new PageImpl<>(activeImages, pageable, getTotalActiveImageCount());
    }

    private long getTotalActiveImageCount() {
        return imageRepository.findAll().stream()
                .filter(image -> !image.getIsDeleted() && !image.getIsArchived())
                .count();
    }

    // return active (non-deleted, non-archived) images
    public List<Image> getAllImages() {
        return imageRepository.findAll(Sort.by(Sort.Direction.DESC, "uploadDate")).stream()
                .filter(image -> !image.getIsDeleted() && !image.getIsArchived())
                .toList();
    }

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

    // Simplified resource loading without database lookup
    public Resource loadImageAsResource(String filename) {
        if (filename == null || filename.trim().isEmpty()) {
            throw new IllegalArgumentException("Filename cannot be null or empty");
        }

        try {
            Path filePath = this.storageLocation.resolve(filename).normalize();
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

    public List<Image> getFavorites() {
        return imageRepository.findAll().stream()
                .filter(image -> image.getIsFavorite() && !image.getIsDeleted())
                .sorted((a, b) -> b.getUploadDate().compareTo(a.getUploadDate()))
                .toList();
    }

    // Use getAllImages() method instead of non-existent findAllActive()
    public List<Image> searchImages(String query) {
        return getAllImages().stream()
                .filter(image -> image.getOriginalFilename().toLowerCase().contains(query.toLowerCase()))
                .toList();
    }

    public Map<String, Object> getImageStats() {
        List<Image> allImages = imageRepository.findAll();

        long totalImages = allImages.stream()
                .filter(image -> !image.getIsDeleted())
                .count();

        long favoriteCount = allImages.stream()
                .filter(image -> image.getIsFavorite() && !image.getIsDeleted())
                .count();

        long archivedCount = allImages.stream()
                .filter(image -> image.getIsArchived() && !image.getIsDeleted())
                .count();

        return Map.of(
                "totalImages", totalImages,
                "favorites", favoriteCount,
                "archived", archivedCount
        );
    }

    public Image toggleArchive(Long id) {
        Image image = getImageById(id);
        image.setIsArchived(!image.getIsArchived());
        return imageRepository.save(image);
    }

    public List<Image> getArchivedImages() {
        return imageRepository.findAll().stream()
                .filter(image -> image.getIsArchived() && !image.getIsDeleted())
                .sorted((a, b) -> b.getUpdatedAt().compareTo(a.getUpdatedAt()))
                .toList();
    }

    public List<Image> getTrashedImages() {
        return imageRepository.findAll().stream()
                .filter(Image::getIsDeleted)
                .sorted((a, b) -> b.getUpdatedAt().compareTo(a.getUpdatedAt()))
                .toList();
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