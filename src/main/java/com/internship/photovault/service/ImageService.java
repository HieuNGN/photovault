package com.internship.photovault.service;

import com.internship.photovault.entity.Image;
import com.internship.photovault.repository.ImageRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import com.internship.photovault.exception.ImageNotFoundException;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import java.net.MalformedURLException;
import org.springframework.data.domain.Sort;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;
import java.util.List;



@Service // Marks this as a Spring service bean
public class ImageService {

    private final Path storageLocation;
    private final ImageRepository imageRepository;

    // Constructor Injection: Spring automatically provides the dependencies
    public ImageService(@Value("${file.storage.location}") String storageLocationPath, ImageRepository imageRepository) {
        this.storageLocation = Paths.get(storageLocationPath).toAbsolutePath().normalize();
        this.imageRepository = imageRepository;

        // Create the storage directory if it does not exist
        try {
            Files.createDirectories(this.storageLocation);
        } catch (IOException e) {
            throw new RuntimeException("Could not create the storage directory.", e);
        }
    }

    public ImageResource loadImageAsResource(Long id) {
        try {
            Image image = imageRepository.findById(id)
                    .orElseThrow(() -> new ImageNotFoundException("Image not found with ID: " + id));

            Path filePath = this.storageLocation.resolve(image.getStoredFileName()).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                return new ImageResource(resource, image); // Return both the resource and the metadata
            } else {
                throw new RuntimeException("Could not read the file for image ID: " + id);
            }
        } catch (MalformedURLException e) {
            throw new RuntimeException("Error: " + e.getMessage());
        }
    }

    public Image storeImage(MultipartFile file) {
        // 1. Generate a unique filename to prevent collisions and enhance security
        String originalFileName = file.getOriginalFilename();
        String fileExtension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        String storedFileName = UUID.randomUUID().toString() + fileExtension;
        Path targetLocation = this.storageLocation.resolve(storedFileName);

        try {
            // 2. Save the file to the filesystem
            Files.copy(file.getInputStream(), targetLocation);

            // 3. Create the Image entity object with the file's metadata
            Image image = new Image();
            image.setFileName(originalFileName);
            image.setStoredFileName(storedFileName);
            image.setContentType(file.getContentType());
            image.setSize(file.getSize());
            image.setUploadedAt(LocalDateTime.now());

            // 4. Save the metadata to the database and return the saved entity
            return imageRepository.save(image);

        } catch (IOException e) {
            // In a real application, you'd want more specific exception handling
            throw new RuntimeException("Failed to store file " + originalFileName, e);
        }
    }
    public List<Image> listAllImages() {
        // Return all images, sorted by upload date in descending order (newest first)
        return imageRepository.findAll(Sort.by(Sort.Direction.DESC, "uploadedAt"));
    }
    public record ImageResource(Resource resource, Image metadata) {}

    public Image toggleFavoriteStatus(Long id) {
        // 1. Find the existing image record
        Image image = imageRepository.findById(id)
                .orElseThrow(() -> new ImageNotFoundException("Image not found with ID: " + id));

        // 2. Toggle the boolean status
        image.setFavorite(!image.isFavorite());

        // 3. Save the updated record back to the database
        return imageRepository.save(image);
    }

    public Image toggleArchiveStatus(Long id) {
        Image image = imageRepository.findById(id)
                .orElseThrow(() -> new ImageNotFoundException("Image not found with ID: " + id));

        image.setArchived(!image.isArchived());
        return imageRepository.save(image);
    }

    public List<Image> listAllImages(Boolean isArchived) {
        Sort sort = Sort.by(Sort.Direction.DESC, "uploadedAt");
        boolean inTrash = false; // Default to not showing trashed items

        // This case now needs to be smarter
        // For now, let's assume if archived is null, we show non-archived, non-trashed
        // A more advanced implementation could handle more states
        return imageRepository.findByIsArchivedAndIsInTrash(Objects.requireNonNullElse(isArchived, false), inTrash, sort);
    }

    public void moveToTrash(Long id) {
        Image image = imageRepository.findById(id)
                .orElseThrow(() -> new ImageNotFoundException("Image not found with ID: " + id));
        image.setInTrash(true);
        image.setDeletedAt(LocalDateTime.now());
        imageRepository.save(image);
    }

    public void restoreFromTrash(Long id) {
        Image image = imageRepository.findById(id)
                .orElseThrow(() -> new ImageNotFoundException("No Image found with ID: " + id + " in Trash"));

        if (!image.isInTrash()) {
            throw new IllegalStateException("Image is not in Trash");
        }

        image.setInTrash(false);
        image.setDeletedAt(null);
        imageRepository.save(image);
    }

    public List<Image> ListAllImagesInTrash() {
        return imageRepository.findAll(Sort.by(Sort.Direction.DESC, "deletedAt"))
                .stream()
                .filter(Image::isInTrash)
                .toList();
    }

}