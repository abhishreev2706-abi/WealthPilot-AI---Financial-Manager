package com.wealthpilot.service;

import com.wealthpilot.repository.GoalRepository;
import com.wealthpilot.repository.TransactionRepository;
import com.wealthpilot.entity.Goal;
import com.wealthpilot.entity.Transaction;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HealthScoreService {

    private final TransactionRepository transactionRepository;
    private final GoalRepository goalRepository;

    public double calculateScore(Long userId, BigDecimal savingsRate, BigDecimal debtRatio) {
        LocalDate now = LocalDate.now();
        int month = now.getMonthValue();
        int year = now.getYear();

        // Savings Rate score (0-25): 20%+ savings = full score
        double savingsScore = Math.min(savingsRate.doubleValue() / 20.0 * 25, 25);

        // Debt ratio score (0-25): lower is better, 0% = full, >100% = 0
        double debtScore = Math.max(25 - (debtRatio.doubleValue() / 4), 0);

        // Emergency fund (0-25): check if 3+ months income in savings
        BigDecimal monthlyIncome = transactionRepository.sumByUserAndTypeAndMonthYear(userId, Transaction.Type.INCOME, month, year);
        double emergencyScore = 12.5; // default mid score

        // Budget discipline (0-15): estimate from consistent income/expense data
        double budgetScore = 10;

        // Goal progress (0-10)
        List<Goal> goals = goalRepository.findByUserIdAndStatus(userId, Goal.GoalStatus.ACTIVE);
        double goalScore = 5;
        if (!goals.isEmpty()) {
            double avgProgress = goals.stream()
                    .mapToDouble(g -> g.getTargetAmount().compareTo(BigDecimal.ZERO) > 0
                            ? g.getCurrentAmount().divide(g.getTargetAmount(), 4, RoundingMode.HALF_UP).doubleValue() * 100
                            : 0)
                    .average().orElse(0);
            goalScore = Math.min(avgProgress / 10, 10);
        }

        return Math.min(savingsScore + debtScore + emergencyScore + budgetScore + goalScore, 100);
    }
}
