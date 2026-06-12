package com.wealthpilot.controller;

import com.wealthpilot.dto.ApiResponse;
import com.wealthpilot.entity.Investment;
import com.wealthpilot.repository.InvestmentRepository;
import com.wealthpilot.repository.UserRepository;
import com.wealthpilot.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/investments")
@RequiredArgsConstructor
public class InvestmentController {

    private final InvestmentRepository investmentRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Investment>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(investmentRepository.findByUserId(userService.getCurrentUserId())));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Investment>> create(@RequestBody Investment investment) {
        investment.setUser(userRepository.findById(userService.getCurrentUserId()).orElseThrow());
        return ResponseEntity.ok(ApiResponse.ok("Investment added", investmentRepository.save(investment)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Investment>> update(@PathVariable Long id, @RequestBody Investment updated) {
        Investment inv = investmentRepository.findById(id).orElseThrow();
        inv.setCurrentPrice(updated.getCurrentPrice());
        inv.setCurrentValue(updated.getCurrentValue());
        return ResponseEntity.ok(ApiResponse.ok("Investment updated", investmentRepository.save(inv)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        investmentRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok("Investment deleted", null));
    }
}
