import uuid
from azure.storage.blob import BlobServiceClient
from fastapi import UploadFile

def upload_image_to_azure_storage(client: BlobServiceClient, file: UploadFile) -> str:
    file_extension = file.filename.split(".")[-1]
    file_name = str(uuid.uuid4()) + "." + file_extension
    blob_client = client.get_blob_client(container="images", blob=file_name)
    blob_client.upload_blob(data=file.file.read())
    return "https://sparkart.blob.core.windows.net/images/" + file_name