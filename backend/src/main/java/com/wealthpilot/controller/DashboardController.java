package com.wealthpilot.controller;

import com.wealthpilot.dto.ApiResponse;
import com.wealthpilot.dto.DashboardDTO;
import com.wealthpilot.service.DashboardService;
import com.wealthpilot.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<DashboardDTO>> getDashboard() {
        Long userId = userService.getCurrentUserId();
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getDashboard(userId)));
    }
}
