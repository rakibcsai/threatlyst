from pydantic import BaseModel, Field


class MITRETechniqueCreate(BaseModel):
    technique_id: str = Field(
        min_length=3,
        max_length=30,
    )
    name: str = Field(
        min_length=2,
        max_length=255,
    )
    tactic: str = Field(
        min_length=2,
        max_length=100,
    )
    description: str | None = None
    source: str = "MITRE ATT&CK"


class MITRETechniqueUpdate(BaseModel):
    name: str | None = Field(
        default=None,
        min_length=2,
        max_length=255,
    )
    tactic: str | None = Field(
        default=None,
        min_length=2,
        max_length=100,
    )
    description: str | None = None
    source: str | None = None


class MITRETechniqueResponse(BaseModel):
    id: int
    technique_id: str
    name: str
    tactic: str
    description: str | None
    source: str

    model_config = {
        "from_attributes": True,
    }