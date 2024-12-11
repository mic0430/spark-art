
import os
from dotenv import load_dotenv
from fastapi import FastAPI

from driver.azure_blob_storage import create_blob_service_client
from services.authrepo.jwt_repo import token_generator, token_parser
from routers.router import create_router
from driver.postgres import create_postgres_connection
from fastapi.middleware.cors import CORSMiddleware

# Get environment variables
load_dotenv()
secret_token = os.getenv("SECRET_TOKEN")
algorithm = os.getenv("JWT_ALGORITHM")
postgres_conn_str = os.getenv("POSTGRES_CONNECTION_STRING")
azure_blob_conn_str = os.getenv("AZURE_STORAGE_CONNECTION_STRING")

# Set up database connnection
dbconn = create_postgres_connection(postgres_conn_str)

# Set up blob storage connection
blob_service_client = create_blob_service_client(azure_blob_conn_str)

# Set up app-wide config functions
getAppFuncs = lambda secret_token, token_algorithm: lambda: {
    "authrepo": lambda: {
        "create_token": token_generator(secret_token, token_algorithm),
        "parse_token": token_parser(secret_token, token_algorithm)
    },
    "dbconn": lambda: dbconn,
    "blob_service_client": lambda: blob_service_client
}

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(
    create_router(getAppFuncs(
        secret_token, 
        algorithm
    )), 
    prefix="/api"
)

@app.get("/")
async def root():
    return {"message": "Hello World"}