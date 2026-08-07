FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["sh", "-c", "\
  if [ \"$DEBUG\" = 'False' ] && [ -z \"$SECRET_KEY\" ]; then \
    echo 'FATAL: SECRET_KEY is required in production'; exit 1; \
  fi; \
  gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 2 --timeout 120"]
