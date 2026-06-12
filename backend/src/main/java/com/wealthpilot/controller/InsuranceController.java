package com.wealthpilot.controller;

import com.wealthpilot.dto.ApiResponse;
import com.wealthpilot.entity.Insurance;
import com.wealthpilot.repository.InsuranceRepository;
import com.wealthpilot.repository.UserRepository;
import com.wealthpilot.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/insurance")
@RequiredArgsConstructor
public class InsuranceController {

    private final InsuranceRepository insuranceRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Insurance>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(insuranceRepository.findByUserId(userService.getCurrentUserId())));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Insurance>> create(@RequestBody Insurance insurance) {
        insurance.setUser(userRepository.findById(userService.getCurrentUserId()).orElseThrow());
        return ResponseEntity.ok(ApiResponse.ok("Policy added", insuranceRepository.save(insurance)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Insurance>> update(@PathVariable Long id, @RequestBody Insurance updated) {
        Insurance ins = insuranceRepository.findById(id).orElseThrow();
        ins.setRenewalDate(updated.getRenewalDate());
        ins.setStatus(updated.getStatus());
        ins.setPremium(updated.getPremium());
        return ResponseEntity.ok(ApiResponse.ok("Policy updated", insuranceRepository.save(ins)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        insuranceRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok("Policy deleted", null));
    }
}
