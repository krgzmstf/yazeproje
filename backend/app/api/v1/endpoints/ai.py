from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services.ai import (
    analyze_contact_message,
    generate_lead_email,
    generate_project_description,
)

router = APIRouter()


class LeadEmailRequest(BaseModel):
    company_name: str
    contact_name: str = ""
    service: str


class ProjectDescriptionRequest(BaseModel):
    project_name: str
    project_type: str
    features: str


class ContactAnalyzeRequest(BaseModel):
    message: str


@router.post("/email")
def create_lead_email(req: LeadEmailRequest):
    try:
        result = generate_lead_email(req.company_name, req.contact_name, req.service)
        return {"email": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/project-description")
def create_project_description(req: ProjectDescriptionRequest):
    try:
        result = generate_project_description(req.project_name, req.project_type, req.features)
        return {"description": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/analyze-message")
def analyze_message(req: ContactAnalyzeRequest):
    try:
        result = analyze_contact_message(req.message)
        return {"analysis": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
