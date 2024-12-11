from psycopg import Connection

from models.models import Artwork, Topic, User, ArtComment

def create_user(conn: Connection, user: User) -> User:
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO users (username, password, image_url) VALUES (%s, %s, %s) RETURNING id",
            (user.username, user.password, user.profileImageUrl)
        )
        user.id = cur.fetchone()[0]
        conn.commit()
    return user

def get_user_by_username(conn: Connection, username: str) -> User | None:
    with conn.cursor() as cur:
        cur.execute(
            "SELECT * FROM users WHERE username = %s",
            (username,)
        )
        user = cur.fetchone()
    return User(
        id=user[0],
        username=user[1],
        profileImageUrl=user[2],
        password=user[3],
        createdAt=str(user[4])
    ) if user else None

def get_user_by_id(conn: Connection, user_id: int) -> User | None:
    with conn.cursor() as cur:
        cur.execute(
            "SELECT * FROM users WHERE id = %s",
            (user_id,)
        )
        user = cur.fetchone()
    return User(
        id=user[0],
        username=user[1],
        profileImageUrl=user[2],
        password=user[3],
        createdAt=str(user[4])
    ) if user else None

def update_user_image_url(conn: Connection, user_id: int, image_url: str) -> User | None:
    with conn.cursor() as cur:
        cur.execute(
            "UPDATE users SET image_url = %s WHERE id = %s RETURNING *",
            (image_url, user_id)
        )
        user = cur.fetchone()
        conn.commit()
    return User(
        id=user[0],
        username=user[1],
        profileImageUrl=user[2],
        password=user[3],
        createdAt=str(user[4])
    ) if user else None

def get_topics(conn: Connection, sort_by: str) -> list[Topic]:
    order_by = "t.created_at DESC"
    if sort_by == "most-responses":
        order_by = "responses DESC"

    with conn.cursor() as cur:
        cur.execute(
            f"""
                SELECT t.id, t."text", t.created_at, t.user_id, COUNT(DISTINCT a.id) as responses, u.username, u.image_url
                FROM topics t
                LEFT JOIN artworks a ON t.id = a.topic_id
                LEFT JOIN users u ON t.user_id = u.id
                GROUP BY t.id, u.id
                ORDER BY {order_by}
            """
        )
        topics = cur.fetchall()
    return [
        Topic(
            id=topic[0],
            text=topic[1],
            createdAt=str(topic[2]),
            creatorId=topic[3],
            creatorName=topic[5],
            creatorIconUrl=topic[6],
            responses=topic[4]
        ) for topic in topics
    ]

def create_topic(conn: Connection, topic: Topic) -> Topic:
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO topics (text, user_id) VALUES (%s, %s) RETURNING id, created_at",
            (topic.text, topic.creatorId)
        )
        topic_id, topic_createdAt = cur.fetchone()
        topic.id = topic_id
        topic.createdAt = str(topic_createdAt)
        topic.creatorName = get_user_by_id(conn, topic.creatorId).username
        conn.commit()
    return topic

def get_topic_by_id(conn: Connection, topic_id: int) -> Topic | None:
    with conn.cursor() as cur:
        cur.execute(
            """
                SELECT t.id, t."text", t.created_at, t.user_id, u.username, u.image_url
                FROM topics t
                LEFT JOIN users u ON t.user_id = u.id
                WHERE t.id = %s
            """,
            (topic_id,)
        )
        topic = cur.fetchone()
    return Topic(
        id=topic[0],
        text=topic[1],
        createdAt=str(topic[2]),
        creatorId=topic[3],
        creatorName=topic[4],
        creatorIconUrl=topic[5],
        responses=0
    ) if topic else None

