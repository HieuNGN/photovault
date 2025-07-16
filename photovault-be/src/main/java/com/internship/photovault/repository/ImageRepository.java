package com.internship.photovault.repository;

import com.internship.photovault.entity.Image;
import com.internship.photovault.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

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

    Page<Image> findByUserAndIsArchivedTrueAndIsDeletedFalse(User user, Pageable pageable);
    Page<Image> findByUserAndIsDeletedFalse(User user, Boolean isDeleted, Pageable pageable);
    Page<Image> findByUserAndIsFavoriteTrueAndIsDeletedFalse(User user, Pageable pageable);

    //  optional lookup methods
    Optional<Image> findByFilenameAndIsDeletedFalse(String filename);
    Optional<Image> findByStoredFilename(String filename);
    Optional<Image> findByChecksumSha256AndUser(String checksumSha256, User user);

    @Query("SELECT i FROM Image i WHERE i.user = :user AND i.isDeleted = false AND i.isArchived = false ORDER BY i.uploadDate DESC")
    Page<Image> findAllActiveImages(@Param("user") User user, @Param("isDeleted") Boolean isDeleted, Pageable pageable);

    @Query("SELECT i FROM Image i WHERE i.isDeleted = false AND i.isArchived = false ORDER BY i.uploadDate DESC")
    List<Image> findAllActiveImages();

/* Add proper generics to all methods, update the find all to exclude deleted
    @Query("SELECT i FROM Image i WHERE i.isDeleted = false")
    Page<Image> findAllActive(Pageable pageable);
  not deleted images, including archived and favorites*/

    @Query("SELECT i FROM Image i WHERE i.isDeleted = false ORDER BY i.uploadDate DESC")
    Page<Image> findAllDeleted(Pageable pageable);

    @Query("SELECT i FROM Image i WHERE i.isDeleted = true ORDER BY i.uploadDate DESC")
    List<Image> findAllDeleted();

//  other categories
    @Query("SELECT i FROM Image i WHERE i.user = :user AND i.isFavorite = true AND i.isDeleted = false ORDER BY i.uploadDate DESC")
    List<Image> findFavoriteImages(@Param("user") User user);

    @Query("SELECT i FROM Image i WHERE i.user = :user AND i.isArchived = true AND i.isDeleted = false ORDER BY i.uploadDate DESC")
    List<Image> findArchivedImages(@Param("user") User user);

    @Query("SELECT i FROM Image i WHERE i.user = :user AND i.isDeleted = true ORDER BY i.uploadDate DESC")
    List<Image> findTrashImages(@Param("user") User user);

//  search methods
    @Query("SELECT i FROM Image i WHERE i.user = :user AND i.originalFilename ILIKE %:searchTerm% AND i.isDeleted = false AND i.isArchived = false ORDER BY i.uploadDate DESC")
    List<Image> searchByOriginalFilename(@Param("searchTerm") String searchTerm, @Param("user") User user);

//  count methods
    @Query("SELECT COUNT(i) FROM Image i WHERE i.user = :user AND i.isDeleted = false AND i.isArchived = false")
    long countActiveImages(@Param("user") User user);

    @Query("SELECT COUNT(i) FROM Image i WHERE i.user = :user AND i.isFavorite = true AND i.isDeleted = false")
    long countFavoriteImages(@Param("user") User user);

    @Query("SELECT COUNT(i) FROM Image i WHERE i.user = :user AND i.isArchived = true AND i.isDeleted = false")
    long countArchivedImages(@Param("user") User user);

    @Query("SELECT COUNT(i) FROM Image i WHERE i.user = :user AND i.isDeleted = true")
    long countTrashedImages(@Param("user") User user);


//    User user(User user);
}

