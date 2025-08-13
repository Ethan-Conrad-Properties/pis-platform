from fastapi import FastAPI, Request
from fastapi.responses import ORJSONResponse
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.api import properties, suites, services, utilities, codes, contacts, edit_history, property_photos
import time


app = FastAPI(default_response_class=ORJSONResponse)
app.mount("/uploads", StaticFiles(directory="static/uploads"), name="uploads")
app.add_middleware(GZipMiddleware, minimum_size=512)

# Allow CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://pis-platform.vercel.app",
        "http://localhost:3000",
    ],  
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

@app.get("/")
def read_root():
    return {"message": "Hello, World!"}

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    t0 = time.perf_counter()
    resp = await call_next(request)
    resp.headers["X-Process-Time-ms"] = str(int((time.perf_counter() - t0)*1000))
    return resp

# Include routers
app.include_router(properties.router)
app.include_router(suites.router)
app.include_router(services.router)
app.include_router(utilities.router)
app.include_router(codes.router)
app.include_router(contacts.router)
app.include_router(edit_history.router)
app.include_router(property_photos.router)
