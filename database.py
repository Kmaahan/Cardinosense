from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from datetime import datetime

SQLALCHEMY_DATABASE_URL = "sqlite:///./cardiosense.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    profile_photo = Column(String, nullable=True)
    
    histories = relationship("HealthHistory", back_populates="user")
    ml_histories = relationship("MLHistory", back_populates="user")

class HealthHistory(Base):
    __tablename__ = "health_histories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    symptoms = Column(Text)
    age = Column(Integer, nullable=True)
    medical_history = Column(Text, nullable=True)
    severity_level = Column(String)
    medical_urgency = Column(String)
    analysis_json = Column(Text) # Store the whole result
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="histories")

class MLHistory(Base):
    __tablename__ = "ml_histories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Input features
    age = Column(Integer)
    sex = Column(String)
    chest_pain_type = Column(String)
    resting_bp = Column(Integer)
    cholesterol = Column(Integer)
    fasting_bs = Column(Integer)
    resting_ecg = Column(String)
    max_hr = Column(Integer)
    exercise_angina = Column(String)
    oldpeak = Column(Float)
    st_slope = Column(String)
    
    # Predictions
    heart_disease_probability = Column(Float)
    prediction = Column(String)
    ai_analysis = Column(Text)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="ml_histories")

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
