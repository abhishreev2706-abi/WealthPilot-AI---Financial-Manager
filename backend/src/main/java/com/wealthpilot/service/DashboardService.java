package com.wealthpilot.service;

import com.wealthpilot.dto.DashboardDTO;
import com.wealthpilot.entity.Transaction;
import com.wealthpilot.repository.DebtRepository;
import com.wealthpilot.repository.InvestmentRepository;
import com.wealthpilot.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TransactionRepository transactionRepository;
    private final DebtRepository debtRepository;
    private final InvestmentRepository investmentRepository;
    private final HealthScoreService healthScoreService;

    public DashboardDTO getDashboard(Long userId) {
        LocalDate now = LocalDate.now();
        int month = now.getMonthValue();
        int year = now.getYear();

        BigDecimal income = transactionRepository.sumByUserAndTypeAndMonthYear(userId, Transaction.Type.INCOME, month, year);
        BigDecimal expenses = transactionRepository.sumByUserAndTypeAndMonthYear(userId, Transaction.Type.EXPENSE, month, year);
        BigDecimal totalDebt = debtRepository.totalOutstanding(userId);
        BigDecimal totalInvestments = investmentRepository.totalCurrentValue(userId);

        BigDecimal netWorth = totalInvestments.subtract(totalDebt);
        BigDecimal cashFlow = income.subtract(expenses);
        BigDecimal savingsRate = income.compareTo(BigDecimal.ZERO) > 0
                ? cashFlow.divide(income, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO;
        BigDecimal debtRatio = income.compareTo(BigDecimal.ZERO) > 0
                ? totalDebt.divide(income.multiply(BigDecimal.valueOf(12)), 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100))
                : BigDecimal.ZERO;

        // Monthly trend (last 6 months)
        List<Map<String, Object>> trend = buildMonthlyTrend(userId, year);

        // Category breakdown
        Map<String, BigDecimal> byCategory = new LinkedHashMap<>();
        transactionRepository.sumExpensesByCategoryAndMonthYear(userId, month, year)
                .forEach(row -> byCategory.put((String) row[0], (BigDecimal) row[1]));

        double score = healthScoreService.calculateScore(userId, savingsRate, debtRatio);

        DashboardDTO dto = new DashboardDTO();
        dto.setNetWorth(netWorth);
        dto.setMonthlyIncome(income);
        dto.setMonthlyExpenses(expenses);
        dto.setSavingsRate(savingsRate);
        dto.setDebtRatio(debtRatio);
        dto.setCashFlow(cashFlow);
        dto.setHealthScore(score);
        dto.setMonthlyTrend(trend);
        dto.setExpensesByCategory(byCategory);
        return dto;
    }

    private List<Map<String, Object>> buildMonthlyTrend(Long userId, int year) {
        Map<Integer, BigDecimal> incomeMap = new HashMap<>();
        Map<Integer, BigDecimal> expenseMap = new HashMap<>();

        transactionRepository.monthlyTotals(userId, Transaction.Type.INCOME, year)
                .forEach(row -> incomeMap.put(((Number) row[0]).intValue(), (BigDecimal) row[1]));
        transactionRepository.monthlyTotals(userId, Transaction.Type.EXPENSE, year)
                .forEach(row -> expenseMap.put(((Number) row[0]).intValue(), (BigDecimal) row[1]));

        List<Map<String, Object>> trend = new ArrayList<>();
        for (int m = 1; m <= 12; m++) {
            Map<String, Object> point = new HashMap<>();
            point.put("month", m);
            point.put("income", incomeMap.getOrDefault(m, BigDecimal.ZERO));
            point.put("expenses", expenseMap.getOrDefault(m, BigDecimal.ZERO));
            trend.add(point);
        }
        return trend;
    }
}
