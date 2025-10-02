package com.osu.HealthApp.repo;

import com.osu.HealthApp.models.Role;
import com.osu.HealthApp.models.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    List<User> findByRolesContaining(Role role);
}