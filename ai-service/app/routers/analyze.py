from fastapi import APIRouter
from collections import defaultdict
from app.models.schemas import AnalyzeRequest

router = APIRouter()

SUBSCRIPTION_CATEGORIES = {"entertainment", "utilities"}
HIGH_RISK_CATEGORIES = {"shopping", "entertainment", "food"}

@router.post("/analyze")
def analyze(request: AnalyzeRequest):
    if not request.transactions:
        return {"insights": [], "patterns": {}}

    expenses = [t for t in request.transactions if t.type == "EXPENSE"]
    if not expenses:
        return {"insights": ["No expense data to analyze."], "patterns": {}}

    # Category totals
    category_totals = defaultdict(float)
    category_counts = defaultdict(int)
    for t in expenses:
        category_totals[t.category.lower()] += t.amount
        category_counts[t.category.lower()] += 1

    total_expense = sum(category_totals.values())
    insights = []

    # Detect impulse spending: high-frequency low-amount transactions
    for cat, count in category_counts.items():
        if count > 10 and category_totals[cat] / count < 50:
            insights.append(f"Possible impulse spending in '{cat}': {count} small transactions detected.")

    # Detect lifestyle inflation: category > 40% of total
    for cat, total in category_totals.items():
        pct = (total / total_expense * 100) if total_expense > 0 else 0
        if pct > 40:
            insights.append(f"'{cat}' accounts for {pct:.0f}% of total expenses. Consider reducing.")

    # Subscription waste detection
    for cat in SUBSCRIPTION_CATEGORIES:
        if cat in category_totals and category_counts[cat] >= 2:
            insights.append(f"Review your '{cat}' subscriptions — you have {category_counts[cat]} recurring charges.")

    if not insights:
        insights.append("Your spending patterns look healthy. Keep maintaining consistent habits!")

    category_breakdown = {k: round(v, 2) for k, v in sorted(category_totals.items(), key=lambda x: -x[1])}

    return {
        "insights": insights,
        "category_breakdown": category_breakdown,
        "total_analyzed": round(total_expense, 2),
        "transaction_count": len(expenses)
    }
