package com.internship.photovault.repository;

import com.internship.photovault.entity.Image;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.data.domain.Sort;
import java.util.List;
import java.util.Optional;

//@Repository // Marks this as a Spring repository bean
//public interface ImageRepository extends JpaRepository<Image, Long> {
//    // Spring Data JPA will automatically implement all basic CRUD methods.
//    // We can add custom query methods here later if needed.
//    List<Image> findByIsArchivedAndIsInTrash(boolean isArchived, boolean isInTrash, Sort sort);
//
//}

@Repository
public interface ImageRepository extends JpaRepository<Image, Long> {

    // Find non-deleted images
    @Query("SELECT i FROM Image i WHERE i.isDeleted = false")
    Page<Image> findAllActive(Pageable pageable);

    // Find favorites
    @Query("SELECT i FROM Image i WHERE i.isFavorite = true AND i.isDeleted = false")
    List<Image> findFavorites();

    // Find archived images
    @Query("SELECT i FROM Image i WHERE i.isArchived = true AND i.isDeleted = false")
    List<Image> findArchived();

    // Find trash (soft deleted)
    @Query("SELECT i FROM Image i WHERE i.isDeleted = true")
    List<Image> findTrash();

    // Find by filename
    Optional<Image> findByFilenameAndIsDeletedFalse(String filename);

    // Search by original filename
    @Query("SELECT i FROM Image i WHERE i.originalFilename ILIKE %:searchTerm% AND i.isDeleted = false")
    List<Image> searchByOriginalFilename(@Param("searchTerm") String searchTerm);

    // Count statistics
    @Query("SELECT COUNT(i) FROM Image i WHERE i.isDeleted = false")
    long countActiveImages();

    @Query("SELECT COUNT(i) FROM Image i WHERE i.isFavorite = true AND i.isDeleted = false")
    long countFavorites();
}