def get_topics_by_user_id(conn: Connection, user_id: int) -> list[Topic]:
    with conn.cursor() as cur:
        cur.execute(
            """
                SELECT t.id, t."text", t.created_at, t.user_id, u.username, u.image_url, COUNT(DISTINCT a.id) as responses
                FROM topics t
                LEFT JOIN users u ON t.user_id = u.id
                LEFT JOIN artworks a ON t.id = a.topic_id
                WHERE t.user_id = %s
                GROUP BY t.id, u.id
            """,
            (user_id,)
        )
        topics = cur.fetchall()
    return [
        Topic(
            id=topic[0],
            text=topic[1],
            createdAt=str(topic[2]),
            creatorId=topic[3],
            creatorName=topic[4],
            creatorIconUrl=topic[5],
            responses=topic[6]
        ) for topic in topics
    ]

def get_artworks(conn: Connection, sort_by: str, curr_user_id: int) -> list[Artwork]:
    order_by = "a.created_at DESC"
    if sort_by == "most-liked":
        order_by = "likes DESC"

    with conn.cursor() as cur:
        cur.execute(f"""
            SELECT 
                a.id AS artwork_id, 
                a.title AS artwork_title, 
                a.image_url AS artwork_image_url, 
                a.created_at AS artwork_created_at, 
                a.user_id AS creator_id, 
                a.topic_id AS topic_id,
                u.image_url AS creator_profile_picture, 
                COUNT(DISTINCT ul.user_id) AS likes,
                COUNT(DISTINCT c.id) AS comments,
                EXISTS(SELECT 1 FROM userlikes WHERE user_id = %s AND artwork_id = a.id AND is_liked = TRUE) as is_liked,
                t."text"  as topic_title,
                u.username as create_username
            FROM artworks a
            LEFT JOIN users u ON a.user_id = u.id
            LEFT JOIN userlikes ul ON a.id = ul.artwork_id AND ul.is_liked = TRUE
            LEFT JOIN artcomments c ON a.id = c.artwork_id
            LEFT JOIN topics t on a.topic_id = t.id 
            GROUP BY a.id, u.id, t.id
            ORDER BY {order_by};
        """, (curr_user_id,))
        artworks = cur.fetchall()
    return [
        Artwork(
            id=artwork[0],
            title=artwork[1],
            imageUrl=artwork[2],
            createdAt=str(artwork[3]),
            authorId=artwork[4],
            topicId=artwork[5],
            authorIconUrl=artwork[6],
            likes=artwork[7],
            comments=artwork[8],
            isLiked=artwork[9],
            topicText=artwork[10],
            authorName=artwork[11]
        ) for artwork in artworks
    ]

def create_artwork(conn: Connection, artwork: Artwork) -> Artwork:
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO artworks (title, image_url, user_id, topic_id) VALUES (%s, %s, %s, %s) RETURNING id, created_at",
            (artwork.title, artwork.imageUrl, artwork.authorId, artwork.topicId)
        )
        artwork_id, artwork_createdAt = cur.fetchone()
        artwork.id = artwork_id
        artwork.createdAt = str(artwork_createdAt)
        conn.commit()
    return artwork

def get_artwork_by_id(conn: Connection, artwork_id: int, curr_user_id: int) -> Artwork | None:
    with conn.cursor() as cur:
        cur.execute("""
                SELECT a.id, a.title, a.image_url, a.created_at, a.user_id, a.topic_id, u.image_url,
                COUNT(ul.user_id) as likes,
                EXISTS(SELECT 1 FROM userlikes WHERE user_id = %s AND artwork_id = a.id AND is_liked = TRUE) as is_liked,
                t."text",
                u.username
                FROM artworks a
                LEFT JOIN users u ON a.user_id = u.id
                LEFT JOIN userlikes ul ON a.id = ul.artwork_id
                LEFT JOIN topics t on a.topic_id = t.id
                WHERE a.id = %s
                GROUP BY a.id, u.id, t.id
            """,
            (curr_user_id, artwork_id,)
        )
        artwork = cur.fetchone()
    return Artwork(
        id=artwork[0],
        title=artwork[1],
        imageUrl=artwork[2],
        createdAt=str(artwork[3]),
        authorId=artwork[4],
        topicId=artwork[5],
        authorIconUrl=artwork[6],
        likes=artwork[7],
        comments=0,
        isLiked=artwork[8],
        topicText=artwork[9],
        authorName=artwork[10]
    ) if artwork else None

