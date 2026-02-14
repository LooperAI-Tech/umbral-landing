import asyncio
from app.core.database import engine
from sqlalchemy import text


async def check():
    async with engine.connect() as conn:
        result = await conn.execute(text("SELECT id, email, first_name FROM users"))
        rows = result.fetchall()
        if rows:
            for r in rows:
                print(f"User: {r[0]} | {r[1]} | {r[2]}")
        else:
            print("NO USERS IN DATABASE")


asyncio.run(check())
