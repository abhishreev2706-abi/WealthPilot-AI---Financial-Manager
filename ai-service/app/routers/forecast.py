from fastapi import APIRouter
import numpy as np
from app.models.schemas import ForecastRequest

router = APIRouter()

@router.post("/forecast")
def forecast(request: ForecastRequest):
    data = request.monthly_expenses
    if len(data) < 2:
        avg = data[0] if data else 0
        forecasted = [avg] * request.months_to_forecast
        return {"forecast": forecasted, "trend": "insufficient_data"}

    # Simple linear regression for trend
    x = np.arange(len(data))
    coeffs = np.polyfit(x, data, 1)
    slope, intercept = coeffs[0], coeffs[1]

    forecasted = []
    for i in range(1, request.months_to_forecast + 1):
        predicted = slope * (len(data) + i - 1) + intercept
        forecasted.append(round(max(predicted, 0), 2))

    trend = "increasing" if slope > 50 else "decreasing" if slope < -50 else "stable"
    avg_expense = sum(data) / len(data)

    return {
        "forecast": forecasted,
        "trend": trend,
        "average_expense": round(avg_expense, 2),
        "slope": round(slope, 2),
        "insight": f"Your expenses are {trend}. Projected next month: {forecasted[0]:.0f}"
    }
