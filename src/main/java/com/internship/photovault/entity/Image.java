package com.internship.photovault.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;

@Getter
@Entity
@Table(name = "images")
public class Image {

    // Getters and Setters
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "filename", nullable = false)
    @NotBlank(message = "Filename cannot be blank")
    private String filename;

    @Column(name = "stored_filename", nullable = false)
    @NotBlank(message = "Stored filename cannot be blank")
    private String storedFilename;

    @Column(name = "original_filename", nullable = false)
    @NotBlank(message = "Original filename cannot be blank")
    private String originalFilename;

    @Column(name = "file_path", nullable = false, length = 500)
    @NotBlank(message = "File path cannot be blank")
    private String filePath;

    @Column(name = "file_size", nullable = false)
    @Min(value = 1, message = "File size must be greater than 0")
    private Long fileSize;

    @Column(name = "content_type", nullable = false)
    @NotBlank(message = "Content type cannot be blank")
    private String contentType;

    @Column(name = "upload_date")
    private LocalDateTime uploadDate;

    @Column(name = "is_favorite")
    private Boolean isFavorite = false;

    @Column(name = "is_archived")
    private Boolean isArchived = false;

    @Column(name = "is_deleted")
    private Boolean isDeleted = false;

    @CreationTimestamp
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Constructors
    public Image() {
        this.uploadDate = LocalDateTime.now();
    }

    public void setId(Long id) { this.id = id; }

    public void setFilename(String filename) { this.filename = filename; }

    public void setStoredFilename(String storedFilename) { this.storedFilename = storedFilename; }

    public void setOriginalFilename(String originalFilename) { this.originalFilename = originalFilename; }

    public void setFilePath(String filePath) { this.filePath = filePath; }

    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public void setContentType(String contentType) { this.contentType = contentType; }

    public void setUploadDate(LocalDateTime uploadDate) { this.uploadDate = uploadDate; }

    public void setIsFavorite(Boolean isFavorite) { this.isFavorite = isFavorite; }

    public void setIsArchived(Boolean isArchived) { this.isArchived = isArchived; }

    public void setIsDeleted(Boolean isDeleted) { this.isDeleted = isDeleted; }

    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
