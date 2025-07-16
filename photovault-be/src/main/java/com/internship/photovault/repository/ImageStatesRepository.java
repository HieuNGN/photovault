package com.internship.photovault.repository;

import com.internship.photovault.entity.Image;
import com.internship.photovault.entity.ImageStates;
import com.internship.photovault.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ImageStatesRepository extends JpaRepository<ImageStates, Long> {
    Optional<ImageStates> findByImageAndUser(Image image, User user);
    List<ImageStates> findByUserAndIsFavoriteTrue(User user);
    List<ImageStates> findByUserAndIsArchivedTrue(User user);

    @Query("SELECT COUNT(is) FROM ImageStates is WHERE is.user = :user AND is.isFavorite = true")
    long countFavoritesByUser(@Param("user") User user);

    @Query("SELECT COUNT(is) FROM ImageStates is WHERE is.user = :user AND is.isArchived = true")
    long countArchivedByUser(@Param("user") User user);

    @Modifying
    @Query("UPDATE ImageStates ist SET ist.viewCount = ist.viewCount + 1, ist.lastViewed = CURRENT_TIMESTAMP WHERE ist.image = :image AND ist.user = :user")
    void incrementViewCount(@Param("image") Image image, @Param("user") User user);

    @Query("SELECT ist FROM ImageStates ist WHERE ist.user = :user ORDER BY ist.lastViewed DESC")
    List<ImageStates> findRecentlyViewedByUser(@Param("user") User user);
}
