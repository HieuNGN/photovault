package com.internship.photovault.security;


import com.internship.photovault.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

@Service
@Transactional
public class SecurityContextService {
    private final DataSource dataSource;

    public SecurityContextService(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    public void setCurrentUserContext(  User user) {
        try (Connection connection = dataSource.getConnection()) {
            String sql = "SELECT set_current_user_context(?)";
            try (PreparedStatement statement = connection.prepareStatement(sql)) {
                statement.setLong(1, user.getId());
                statement.execute();
            }
        } catch (SQLException e) {
            throw new RuntimeException("Failed to set current user context", e);
        }
    }
    public void clearCurrentUserContext() {
        try (Connection connection = dataSource.getConnection()) {
            String sql = "SELECT set_config('app.current_user_id', '', false)";
            try (PreparedStatement statement = connection.prepareStatement(sql)) {
                statement.execute();
            }
        } catch (SQLException e) {
            throw new RuntimeException("Failed to clear current user context", e);
        }
    }
}
