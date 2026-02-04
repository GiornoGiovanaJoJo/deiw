# Build Frontend
FROM node:18-alpine as frontend-build
WORKDIR /app/frontend
COPY inst/package*.json ./
RUN npm install
COPY inst/ ./
RUN npm run build

# Build Backend
FROM python:3.9-slim
WORKDIR /app

# Copy backend requirements
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Copy built frontend to static directory
COPY --from=frontend-build /app/frontend/dist ./static

# Expose port
EXPOSE 8000

# Run application
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
