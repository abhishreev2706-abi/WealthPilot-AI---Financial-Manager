package com.wealthpilot.repository;

import com.wealthpilot.entity.Investment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;

public interface InvestmentRepository extends JpaRepository<Investment, Long> {
    List<Investment> findByUserId(Long userId);

    @Query("SELECT COALESCE(SUM(i.currentValue), 0) FROM Investment i WHERE i.user.id = :userId")
    BigDecimal totalCurrentValue(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(i.investedAmount), 0) FROM Investment i WHERE i.user.id = :userId")
    BigDecimal totalInvested(@Param("userId") Long userId);
}
