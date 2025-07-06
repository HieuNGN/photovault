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
                        FileValidationConfig fileValidationConfig, FileValidationConfig fileValidationConfig1) {
        this.storageLocation = Paths.get(storageLocationPath).toAbsolutePath().normalize();
        this.imageRepository = imageRepository;
        this.fileValidationConfig = fileValidationConfig;

        try {
            Files.createDirectories(this.storageLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not create the storage directory.", e);
        }
    }

//    private boolean isValidImageType(String contentType) {
//        return fileValidationConfig.isValidImageType(contentType);
//    }

    public Image saveImage(MultipartFile file) throws IOException {
        // Validate file type
        if (!isValidImageType(file.getContentType())) {
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

    public Page<Image> getAllImages(Pageable pageable) {
        return imageRepository.findAll(pageable);
    }

//    public List<Image> getAllImages() {
//        return imageRepository.findAll(Sort.by(Sort.Direction.DESC, "uploadDate"));
//    }

    public Image getImageById(Long id) {
        return imageRepository.findById(id)
                .orElseThrow(() -> new ImageNotFoundException("Image not found with id: " + id));
    }

    public Resource loadImageAsResource(String filename) {
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
                .toList();
    }

    public List<Image> searchImages(String query) {
        return imageRepository.findAll().stream()
                .filter(image -> !image.getIsDeleted() &&
                        image.getOriginalFilename().toLowerCase().contains(query.toLowerCase()))
                .toList();
    }

    public Map<String, Object> getImageStats() {
        long totalImages = imageRepository.count();
        long favoriteCount = getFavorites().size();
        long archivedCount = imageRepository.findAll().stream()
                .filter(image -> image.getIsArchived() && !image.getIsDeleted())
                .count();

        return Map.of(
                "totalImages", totalImages,
                "favorites", favoriteCount,
                "archived", archivedCount
        );
    }

    public void moveToTrash(Long id) {
        Image image = getImageById(id);
        image.setIsDeleted(true);
        imageRepository.save(image);
    }

    public Image toggleArchive(Long id) {
        Image image = getImageById(id);
        image.setIsArchived(!image.getIsArchived());
        return imageRepository.save(image);
    }

    private boolean isValidImageType(String contentType) {
        return contentType != null && (
                contentType.equals("image/jpeg") ||
                        contentType.equals("image/png") ||
                        contentType.equals("image/gif") ||
                        contentType.equals("image/webp")
        );
    }
}
