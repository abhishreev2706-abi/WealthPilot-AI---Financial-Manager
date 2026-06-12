package com.wealthpilot.service;

import com.wealthpilot.entity.Goal;
import com.wealthpilot.repository.GoalRepository;
import com.wealthpilot.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GoalService {

    private final GoalRepository goalRepository;
    private final UserRepository userRepository;

    public Goal create(Long userId, Goal goal) {
        goal.setUser(userRepository.findById(userId).orElseThrow());
        BigDecimal remaining = goal.getTargetAmount().subtract(goal.getCurrentAmount());
        long months = ChronoUnit.MONTHS.between(LocalDate.now(), goal.getTargetDate());
        if (months > 0) {
            goal.setMonthlyTarget(remaining.divide(BigDecimal.valueOf(months), 2, RoundingMode.CEILING));
        }
        return goalRepository.save(goal);
    }

    public List<Goal> getAll(Long userId) {
        return goalRepository.findByUserId(userId);
    }

    public Goal update(Long userId, Long id, Goal updated) {
        Goal goal = goalRepository.findById(id).orElseThrow();
        goal.setCurrentAmount(updated.getCurrentAmount());
        goal.setStatus(updated.getStatus());
        return goalRepository.save(goal);
    }

    public void delete(Long id) {
        goalRepository.deleteById(id);
    }
}
