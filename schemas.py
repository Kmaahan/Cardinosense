from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    profile_photo: Optional[str] = None

    class Config:
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: str | None = None

class HealthHistoryResponse(BaseModel):
    id: int
    symptoms: str
    age: Optional[int]
    medical_history: Optional[str]
    severity_level: str
    medical_urgency: str
    analysis_json: str
    created_at: datetime

    class Config:
        orm_mode = True

class MLPredictRequest(BaseModel):
    age: int
    sex: str = Field(..., description="M or F")
    chest_pain_type: str = Field(..., description="ASY, ATA, NAP, TA")
    resting_bp: int
    cholesterol: int
    fasting_bs: int = Field(..., description="0 or 1")
    resting_ecg: str = Field(..., description="Normal, ST, LVH")
    max_hr: int
    exercise_angina: str = Field(..., description="Y or N")
    oldpeak: float
    st_slope: str = Field(..., description="Up, Flat, Down")

class MLPredictResponse(BaseModel):
    heart_disease_probability: float
    prediction: str = Field(..., description="Yes or No")
    ai_analysis: str

class MLHistoryResponse(BaseModel):
    id: int
    age: int
    sex: str
    chest_pain_type: str
    resting_bp: int
    cholesterol: int
    fasting_bs: int
    resting_ecg: str
    max_hr: int
    exercise_angina: str
    oldpeak: float
    st_slope: str
    heart_disease_probability: float
    prediction: str
    ai_analysis: str
    created_at: datetime

    class Config:
        orm_mode = True
