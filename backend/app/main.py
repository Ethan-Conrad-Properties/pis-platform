from fastapi import FastAPI, Request
from fastapi.responses import ORJSONResponse
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.api import (
    properties, suites, services, utilities,
    codes, permits, contacts, edit_history, property_photos,
)
import time
import sentry_sdk

# -------------------------------------------------------------------
# FastAPI Application Entry Point
# - Sets up middlewares (CORS, GZip, static file serving, timing)
# - Mounts uploads directory for property photos
# - Includes all API routers
# -------------------------------------------------------------------

sentry_sdk.init(
    dsn="https://d4b1ff890486f6098433ce8e56ab8ac4@o4509952283049984.ingest.us.sentry.io/4509952406126592",
    send_default_pii=True, # captures user data, IPs, request headers
)

# Use ORJSON for fast JSON responses
app = FastAPI(default_response_class=ORJSONResponse)

# Serve uploaded files from /uploads
app.mount("/uploads", StaticFiles(directory="static/uploads"), name="uploads")

# Enable GZip compression for large responses
app.add_middleware(GZipMiddleware, minimum_size=512)

# Allow CORS for frontend apps
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://pis-platform.vercel.app",  # production frontend
        "http://localhost:3000",            # local dev frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  # Allow all headers
)


@app.get("/")
def read_root():
    """
    Health check endpoint.
    Returns a simple status message to confirm the API is running.
    Useful for uptime checks and quick debugging.
    """
    return {"status": "ok", "message": "PIS Platform API is running"}


@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """
    Middleware that adds a header with request processing time.

    Args:
        request (Request): Incoming HTTP request.
        call_next (function): Executes the next middleware/route.

    Returns:
        Response: HTTP response with `X-Process-Time-ms` header.
    """
    t0 = time.perf_counter()
    resp = await call_next(request)
    resp.headers["X-Process-Time-ms"] = str(int((time.perf_counter() - t0) * 1000))
    return resp


# -------------------------------------------------------------------
# Include API Routers
# Each router handles a specific entity (properties, suites, etc.).
# -------------------------------------------------------------------
app.include_router(properties.router)
app.include_router(suites.router)
app.include_router(services.router)
app.include_router(utilities.router)
app.include_router(codes.router)
app.include_router(permits.router)
app.include_router(contacts.router)
app.include_router(edit_history.router)
app.include_router(property_photos.router)
