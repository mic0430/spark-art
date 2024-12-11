import jwt

def create_jwt_token(secret, algorithm, payload):
    return jwt.encode(
        payload=payload,
        key=secret,
        algorithm=algorithm,
        headers={"exp": 60 * 60 * 24 * 7} # expires in 7 days
    )

def parse_jwt_token(secret, algorithm, token):
    return jwt.decode(token, secret, algorithms=[algorithm])

token_generator = lambda secret, algorithm: lambda payload: create_jwt_token(secret, algorithm, payload)

token_parser = lambda secret, algorithm: lambda token: parse_jwt_token(secret, algorithm, token)