# Discord Bot with FastAPI Backend

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Start PostgreSQL and Redis:
```bash
docker-compose up -d
```

3. Run migrations:
```bash
alembic revision --autogenerate -m "initial"
alembic upgrade head
```

4. Start API:
```bash
uvicorn app.main:app --reload --port 4000
```

5. Start bot:
```bash
python -m bot.main
```

## API Docs
http://localhost:4000/docs
