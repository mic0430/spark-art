from typing import Annotated, Callable

from fastapi import APIRouter, File, Request, UploadFile

from models.models import ArtComment
from utils import http as httpUtils
from dbrepo import postgresdb as db


def create_comment_router(get_app_funcs: Callable[[], dict[str, dict[str, callable]]]) -> APIRouter:
    commentRouter = APIRouter()

    @commentRouter.get("/artworks/{artwork_id}/comments")
    async def get_comments(artwork_id: int):
        return db.get_comments(get_app_funcs()["dbconn"](), artwork_id)
    
    @commentRouter.post("/artworks/{artwork_id}/comments")
    async def create_comment(
        artwork_id: int,
        request: Request
    ):
        auth_token = httpUtils.get_auth_token(request)
        if not auth_token:
            return httpUtils.raise_invalid_auth_token()
        
        try:
            payload = get_app_funcs()["authrepo"]()["parse_token"](auth_token)
        except Exception as e:
            return httpUtils.raise_error(str(e), 401)
        
        dbconn = get_app_funcs()["dbconn"]()
        
        # Get user by id
        user = db.get_user_by_id(dbconn, payload["user_id"])
        
        body = await request.form()
        text = body.get("text")
        if not text:
            return httpUtils.raise_error("Text is required", 400)
        
        artcomment = db.create_comment(dbconn, ArtComment(
            id=0,
            creatorId=user.id,
            artworkId=artwork_id,
            text=text,
            createdAt="",
            creatorIconUrl=user.profileImageUrl,
            creatorName=user.username
        ))
        
        return artcomment

    return commentRouter