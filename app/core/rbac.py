from collections.abc import Callable

from fastapi import Depends, HTTPException

from app.core.auth_dependencies import get_current_user
from app.db.user import UserDB


def require_roles(
    *allowed_roles: str,
) -> Callable:
    """
    Create a FastAPI dependency that restricts
    access to users with one of the allowed roles.
    """

    normalized_roles = {
        role.lower().strip()
        for role in allowed_roles
    }

    def role_checker(
        current_user: UserDB = Depends(
            get_current_user
        ),
    ) -> UserDB:

        user_role = current_user.role.lower().strip()

        if user_role not in normalized_roles:
            raise HTTPException(
                status_code=403,
                detail=(
                    "You do not have permission "
                    "to access this resource."
                ),
            )

        return current_user

    return role_checker