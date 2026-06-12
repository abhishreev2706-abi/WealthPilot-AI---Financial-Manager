package com.wealthpilot.service;

import com.wealthpilot.entity.Transaction;
import com.wealthpilot.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AIService {

    private final TransactionRepository transactionRepository;
    private final RestTemplate restTemplate;

    @Value("${ai.service.url}")
    private String aiServiceUrl;

    public Map<String, Object> chat(Long userId, String question) {
        LocalDate now = LocalDate.now();
        List<Transaction> recent = transactionRepository.findByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(
                userId, now.minusMonths(3), now);

        BigDecimal totalIncome = recent.stream().filter(t -> t.getType() == Transaction.Type.INCOME)
                .map(Transaction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalExpense = recent.stream().filter(t -> t.getType() == Transaction.Type.EXPENSE)
                .map(Transaction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> payload = new HashMap<>();
        payload.put("question", question);
        payload.put("total_income_3m", totalIncome);
        payload.put("total_expense_3m", totalExpense);
        payload.put("transaction_count", recent.size());

        try {
            return restTemplate.postForObject(aiServiceUrl + "/api/chat", payload, Map.class);
        } catch (Exception e) {
            return Map.of("answer", "AI service is currently unavailable. Please try again later.");
        }
    }

    public Map<String, Object> getForecast(Long userId) {
        List<Object[]> monthlyExpenses = transactionRepository.monthlyTotals(userId, Transaction.Type.EXPENSE, LocalDate.now().getYear());
        List<Double> expenseData = monthlyExpenses.stream()
                .map(row -> ((BigDecimal) row[1]).doubleValue())
                .collect(Collectors.toList());

        Map<String, Object> payload = new HashMap<>();
        payload.put("monthly_expenses", expenseData);
        payload.put("months_to_forecast", 3);

        try {
            return restTemplate.postForObject(aiServiceUrl + "/api/forecast", payload, Map.class);
        } catch (Exception e) {
            return Map.of("forecast", List.of(), "message", "AI service unavailable");
        }
    }

    public Map<String, Object> analyzeSpending(Long userId) {
        LocalDate now = LocalDate.now();
        List<Transaction> transactions = transactionRepository.findByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(
                userId, now.minusMonths(3), now);

        List<Map<String, Object>> txData = transactions.stream().map(t -> {
            Map<String, Object> m = new HashMap<>();
            m.put("amount", t.getAmount());
            m.put("category", t.getCategory());
            m.put("type", t.getType().name());
            m.put("date", t.getTransactionDate().toString());
            return m;
        }).collect(Collectors.toList());

        Map<String, Object> payload = Map.of("transactions", txData);
        try {
            return restTemplate.postForObject(aiServiceUrl + "/api/analyze", payload, Map.class);
        } catch (Exception e) {
            return Map.of("insights", List.of(), "message", "AI service unavailable");
        }
    }
}
