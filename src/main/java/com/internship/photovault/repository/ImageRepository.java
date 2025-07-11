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

// Early creation blank test
//@Repository
//public interface ImageRepository extends JpaRepository<Image, Long> {
//    // Spring Data JPA will automatically implement all basic CRUD methods.
//    // We can add custom query methods here later if needed.
//    List<Image> findByIsArchivedAndIsInTrash(boolean isArchived, boolean isInTrash, Sort sort);
//
//}

@Repository
public interface ImageRepository extends JpaRepository<Image, Long> {

    @Query("SELECT i FROM Image i WHERE i.isDeleted = false ORDER BY i.uploadDate DESC")
    Page<Image> findAllActive(Pageable pageable);

    @Query("SELECT i FROM Image i WHERE i.isDeleted = false ORDER BY i.uploadDate DESC")
    List<Image> findAllActive();

// Add proper generics to all methods, update the find all to exclude deleted
//    @Query("SELECT i FROM Image i WHERE i.isDeleted = false")
//    Page<Image> findAllActive(Pageable pageable);

    @Query("SELECT i FROM Image i WHERE i.isFavorite = true AND i.isDeleted = false")
    List<Image> findFavorites();

    @Query("SELECT i FROM Image i WHERE i.isArchived = true AND i.isDeleted = false")
    List<Image> findArchived();

    @Query("SELECT i FROM Image i WHERE i.isDeleted = true")
    List<Image> findTrash();

    Optional<Image> findByFilenameAndIsDeletedFalse(String filename);

    @Query("SELECT i FROM Image i WHERE i.originalFilename ILIKE %:searchTerm% AND i.isDeleted = false")
    List<Image> searchByOriginalFilename(@Param("searchTerm") String searchTerm);

    @Query("SELECT COUNT(i) FROM Image i WHERE i.isDeleted = false")
    long countActiveImages();

    @Query("SELECT COUNT(i) FROM Image i WHERE i.isFavorite = true AND i.isDeleted = false")
    long countFavorites();

    Optional<Object> findByStoredFilename(String filename);
}

