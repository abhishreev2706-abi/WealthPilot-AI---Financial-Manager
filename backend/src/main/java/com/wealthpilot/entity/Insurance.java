package com.wealthpilot.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "insurance")
@Data
@NoArgsConstructor
public class Insurance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "policy_name", nullable = false, length = 100)
    private String policyName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InsuranceType type;

    @Column(length = 100)
    private String provider;

    @Column(precision = 15, scale = 2)
    private BigDecimal premium;

    @Column(name = "coverage_amount", precision = 15, scale = 2)
    private BigDecimal coverageAmount;

    @Column(name = "renewal_date")
    private LocalDate renewalDate;

    @Enumerated(EnumType.STRING)
    private InsuranceStatus status = InsuranceStatus.ACTIVE;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum InsuranceType { HEALTH, LIFE, VEHICLE, HOME, OTHER }
    public enum InsuranceStatus { ACTIVE, EXPIRED, LAPSED }
}
