    package com.internship.photovault.service;

    import com.internship.photovault.config.FileValidationConfig;
    import com.internship.photovault.entity.Image;
    import com.internship.photovault.entity.User;
    import com.internship.photovault.exception.ImageNotFoundException;
    import com.internship.photovault.exception.InvalidFileTypeException;
    import com.internship.photovault.repository.ImageRepository;
    import com.internship.photovault.repository.UserRepository;
    import org.springframework.beans.factory.annotation.Value;
    import org.springframework.core.io.Resource;
    import org.springframework.core.io.UrlResource;
    import org.springframework.data.domain.Page;
    import org.springframework.data.domain.Pageable;
    import org.springframework.stereotype.Service;
    import org.springframework.web.multipart.MaxUploadSizeExceededException;
    import org.springframework.web.multipart.MultipartFile;

    import java.io.IOException;
    import java.io.InputStream;
    import java.net.MalformedURLException;
    import java.nio.file.Files;
    import java.nio.file.Path;
    import java.nio.file.Paths;
    import java.security.MessageDigest;
    import java.security.NoSuchAlgorithmException;
    import java.time.LocalDateTime;
    import java.util.List;
    import java.util.Map;
    import java.util.Optional;
    import java.util.UUID;

    @Service
    public class ImageService {

        private final Path storageLocation;
        private final ImageRepository imageRepository;
        private final FileValidationConfig fileValidationConfig;

        private final UserRepository userRepository;

        public ImageService(@Value("${DB_LOCATION}") String storageLocationPath,
                            ImageRepository imageRepository,
                            FileValidationConfig fileValidationConfig, UserRepository userRepository) {
            this.storageLocation = Paths.get(storageLocationPath).toAbsolutePath().normalize();
            this.imageRepository = imageRepository;
            this.fileValidationConfig = fileValidationConfig;
            this.userRepository = userRepository;

            try {
                Files.createDirectories(this.storageLocation);
            } catch (IOException e) {
                throw new RuntimeException("Could not create the storage directory.", e);
            }
        }

        public Image saveImage(MultipartFile file, User user) throws IOException {
            // File size validation
            long maxFileSize = 30 * 3840 * 2160; // 30MB max size allowed
            if (file.getSize() > maxFileSize) {
                throw new MaxUploadSizeExceededException(maxFileSize);
            }

            String checksum = calculateSHA256(file.getInputStream());

            // Check if the file already exists in the database
            Optional<Image> existingImage = imageRepository.findByChecksumSha256AndUser(checksum, user);
            if (existingImage.isPresent()) {
                // If the file already exists, return the existing image
                throw new IllegalStateException("File already exists! Duplicate upload is not allowed.");
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
            image.setUser(user);
            image.setOriginalFilename(originalFileName);
            image.setFilename(originalFileName);
            image.setStoredFilename(storedFilename);
            image.setFilePath(targetLocation.toString());
            image.setFileSize(file.getSize());
            image.setContentType(file.getContentType());
            image.setUploadDate(LocalDateTime.now());

            image.setChecksumSha256(checksum);
            return imageRepository.save(image);
        }

        // Calculate SHA-256 checksum for the file
        private String calculateSHA256(InputStream inputStream) throws IOException {
            try {
                MessageDigest digest = MessageDigest.getInstance("SHA-256");
                byte[] buffer = new byte[8192];
                int bytesRead;

                while ((bytesRead = inputStream.read(buffer)) != -1) {
                    digest.update(buffer, 0, bytesRead);
                }

                byte[] digestBytes = digest.digest();
                StringBuilder hexString = new StringBuilder();

                for (byte b : digestBytes) {
                    String hex = Integer.toHexString(0xff & b);
                    if (hex.length() == 1) {
                        hexString.append('0');
                    }
                    hexString.append(hex);
                }

                return hexString.toString();
            }
            catch (NoSuchAlgorithmException e) {
                throw new IOException("Could not calculate SHA-256 checksum", e);
            }
        }
/*         Proper Page filtering for active images only, deprecated method, manual and slow
        public Page<Image> getAllImages(Pageable pageable) {
            Page<Image> allImages = imageRepository.findAll(pageable);
            List<Image> activeImages = allImages.getContent().stream()
                    .filter(image -> !image.getIsDeleted() && !image.getIsArchived())
                    .toList();

            return new PageImpl<>(activeImages, pageable, getTotalActiveImageCount());
        }*/

        public Page<Image> getAllImages(User user, Pageable pageable) {
            return imageRepository.findAllActiveImages(user, false, pageable);
        }

        // return active (non-deleted, non-archived) images
        public List<Image> getAllImages() {
            return imageRepository.findAllActiveImages();
        }

        public List<Image> getFavorites(User user) {
            return imageRepository.findFavoriteImages(user);
        }

        public List<Image> getTrashedImages(User user) {
            return imageRepository.findTrashImages(user);
        }

        // Use search in repo instead of non-optimized manual search
        public List<Image> searchImages(String query, User user) {
            return imageRepository.searchByOriginalFilename(query, user);
        }

/*        safe to remove, not used
        private long getTotalActiveImageCount() {
            return imageRepository.findAll().stream()
                    .filter(image -> !image.getIsDeleted() && !image.getIsArchived())
                    .count();
}*/

        // Separate method for getting image by ID without deletion check (for internal use)
        // Make the internal method public for thumbnail access
        public Image getImageByIdInternal(Long id) {
            return imageRepository.findById(id)
                    .orElseThrow(() -> new ImageNotFoundException("Image not found with id: " + id));
        }

        // Public method that checks for deletion
        public Image getImageById(Long id, User user) {
            Image image = getImageByIdInternal(id);
            //verify that the image belongs to the user
            if (!image.getUser().getId().equals(user.getId())) {
                throw new ImageNotFoundException("Image not found for user with id: " + id);
            }
            // Check if the image is deleted
            if (image.getIsDeleted()) {
                throw new ImageNotFoundException("Image has been deleted with id: " + id);
            }
            return image;
        }

        public List<Image> getArchivedImages(User user) {
            return imageRepository.findArchivedImages(user);
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

        public Image toggleFavorite(Long id, User user) {
            Image image = getImageById(id, user);
            image.setIsFavorite(!image.getIsFavorite());
            return imageRepository.save(image);
        }

        public Map<String, Object> getImageStats(User user) {
            return Map.of(
                    "totalImages", imageRepository.countActiveImages(user),
                    "favorites", imageRepository.countFavoriteImages(user),
                    "archived", imageRepository.countArchivedImages(user),
                    "trash", imageRepository.countTrashedImages(user)
            );
        }

        public Image toggleArchive(Long id, User user) {
            Image image = getImageById(id, user);
            image.setIsArchived(!image.getIsArchived());
            return imageRepository.save(image);
        }

        public void moveToTrash(Long id, User user) {
            Image image = getImageById(id, user);
            image.setIsDeleted(true);
            imageRepository.save(image);
        }

        // Fixed: Use internal method to bypass deletion check
        public Image restoreFromTrash(Long id, User user) {
            Image image = getImageByIdInternal(id);

            if (!image.getUser().getId().equals(user.getId())) {
                throw new IllegalStateException("Image does not belong to the user");
            }

            if (!image.getIsDeleted()) {
                throw new IllegalStateException("Image is not in trash");
            }
            image.setIsDeleted(false);
            return imageRepository.save(image);
        }

        // Fixed: Use internal method and renamed for consistency
        public void deletePermanently(Long id, User user) {
            Image image = getImageByIdInternal(id);

//            verify ownership
            if (!image.getUser().getId().equals(user.getId())) {
                throw new IllegalStateException("Image does not belong to the user");
            }
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