def get_artworks_by_user_id(conn: Connection, user_id: int, curr_user_id: int) -> list[Artwork]:
    with conn.cursor() as cur:
        cur.execute(
            """
                SELECT 
                    a.id AS artwork_id, 
                    a.title AS artwork_title, 
                    a.image_url AS artwork_image_url, 
                    a.created_at AS artwork_created_at, 
                    a.user_id AS creator_id,
                    a.topic_id AS topic_id,
                    u.image_url AS creator_profile_picture, 
                    COUNT(DISTINCT ul.user_id) AS likes,
                    COUNT(DISTINCT c.id) AS comments,
                    EXISTS(SELECT 1 FROM userlikes WHERE user_id = %s AND artwork_id = a.id AND is_liked = TRUE) as is_liked,
                    t."text" as topic_title,
                    u.username
                FROM artworks a
                LEFT JOIN users u ON a.user_id = u.id
                LEFT JOIN userlikes ul ON a.id = ul.artwork_id AND ul.is_liked = TRUE
                LEFT JOIN artcomments c ON a.id = c.artwork_id
                LEFT JOIN topics t on a.topic_id = t.id
                WHERE a.user_id = %s
                GROUP BY a.id, u.id, t.id
                ORDER BY a.created_at DESC;
            """,
            (curr_user_id, user_id)
        )
        artworks = cur.fetchall()
    return [
        Artwork(
            id=artwork[0],
            title=artwork[1],
            imageUrl=artwork[2],
            createdAt=str(artwork[3]),
            authorId=artwork[4],
            topicId=artwork[5],
            authorIconUrl=artwork[6],
            likes=artwork[7],
            comments=artwork[8],
            isLiked=artwork[9],
            topicText=artwork[10],
            authorName=artwork[11]
        ) for artwork in artworks
    ]

def get_artworks_by_topic_id(conn: Connection, topic_id: int, curr_user_id: int) -> list[Artwork]:
    with conn.cursor() as cur:
        cur.execute(
            """
                SELECT 
                    a.id AS artwork_id, 
                    a.title AS artwork_title, 
                    a.image_url AS artwork_image_url, 
                    a.created_at AS artwork_created_at, 
                    a.user_id AS creator_id, 
                    a.topic_id AS topic_id,
                    u.image_url AS creator_profile_picture, 
                    COUNT(DISTINCT ul.user_id) AS likes,
                    COUNT(DISTINCT c.id) AS comments,
                    EXISTS(SELECT 1 FROM userlikes WHERE user_id = %s AND artwork_id = a.id AND is_liked = TRUE) as is_liked,
                    t."text" as topic_title,
                    u.username
                FROM artworks a
                LEFT JOIN users u ON a.user_id = u.id
                LEFT JOIN userlikes ul ON a.id = ul.artwork_id AND ul.is_liked = TRUE
                LEFT JOIN artcomments c ON a.id = c.artwork_id
                LEFT JOIN topics t on a.topic_id = t.id
                WHERE a.topic_id = %s
                GROUP BY a.id, u.id, t.id
                ORDER BY a.created_at DESC;
            """,
            (curr_user_id, topic_id)
        )
        artworks = cur.fetchall()
    return [
        Artwork(
            id=artwork[0],
            title=artwork[1],
            imageUrl=artwork[2],
            createdAt=str(artwork[3]),
            authorId=artwork[4],
            topicId=artwork[5],
            authorIconUrl=artwork[6],
            likes=artwork[7],
            comments=artwork[8],
            isLiked=artwork[9],
            topicText=artwork[10],
            authorName=artwork[11]
        ) for artwork in artworks
    ]

