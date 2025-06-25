package com.internship.photovault.repository;

import com.internship.photovault.entity.Image;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository // Marks this as a Spring repository bean
public interface ImageRepository extends JpaRepository<Image, Long> {
    // Spring Data JPA will automatically implement all basic CRUD methods.
    // We can add custom query methods here later if needed.
}