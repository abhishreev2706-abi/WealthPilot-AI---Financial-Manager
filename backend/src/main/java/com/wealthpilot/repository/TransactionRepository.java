package com.wealthpilot.repository;

import com.wealthpilot.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByUserIdOrderByTransactionDateDesc(Long userId);

    List<Transaction> findByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(
            Long userId, LocalDate start, LocalDate end);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE t.user.id = :userId AND t.type = :type AND MONTH(t.transactionDate) = :month AND YEAR(t.transactionDate) = :year")
    BigDecimal sumByUserAndTypeAndMonthYear(@Param("userId") Long userId,
                                            @Param("type") Transaction.Type type,
                                            @Param("month") int month,
                                            @Param("year") int year);

    @Query("SELECT t.category, SUM(t.amount) FROM Transaction t WHERE t.user.id = :userId AND t.type = 'EXPENSE' AND MONTH(t.transactionDate) = :month AND YEAR(t.transactionDate) = :year GROUP BY t.category")
    List<Object[]> sumExpensesByCategoryAndMonthYear(@Param("userId") Long userId,
                                                      @Param("month") int month,
                                                      @Param("year") int year);

    @Query("SELECT MONTH(t.transactionDate) as month, SUM(t.amount) FROM Transaction t WHERE t.user.id = :userId AND t.type = :type AND YEAR(t.transactionDate) = :year GROUP BY MONTH(t.transactionDate) ORDER BY MONTH(t.transactionDate)")
    List<Object[]> monthlyTotals(@Param("userId") Long userId,
                                  @Param("type") Transaction.Type type,
                                  @Param("year") int year);
}
