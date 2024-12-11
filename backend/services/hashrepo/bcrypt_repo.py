import bcrypt

def bcryptHash(value: str) -> str:
    return bcrypt.hashpw(value.encode(), bcrypt.gensalt()).decode()

def bcryptCompare(value: str, hashed_value: str) -> bool:
    return bcrypt.checkpw(value.encode(), hashed_value.encode())