"""
INFRAESTRUCTURA — Middleware: Validación perimetral (equivalente a Zod)
Todo dato externo se valida aquí antes de llegar al controlador.
Si falla la validación → 400 automático (Pydantic/FastAPI).
"""
from pydantic import BaseModel, Field, field_validator
import re


class ChatMessageSchema(BaseModel):
    """Schema de validación para el endpoint POST /chat."""
    
    user_id: str = Field(
        min_length=1,
        max_length=100,
        description="ID único del usuario"
    )
    message: str = Field(
        min_length=1,
        max_length=500,
        description="Mensaje del usuario, máximo 500 caracteres"
    )

    @field_validator("user_id")
    @classmethod
    def validate_user_id(cls, v: str) -> str:
        # Solo alfanuméricos y guiones bajos
        if not re.match(r"^[a-zA-Z0-9_\-]+$", v):
            raise ValueError("user_id solo puede contener letras, números, guiones y guiones bajos")
        return v

    @field_validator("message")
    @classmethod
    def validate_message(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("El mensaje no puede estar vacío")
        return stripped


class UserIdPathSchema(BaseModel):
    """Schema de validación para parámetros de ruta con user_id."""
    
    user_id: str = Field(min_length=1, max_length=100)

    @field_validator("user_id")
    @classmethod
    def validate_user_id(cls, v: str) -> str:
        if not re.match(r"^[a-zA-Z0-9_\-]+$", v):
            raise ValueError("user_id inválido")
        return v
