from pydantic import BaseModel
from typing import Optional

class ChatRequest(BaseModel):
    question: str
    total_income_3m: float = 0
    total_expense_3m: float = 0
    transaction_count: int = 0

class ForecastRequest(BaseModel):
    monthly_expenses: list[float]
    months_to_forecast: int = 3

class Transaction(BaseModel):
    amount: float
    category: str
    type: str
    date: str

class AnalyzeRequest(BaseModel):
    transactions: list[Transaction]
