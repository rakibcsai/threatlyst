from pydantic import BaseModel, Field


class APIKeyCreate(BaseModel):
    name: str = Field(
        min_length=3,
        max_length=100,
    )


class APIKeyResponse(BaseModel):
    id: int
    name: str
    key_prefix: str
    is_active: bool
    created_by_user_id: int

    model_config = {
        "from_attributes": True,
    }


class APIKeyCreateResponse(APIKeyResponse):
    api_key: str