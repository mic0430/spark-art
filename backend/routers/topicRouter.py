
from typing import Callable

from fastapi import APIRouter, Request

from models.models import Topic
from utils import http as httpUtils
from dbrepo import postgresdb as db


def create_topic_router(get_app_funcs: Callable[[], dict[str, dict[str, callable]]]) -> APIRouter:
    topicsRouter = APIRouter()

    @topicsRouter.get("/topics")
    async def get_topics(sort_by: str = "latest"):
        return db.get_topics(get_app_funcs()["dbconn"](), sort_by)
    
    @topicsRouter.post("/topics")
    async def create_topic(
        request: Request
    ):
        auth_token = httpUtils.get_auth_token(request)
        if not auth_token:
            raise httpUtils.raise_invalid_auth_token()
        
        try:
            payload = get_app_funcs()["authrepo"]()["parse_token"](auth_token)
        except Exception as e:
            return httpUtils.raise_error(str(e), 401)
        
        body = await request.form()
        text = body.get("text")
        if not text:
            return httpUtils.raise_error("Text is required", 400)
        
        topic = db.create_topic(
            get_app_funcs()["dbconn"](),
            Topic(
                id=0,
                text=text,
                creatorId=payload["user_id"],
                createdAt="",
                creatorName="",
                creatorIconUrl="",
                responses=0
            )
        )

        return topic
    
    @topicsRouter.get("/topics/{topic_id}")
    async def get_topic(topic_id: int):
        topic = db.get_topic_by_id(get_app_funcs()["dbconn"](), topic_id)
        if not topic:
            return httpUtils.raise_not_found("Topic not found")
        
        return topic
    
    @topicsRouter.get("/users/{user_id}/topics")
    async def get_user_topics(user_id: int):
        return db.get_topics_by_user_id(get_app_funcs()["dbconn"](), user_id)

    return topicsRouter