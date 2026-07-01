"""
FastAPI Healthcare Symptom Analysis Endpoint with Gemini API Integration
"""

import os
import json
from datetime import datetime, timedelta
from typing import Optional, List
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, Field, validator
from google.genai import Client
from sqlalchemy.orm import Session
import jwt

# Import local modules
from schemas import UserCreate, UserResponse, Token, TokenData, HealthHistoryResponse, MLPredictRequest, MLPredictResponse, MLHistoryResponse
from database import engine, Base, get_db, User, HealthHistory, MLHistory
from auth import verify_password, get_password_hash, create_access_token, SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

import joblib
import pandas as pd
import numpy as np

# Load ML Models
try:
    ml_model = joblib.load('ml_models/model.pkl')
    ml_scaler = joblib.load('ml_models/scaler.pkl')
    ml_columns = joblib.load('ml_models/columns.pkl')
except Exception as e:
    print(f"Warning: Could not load ML models. {e}")
    ml_model, ml_scaler, ml_columns = None, None, None

# Create DB tables
Base.metadata.create_all(bind=engine)

load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Healthcare Symptom Analyzer",
    description="Analyze healthcare symptoms using Google Gemini API",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini client
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable not set")

client = Client(api_key=GEMINI_API_KEY)

def generate_content_with_fallback(prompt: str) -> str:
    """Tries multiple Gemini models in case of high demand / 503 errors."""
    models = [
        "gemini-3-flash-preview", 
        "gemini-3.1-flash-lite-preview", 
        "gemini-2.5-flash"
    ]
    
    for model in models:
        try:
            response = client.models.generate_content(
                model=model,
                contents=prompt
            )
            return response.text
        except Exception as e:
            if model == models[-1]:
                raise e
            print(f"Model {model} failed: {e}. Falling back to next...")
            continue

# Auth configuration
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("email")
        if email is None:
            return None
        token_data = TokenData(email=email)
    except Exception:
        return None
    user = db.query(User).filter(User.email == token_data.email).first()
    return user

def get_current_active_user(current_user: User = Depends(get_current_user)):
    if not current_user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return current_user

# Pydantic Models
class SymptomRequest(BaseModel):
    """Request model for symptom analysis"""
    symptoms: str = Field(
        ..., 
        min_length=5, 
        max_length=500,
        description="Detailed description of symptoms"
    )
    age: Optional[int] = Field(None, ge=0, le=150, description="Patient age (optional)")
    medical_history: Optional[str] = Field(
        None, 
        max_length=300,
        description="Relevant medical history (optional)"
    )

    @validator('symptoms')
    def symptoms_not_empty(cls, v):
        if not v.strip():
            raise ValueError('Symptoms cannot be empty')
        return v.strip()


class SymptomAnalysis(BaseModel):
    """Individual symptom analysis"""
    symptom: str
    possible_conditions: list[str]
    likelihood: str


class SymptomResponse(BaseModel):
    """Response model for symptom analysis"""
    severity_level: str = Field(..., description="LOW, MODERATE, or HIGH")
    medical_urgency: str = Field(
        ..., 
        description="SELF_CARE, VISIT_DOCTOR, or SEEK_EMERGENCY"
    )
    key_findings: list[str]
    symptom_breakdown: list[SymptomAnalysis]
    recommendations: list[str]
    disclaimer: str
    analysis_timestamp: datetime


# Analysis prompt template
ANALYSIS_PROMPT_TEMPLATE = """
You are a healthcare information assistant. Analyze the following symptoms and provide 
structured health insights. IMPORTANT: This is for informational purposes only, not a 
medical diagnosis.

Symptoms: {symptoms}
{age_info}{history_info}

Provide analysis in this exact JSON format:
{{
    "severity_level": "LOW|MODERATE|HIGH",
    "medical_urgency": "SELF_CARE|VISIT_DOCTOR|SEEK_EMERGENCY",
    "key_findings": ["finding1", "finding2", ...],
    "symptom_breakdown": [
        {{
            "symptom": "symptom name",
            "possible_conditions": ["condition1", "condition2"],
            "likelihood": "LOW|MODERATE|HIGH"
        }}
    ],
    "recommendations": ["recommendation1", "recommendation2", ...]
}}

Guidelines:
- Be conservative with severity assessment
- If emergency symptoms present, recommend SEEK_EMERGENCY
- Include lifestyle, over-the-counter options for SELF_CARE level
- Suggest professional evaluation for VISIT_DOCTOR level
- List only common, well-known possible conditions
"""


