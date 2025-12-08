.PHONY: install migrate test run-api run-bot

install:
	pip install -r requirements.txt

migrate:
	alembic revision --autogenerate -m "$(msg)"
	alembic upgrade head

test:
	pytest -v

run-api:
	uvicorn app.main:app --reload --port 4000

run-bot:
	python -m bot.main

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

clean:
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
