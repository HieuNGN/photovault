package com.internship.photovault.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data // Lombok annotation to generate getters, setters, toString, etc.
@Entity // JPA annotation to mark this class as a database entity
@Table(name = "images") // Specifies the table name in the database
public class Image {

    @Id // Marks this field as the primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increments the ID
    private Long id;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String storedFileName; // The unique name on the disk

    @Column(nullable = false)
    private String contentType;

    @Column(nullable = false)
    private Long size;

    @Column(nullable = false)
    private LocalDateTime uploadedAt;
    private LocalDateTime deletedAt;

    private boolean isFavorite = false;

    private boolean isArchived = false;

//    private boolean isDeleted = false;

    private boolean isInTrash = false;
}