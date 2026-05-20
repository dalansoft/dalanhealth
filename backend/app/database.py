from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.config import settings


class Database:
    def __init__(self) -> None:
        self.client: AsyncIOMotorClient | None = None
        self.db: AsyncIOMotorDatabase | None = None

    async def connect(self) -> None:
        self.client = AsyncIOMotorClient(settings.mongodb_uri)
        self.db = self.client[settings.mongodb_db]
        await self._ensure_indexes()

    async def disconnect(self) -> None:
        if self.client:
            self.client.close()

    async def ping(self) -> bool:
        try:
            if self.client is None:
                return False
            await self.client.admin.command("ping")
            return True
        except Exception:
            return False

    async def _ensure_indexes(self) -> None:
        if self.db is None:
            return
        await self.db.users.create_index("mobile", unique=False)
        await self.db.users.create_index("email", unique=False, sparse=True)
        await self.db.clinics.create_index("name")
        await self.db.patients.create_index([("clinic_id", 1), ("mobile", 1)])
        await self.db.queue.create_index([("clinic_id", 1), ("date_key", 1), ("token", 1)])
        await self.db.queue.create_index([("clinic_id", 1), ("date_key", 1), ("status", 1)])
        await self.db.bookings.create_index([("clinic_id", 1), ("created_at", -1)])
        await self.db.transactions.create_index([("clinic_id", 1), ("created_at", -1)])
        await self.db.notifications.create_index([("user_id", 1), ("created_at", -1)])

    def coll(self, name: str):
        if self.db is None:
            raise RuntimeError("Database not connected")
        return self.db[name]


db = Database()
