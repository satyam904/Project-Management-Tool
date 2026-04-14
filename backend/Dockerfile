FROM python:3.9-slim

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

# Install system dependencies needed for psycopg2 (PostgreSQL)
RUN apt-get update \
    && apt-get install -y --no-install-recommends gcc libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies using production requirements
COPY requirements/ /app/requirements/
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements/production.txt

# Copy the django project
COPY . /app/

# Make the entrypoint executable
RUN chmod +x /app/entrypoint.sh

# Run entrypoint
ENTRYPOINT ["/app/entrypoint.sh"]

# Default command (can be overridden by docker-compose)
CMD ["gunicorn", "core.wsgi:application", "--bind", "0.0.0.0:8000"]
