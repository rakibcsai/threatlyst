from pydantic import BaseModel

from app.models.analysis_result import AnalysisResult
from app.models.ai_analysis import AIAnalysis


class FullEventResponse(BaseModel):
    status: str
    event_id: str
    event_type: str
    rule_analysis: AnalysisResult
    ai_analysis: AIAnalysis