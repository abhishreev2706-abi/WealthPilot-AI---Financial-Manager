package com.wealthpilot.repository;

import com.wealthpilot.entity.Goal;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface GoalRepository extends JpaRepository<Goal, Long> {
    List<Goal> findByUserIdAndStatus(Long userId, Goal.GoalStatus status);
    List<Goal> findByUserId(Long userId);
}
