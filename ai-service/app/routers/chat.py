from fastapi import APIRouter
from app.models.schemas import ChatRequest

router = APIRouter()

FINANCIAL_RULES = {
    "afford": "Based on your 3-month data, your average monthly savings is {savings:.0f}. A purchase is generally affordable if it's less than 30% of your monthly savings.",
    "save": "A healthy savings rate is 20% of income. Based on your data, you should aim to save {target:.0f} per month.",
    "healthy": "Your financial health depends on savings rate (>20%), low debt ratio (<36%), and emergency fund (3-6 months expenses).",
    "expenses": "Your expenses over 3 months total {expense:.0f}. Look for recurring subscriptions, food delivery, and impulse purchases to cut costs.",
    "improve": "Key improvements: 1) Build emergency fund, 2) Reduce discretionary spending, 3) Automate savings, 4) Pay high-interest debt first.",
}

def generate_response(question: str, income: float, expense: float) -> str:
    q = question.lower()
    monthly_income = income / 3 if income > 0 else 0
    monthly_expense = expense / 3 if expense > 0 else 0
    savings = monthly_income - monthly_expense
    target_savings = monthly_income * 0.2

    if any(word in q for word in ["afford", "purchase", "buy", "can i"]):
        return FINANCIAL_RULES["afford"].format(savings=savings)
    elif any(word in q for word in ["save", "saving", "savings"]):
        return FINANCIAL_RULES["save"].format(target=target_savings)
    elif any(word in q for word in ["healthy", "health", "score", "good"]):
        rate = (savings / monthly_income * 100) if monthly_income > 0 else 0
        status = "good" if rate >= 20 else "needs improvement"
        return f"Your savings rate is {rate:.1f}%, which is {status}. {FINANCIAL_RULES['healthy']}"
    elif any(word in q for word in ["expense", "spending", "increasing", "why"]):
        return FINANCIAL_RULES["expenses"].format(expense=expense)
    elif any(word in q for word in ["improve", "better", "suggest", "recommend"]):
        return FINANCIAL_RULES["improve"]
    else:
        return (f"Based on your data: Monthly income ~{monthly_income:.0f}, "
                f"Monthly expenses ~{monthly_expense:.0f}, "
                f"Monthly savings ~{savings:.0f}. "
                f"Keep tracking your finances to improve your financial health!")

@router.post("/chat")
def chat(request: ChatRequest):
    answer = generate_response(
        request.question,
        request.total_income_3m,
        request.total_expense_3m
    )
    return {"answer": answer, "question": request.question}
