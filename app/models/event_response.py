from pydantic import BaseModel

from app.models.analysis_result import AnalysisResult


class EventResponse(BaseModel):
    status: str
    event_id: str
    event_type: str
    analysis: AnalysisResult