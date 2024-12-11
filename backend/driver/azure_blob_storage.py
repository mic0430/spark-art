from azure.storage.blob import BlobServiceClient

def create_blob_service_client(connection_str: str) -> BlobServiceClient:
    return BlobServiceClient.from_connection_string(connection_str)