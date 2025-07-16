package com.internship.photovault.service;

import com.internship.photovault.entity.Image;
import com.internship.photovault.entity.ImageStates;
import com.internship.photovault.entity.User;
import com.internship.photovault.repository.ImageStatesRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class ImageStatesService {

    private final ImageStatesRepository imageStatesRepository;

    public ImageStatesService(ImageStatesRepository imageStatesRepository) {
        this.imageStatesRepository = imageStatesRepository;
    }

    public ImageStates getOrCreateImageState(Image image, User user) {
        return imageStatesRepository.findByImageAndUser(image, user)
                .orElseGet(() -> {
                    ImageStates newState = new ImageStates();
                    newState.setImage(image);
                    newState.setUser(user);
                    newState.setIsFavorite(false);
                    newState.setIsArchived(false);
                    newState.setViewCount(0L);
                    return imageStatesRepository.save(newState);
                });
    }

    public ImageStates toggleFavorite(Image image, User user) {
        ImageStates state = getOrCreateImageState(image, user);
        state.setIsFavorite(!state.getIsFavorite());
        return imageStatesRepository.save(state);
    }

    public ImageStates toggleArchive(Image image, User user) {
        ImageStates state = getOrCreateImageState(image, user);
        state.setIsArchived(!state.getIsArchived());
        return imageStatesRepository.save(state);
    }

    public void incrementViewCount(Image image, User user) {
        ImageStates state = getOrCreateImageState(image, user);
        state.setViewCount(state.getViewCount() + 1);
        state.setLastViewed(LocalDateTime.now());
        imageStatesRepository.save(state);
    }

    public List<ImageStates> getFavoriteImages(User user) {
        return imageStatesRepository.findByUserAndIsFavoriteTrue(user);
    }

    public List<ImageStates> getArchivedImages(User user) {
        return imageStatesRepository.findByUserAndIsArchivedTrue(user);
    }

    public List<ImageStates> getRecentlyViewed(User user) {
        return imageStatesRepository.findRecentlyViewedByUser(user);
    }

    public long countFavorites(User user) {
        return imageStatesRepository.countFavoritesByUser(user);
    }

    public long countArchived(User user) {
        return imageStatesRepository.countArchivedByUser(user);
    }
}