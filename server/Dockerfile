FROM python:3.12

WORKDIR /app

COPY ./server/pyproject.toml ./server/poetry.lock* /app/

RUN pip install poetry
RUN poetry config virtualenvs.create false
RUN poetry install

COPY ./server /app

CMD ["uvicorn", "server.api:app", "--host", "0.0.0.0", "--port", "8000"]
