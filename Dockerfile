FROM node:22-alpine AS frontend-builder

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN VITE_API_BASE_URL=/api npm run build

FROM golang:1.26-alpine AS backend-builder

WORKDIR /app/backend
COPY backend/go.mod ./
RUN go mod download
COPY backend/ ./
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/call-booking .

FROM alpine:3.22

WORKDIR /app
ENV PORT=3000
ENV STATIC_DIR=/app/frontend/dist

COPY --from=backend-builder /app/call-booking /app/call-booking
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

EXPOSE 3000
CMD ["/app/call-booking"]