def like_artwork(conn: Connection, user_id: int, artwork_id: int, liked: bool) -> None:
    with conn.cursor() as cur:
        # Fetch the like record if it exists
        cur.execute(
            "SELECT * FROM userlikes WHERE user_id = %s AND artwork_id = %s",
            (user_id, artwork_id)
        )
        like = cur.fetchone()
        if like:
            # Update the like record
            cur.execute(
                "UPDATE userlikes SET is_liked = %s WHERE user_id = %s AND artwork_id = %s",
                (liked, user_id, artwork_id)
            )
        else:
            # Create a new like record
            cur.execute(
                "INSERT INTO userlikes (user_id, artwork_id, is_liked) VALUES (%s, %s, %s)",
                (user_id, artwork_id, liked)
            )

        conn.commit()
    return None

def unlike_artwork(conn: Connection, user_id: int, artwork_id: int) -> None:
    with conn.cursor() as cur:
        cur.execute(
            "DELETE FROM userlikes WHERE user_id = %s AND artwork_id = %s",
            (user_id, artwork_id)
        )
        conn.commit()
    return None

def get_user_liked_artworks(conn: Connection, user_id: int, curr_user_id: int) -> list[Artwork]:
    with conn.cursor() as cur:
        cur.execute(
            """
                SELECT 
                    a.id AS artwork_id, 
                    a.title AS artwork_title, 
                    a.image_url AS artwork_image_url, 
                    a.created_at AS artwork_created_at, 
                    a.user_id AS creator_id,
                    a.topic_id AS topic_id, 
                    u.image_url AS creator_profile_picture, 
                    COUNT(DISTINCT ul.user_id) AS likes,
                    COUNT(DISTINCT c.id) AS comments,
                    EXISTS(SELECT 1 FROM userlikes WHERE user_id = %s AND artwork_id = a.id AND is_liked = TRUE) as is_liked,
                    t."text" as topic_title,
                    u.username
                FROM artworks a
                LEFT JOIN users u ON a.user_id = u.id
                LEFT JOIN userlikes ul ON a.id = ul.artwork_id AND ul.is_liked = TRUE
                LEFT JOIN artcomments c ON a.id = c.artwork_id
                LEFT JOIN topics t on a.topic_id = t.id
                WHERE a.id IN (
                    SELECT artwork_id FROM userlikes WHERE user_id = %s AND is_liked = TRUE
                )
                GROUP BY a.id, u.id, t.id
                ORDER BY a.created_at DESC;
            """,
            (curr_user_id, user_id)
        )
        artworks = cur.fetchall()
    return [
        Artwork(
            id=artwork[0],
            title=artwork[1],
            imageUrl=artwork[2],
            createdAt=str(artwork[3]),
            authorId=artwork[4],
            topicId=artwork[5],
            authorIconUrl=artwork[6],
            likes=artwork[7],
            comments=artwork[8],
            isLiked=artwork[9],
            topicText=artwork[10],
            authorName=artwork[11]
        ) for artwork in artworks
    ]

def get_comments(conn: Connection, artwork_id: int) -> list[ArtComment]:
    with conn.cursor() as cur:
        cur.execute(
            """
                SELECT c.id, c.user_id, c.artwork_id, c.text, c.created_at, u.image_url, u.username
                FROM artcomments c LEFT JOIN users u ON c.user_id = u.id
                WHERE c.artwork_id = %s
                ORDER BY c.created_at DESC
            """,
            (artwork_id,)
        )
        comments = cur.fetchall()
    return [
        ArtComment(
            id=comment[0],
            creatorId=comment[1],
            artworkId=comment[2],
            text=comment[3],
            createdAt=str(comment[4]),
            creatorIconUrl=comment[5],
            creatorName=comment[6]
        ) for comment in comments
    ]

def create_comment(conn: Connection, comment: ArtComment) -> ArtComment:
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO artcomments (user_id, artwork_id, text) VALUES (%s, %s, %s) RETURNING id, created_at",
            (comment.creatorId, comment.artworkId, comment.text)
        )
        comment_id, comment_createdAt = cur.fetchone()
        comment.id = comment_id
        comment.createdAt = str(comment_createdAt)
        conn.commit()
    return comment