def create_analysis_prompt(request: SymptomRequest) -> str:
    """Create the analysis prompt from the request"""
    age_info = f"\nAge: {request.age}" if request.age else ""
    history_info = (
        f"\nMedical History: {request.medical_history}"
        if request.medical_history
        else ""
    )
    
    return ANALYSIS_PROMPT_TEMPLATE.format(
        symptoms=request.symptoms,
        age_info=age_info,
        history_info=history_info
    )


def parse_gemini_response(response_text: str) -> dict:
    """Parse Gemini response and extract JSON"""
    import re
    
    # Try to extract JSON from the response
    json_match = re.search(r'\{[\s\S]*\}', response_text)
    if not json_match:
        raise ValueError("No JSON found in Gemini response")
    
    json_str = json_match.group()
    return json.loads(json_str)


@app.get("/", tags=["Health"])
async def root():
    """Root endpoint"""
    return {
        "message": "Healthcare Symptom Analyzer API",
        "version": "1.0.0",
        "endpoints": {
            "analyze_symptoms": "/analyze-symptoms",
            "health_check": "/health"
        }
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now()
    }


# Auth Endpoints
@app.post("/register", response_model=UserResponse, tags=["Authentication"])
async def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(user.password)
    db_user = User(email=user.email, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/token", response_model=Token, tags=["Authentication"])
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"email": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

from fastapi import UploadFile, File
import shutil
from fastapi.staticfiles import StaticFiles

os.makedirs("uploads/profiles", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/users/me", response_model=UserResponse, tags=["Users"])
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user

@app.post("/users/me/photo", response_model=UserResponse, tags=["Users"])
async def upload_profile_photo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    upload_dir = "uploads/profiles"
    os.makedirs(upload_dir, exist_ok=True)
    ext = file.filename.split('.')[-1]
    filename = f"{current_user.id}_photo.{ext}"
    file_path = f"{upload_dir}/{filename}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    current_user.profile_photo = f"/{file_path}"
    db.commit()
    db.refresh(current_user)
    return current_user

@app.get("/history", response_model=List[HealthHistoryResponse], tags=["History"])
async def get_health_history(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    history = db.query(HealthHistory).filter(HealthHistory.user_id == current_user.id).order_by(HealthHistory.created_at.desc()).all()
    return history


@app.post("/analyze-symptoms", response_model=SymptomResponse, tags=["Analysis"])
async def analyze_symptoms(
    request: SymptomRequest, 
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> SymptomResponse:
    """
    Analyze healthcare symptoms using Gemini API.
    Optionally saves the history to DB if user is authenticated.
    """
    try:
        # Create analysis prompt
        prompt = create_analysis_prompt(request)
        
        # Call Gemini API with fallback
        response_text = generate_content_with_fallback(prompt)
        
        # Parse response
        analysis_data = parse_gemini_response(response_text)
        
        result_response = SymptomResponse(
            severity_level=analysis_data.get("severity_level", "MODERATE"),
            medical_urgency=analysis_data.get("medical_urgency", "VISIT_DOCTOR"),
            key_findings=analysis_data.get("key_findings", []),
            symptom_breakdown=[
                SymptomAnalysis(**symptom) 
                for symptom in analysis_data.get("symptom_breakdown", [])
            ],
            recommendations=analysis_data.get("recommendations", []),
            disclaimer=(
                "DISCLAIMER: This analysis is for informational purposes only. "
                "It does not constitute medical advice. Always consult with a qualified "
                "healthcare professional for diagnosis and treatment recommendations."
            ),
            analysis_timestamp=datetime.now()
        )

        # Save to DB if user is authenticated
        if current_user:
            history_entry = HealthHistory(
                user_id=current_user.id,
                symptoms=request.symptoms,
                age=request.age,
                medical_history=request.medical_history,
                severity_level=result_response.severity_level,
                medical_urgency=result_response.medical_urgency,
                analysis_json=result_response.json()
            )
            db.add(history_entry)
            db.commit()

        return result_response
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid input: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {str(e)}"
        )


ML_ANALYSIS_PROMPT_TEMPLATE = """
You are a top-tier cardiologist. You are reviewing the results of a machine learning model's prediction for a patient's risk of heart disease.

Patient Vitals:
- Age: {age}
- Sex: {sex}
- Resting BP: {resting_bp}
- Cholesterol: {cholesterol}
- Max HR: {max_hr}
- Fasting Blood Sugar > 120 mg/dl: {fasting_bs}
- Oldpeak: {oldpeak}
- Chest Pain Type: {chest_pain_type}
- Resting ECG: {resting_ecg}
- Exercise Induced Angina: {exercise_angina}
- ST Slope: {st_slope}

Machine Learning Prediction:
- Heart Disease Probability: {probability}%
- Model Classification: {prediction}

Based on the patient's specific vitals and the ML model's high-accuracy prediction, provide a detailed but accessible medical analysis.
Structure your response exactly as follows (no markdown formatting outside of these sections, just text):
[Analysis]
Explain what the probability means in this specific patient's context. Break down which of their specific vitals (e.g. cholesterol, oldpeak, ST slope) are the most significant risk factors or protective factors.

[Recommendations]
Provide 3-5 actionable lifestyle, dietary, or medical recommendations tailored specifically to their risk profile and vitals.
"""

@app.post("/ml-predict", response_model=MLPredictResponse, tags=["Analysis"])
async def predict_ml(
    request: MLPredictRequest,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not ml_model:
        raise HTTPException(status_code=500, detail="ML models are not loaded on the server.")
        
    try:
        # Create a dictionary initialized with all expected columns set to 0
        input_data = {col: [0] for col in ml_columns}
        
        # Set numerical variables
        input_data['Age'] = [request.age]
        input_data['RestingBP'] = [request.resting_bp]
        input_data['Cholesterol'] = [request.cholesterol]
        input_data['FastingBS'] = [request.fasting_bs]
        input_data['MaxHR'] = [request.max_hr]
        input_data['Oldpeak'] = [request.oldpeak]
        
        # Set one-hot encoded variables if they exist in columns
        if f'Sex_{request.sex}' in ml_columns:
            input_data[f'Sex_{request.sex}'] = [1]
            
        if f'ChestPainType_{request.chest_pain_type}' in ml_columns:
            input_data[f'ChestPainType_{request.chest_pain_type}'] = [1]
            
        if f'RestingECG_{request.resting_ecg}' in ml_columns:
            input_data[f'RestingECG_{request.resting_ecg}'] = [1]
            
        if f'ExerciseAngina_{request.exercise_angina}' in ml_columns:
            input_data[f'ExerciseAngina_{request.exercise_angina}'] = [1]
            
        if f'ST_Slope_{request.st_slope}' in ml_columns:
            input_data[f'ST_Slope_{request.st_slope}'] = [1]
            
        # Convert to DataFrame ensuring columns match exactly
        df = pd.DataFrame(input_data)
        df = df[ml_columns] # Reorder columns exactly
        
        # Scale features
        df_scaled = ml_scaler.transform(df)
        
        # Predict
        probability = ml_model.predict_proba(df_scaled)[0][1] * 100
        prediction = "Yes" if probability > 50 else "No"
        
        # Gemini AI Explanation with fallback
        prompt = ML_ANALYSIS_PROMPT_TEMPLATE.format(
            age=request.age,
            sex=request.sex,
            resting_bp=request.resting_bp,
            cholesterol=request.cholesterol,
            max_hr=request.max_hr,
            fasting_bs="Yes" if request.fasting_bs else "No",
            oldpeak=request.oldpeak,
            chest_pain_type=request.chest_pain_type,
            resting_ecg=request.resting_ecg,
            exercise_angina=request.exercise_angina,
            st_slope=request.st_slope,
            probability=round(probability, 1),
            prediction=prediction
        )
        
        ai_response_text = generate_content_with_fallback(prompt)
        
        # Save to DB if user is authenticated
        if current_user:
            history_entry = MLHistory(
                user_id=current_user.id,
                age=request.age,
                sex=request.sex,
                chest_pain_type=request.chest_pain_type,
                resting_bp=request.resting_bp,
                cholesterol=request.cholesterol,
                fasting_bs=request.fasting_bs,
                resting_ecg=request.resting_ecg,
                max_hr=request.max_hr,
                exercise_angina=request.exercise_angina,
                oldpeak=request.oldpeak,
                st_slope=request.st_slope,
                heart_disease_probability=round(probability, 1),
                prediction=prediction,
                ai_analysis=ai_response_text
            )
            db.add(history_entry)
            db.commit()

        return MLPredictResponse(
            heart_disease_probability=round(probability, 1),
            prediction=prediction,
            ai_analysis=ai_response_text
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.get("/ml-history", response_model=List[MLHistoryResponse], tags=["History"])
async def get_ml_history(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
    history = db.query(MLHistory).filter(MLHistory.user_id == current_user.id).order_by(MLHistory.created_at.desc()).all()
    return history


if __name__ == "__main__":
    import uvicorn
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    debug = os.getenv("DEBUG", "False").lower() == "true"
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=debug
    )
