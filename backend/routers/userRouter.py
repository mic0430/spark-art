
from typing import Annotated, Callable
from fastapi import APIRouter, File, Form, Query, Request, UploadFile

from services.imagerepo.azure_repo import upload_image_to_azure_storage
from services.hashrepo.bcrypt_repo import bcryptCompare, bcryptHash
from models.models import User
from utils import http as httpUtils

from dbrepo import postgresdb as db

def create_user_router(get_app_funcs: Callable[[], dict[str, dict[str, callable]]]) -> APIRouter:
    userRouter = APIRouter()

    @userRouter.get("/user")
    async def get_user(request: Request):
        auth_token = httpUtils.get_auth_token(request)
        if not auth_token:
            return httpUtils.raise_invalid_auth_token()
        
        try:
            payload = get_app_funcs()["authrepo"]()["parse_token"](auth_token)
        except Exception as e:
            return httpUtils.raise_error(str(e), 401)
        
        user = db.get_user_by_id(get_app_funcs()["dbconn"](), payload["user_id"])
        if not user:
            return httpUtils.raise_user_not_found()
        
        return user

    @userRouter.post("/register")
    async def register_user(
        username: str = Form(),
        password: str = Form()
    ):
        # TODO: Add validation for username and password
        if password == "":
            return httpUtils.raise_error("Password is required", 400)
        
        try:
            hashed_password = bcryptHash(password)
        except Exception as e:
            print(e)
            return httpUtils.raise_error("Error hashing password", 500)
        
        newUser = User(
            id=0,
            username=username,
            password=hashed_password,
            profileImageUrl="https://sparkart.blob.core.windows.net/images/default.jpg",
            createdAt=""
        )

        # TODO: Handle errors
        newUser = db.create_user(get_app_funcs()["dbconn"](), newUser)

        auth_token = get_app_funcs()["authrepo"]()["create_token"]({
            "user_id": newUser.id,
            "username": newUser.username,
        })

        res = httpUtils.jsonResponse({
            "message": "User registered"
        }, 201)
        res.headers["Authorization"] = f"Bearer {auth_token}"
        
        return res
    
    @userRouter.post("/login")
    async def login_user(   
        username: str = Form(),
        password: str = Form()
    ):
    # Validate input
        if not username or not password:
            return httpUtils.raise_error("Username and password are required", 400)

        try:
            # Fetch user from DB
            user = db.get_user_by_username(get_app_funcs()["dbconn"](), username)
            if not user:
                return httpUtils.raise_error("Invalid username or password", 401)
        
            # Verify pw
            if not bcryptCompare(password, user.password):
                return httpUtils.raise_error("Invalid username or password", 401)
        
        
            auth_token = get_app_funcs()["authrepo"]()["create_token"]({
                "user_id": user.id,
                "username": user.username,
        })

            res = httpUtils.jsonResponse({
                "message": "Login successful"
            }, 200)
            res.headers["Authorization"] = f"Bearer {auth_token}"

            return res

        except Exception as e:
            print(e)
            return httpUtils.raise_error("An error occurred during login", 500)

    

    @userRouter.get("/users")
    async def get_user(username: str = Query(None), id: int = Query(None)):
        if not username and not id:
            return httpUtils.raise_error("Username or user_id is required", 400)
        
        if username:
            user = db.get_user_by_username(get_app_funcs()["dbconn"](), username)
        else:
            user = db.get_user_by_id(get_app_funcs()["dbconn"](), id)

        if not user:
            return httpUtils.raise_error("User not found", 404)
        return user
    
    # Get file from form data
    @userRouter.put("/users/{user_id}/image")
    async def update_user_image(user_id: int, request: Request, image: Annotated[UploadFile, File()]):
        auth_token = httpUtils.get_auth_token(request)
        if not auth_token:
            return httpUtils.raise_invalid_auth_token()
        
        try:
            payload = get_app_funcs()["authrepo"]()["parse_token"](auth_token)
        except Exception as e:
            return httpUtils.raise_error(str(e), 401)
        
        if payload["user_id"] != user_id:
            return httpUtils.raise_forbidden()
        
        # Validate image is jpg, jpeg, or png
        if not image.content_type in ["image/jpeg", "image/jpg", "image/png"]:
            return httpUtils.raise_error("Invalid image type. Please upload a jpg, jpeg, or png file", 400)
        
        image_url = upload_image_to_azure_storage(
            client=get_app_funcs()["blob_service_client"](),
            file=image
        )

        user = db.update_user_image_url(get_app_funcs()["dbconn"](), user_id, image_url)

        return user
    
    return userRouter