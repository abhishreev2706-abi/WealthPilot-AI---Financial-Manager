package com.wealthpilot.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
public class DashboardDTO {
    private BigDecimal netWorth;
    private BigDecimal monthlyIncome;
    private BigDecimal monthlyExpenses;
    private BigDecimal savingsRate;
    private BigDecimal debtRatio;
    private BigDecimal cashFlow;
    private Double healthScore;
    private List<Map<String, Object>> monthlyTrend;
    private Map<String, BigDecimal> expensesByCategory;
}
