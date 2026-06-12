package com.wealthpilot.service;

import com.wealthpilot.dto.TransactionDTO;
import com.wealthpilot.entity.Transaction;
import com.wealthpilot.entity.User;
import com.wealthpilot.exception.ResourceNotFoundException;
import com.wealthpilot.repository.TransactionRepository;
import com.wealthpilot.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public TransactionDTO create(Long userId, TransactionDTO dto) {
        User user = userRepository.findById(userId).orElseThrow();
        Transaction t = new Transaction();
        mapToEntity(dto, t);
        t.setUser(user);
        return mapToDTO(transactionRepository.save(t));
    }

    public List<TransactionDTO> getAll(Long userId) {
        return transactionRepository.findByUserIdOrderByTransactionDateDesc(userId)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public TransactionDTO update(Long userId, Long id, TransactionDTO dto) {
        Transaction t = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
        if (!t.getUser().getId().equals(userId)) throw new AccessDeniedException("Forbidden");
        mapToEntity(dto, t);
        return mapToDTO(transactionRepository.save(t));
    }

    public void delete(Long userId, Long id) {
        Transaction t = transactionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
        if (!t.getUser().getId().equals(userId)) throw new AccessDeniedException("Forbidden");
        transactionRepository.delete(t);
    }

    private void mapToEntity(TransactionDTO dto, Transaction t) {
        t.setType(dto.getType());
        t.setCategory(dto.getCategory());
        t.setAmount(dto.getAmount());
        t.setDescription(dto.getDescription());
        t.setTransactionDate(dto.getTransactionDate());
        t.setRecurring(dto.isRecurring());
    }

    public TransactionDTO mapToDTO(Transaction t) {
        TransactionDTO dto = new TransactionDTO();
        dto.setId(t.getId());
        dto.setType(t.getType());
        dto.setCategory(t.getCategory());
        dto.setAmount(t.getAmount());
        dto.setDescription(t.getDescription());
        dto.setTransactionDate(t.getTransactionDate());
        dto.setRecurring(t.isRecurring());
        return dto;
    }
}
