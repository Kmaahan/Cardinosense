"""
Test script for the Healthcare Symptom Analyzer API

Run this to test the endpoint with sample requests.
Requires the API to be running on http://localhost:8000
"""

import json
import httpx

BASE_URL = "http://localhost:8000"

# Test cases
test_cases = [
    {
        "name": "Headache and Fever",
        "data": {
            "symptoms": "I have a severe headache, fever of 38.5°C, and body aches. Started 2 days ago.",
            "age": 28,
            "medical_history": "No significant medical history"
        }
    },
    {
        "name": "Persistent Cough",
        "data": {
            "symptoms": "Dry persistent cough for a week, slight throat pain, no fever",
            "age": 45,
            "medical_history": "Asthma, seasonal allergies"
        }
    },
    {
        "name": "Chest Pain",
        "data": {
            "symptoms": "Sharp chest pain radiating to left arm, shortness of breath, sweating",
            "age": 62
        }
    },
    {
        "name": "Digestive Issues",
        "data": {
            "symptoms": "Stomach cramps, nausea, mild diarrhea after eating fatty foods",
            "age": 35,
            "medical_history": "Mild IBS, lactose intolerance"
        }
    }
]


async def test_health_check():
    """Test the health check endpoint"""
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/health")
        print("✓ Health Check:", response.json())
        return response.status_code == 200


async def test_symptom_analysis(test_case):
    """Test symptom analysis endpoint"""
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{BASE_URL}/analyze-symptoms",
            json=test_case["data"],
            timeout=30.0
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"\n✓ {test_case['name']}")
            print(f"  Severity: {result['severity_level']}")
            print(f"  Urgency: {result['medical_urgency']}")
            print(f"  Findings: {', '.join(result['key_findings'][:2])}")
            return True
        else:
            print(f"\n✗ {test_case['name']}")
            print(f"  Status: {response.status_code}")
            print(f"  Error: {response.text}")
            return False


async def run_tests():
    """Run all tests"""
    print("=" * 60)
    print("Healthcare Symptom Analyzer - API Tests")
    print("=" * 60)
    
    # Test health check
    print("\n1. Testing Health Check...")
    health_ok = await test_health_check()
    if not health_ok:
        print("✗ Health check failed. Is the API running?")
        return
    
    # Test symptom analysis
    print("\n2. Testing Symptom Analysis...")
    passed = 0
    for test_case in test_cases:
        if await test_symptom_analysis(test_case):
            passed += 1
    
    print("\n" + "=" * 60)
    print(f"Results: {passed}/{len(test_cases)} tests passed")
    print("=" * 60)


if __name__ == "__main__":
    import asyncio
    
    try:
        asyncio.run(run_tests())
    except ConnectionError:
        print("✗ Could not connect to API. Ensure it's running on http://localhost:8000")
    except Exception as e:
        print(f"✗ Test error: {e}")
