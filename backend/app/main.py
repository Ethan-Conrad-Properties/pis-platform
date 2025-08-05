from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from app.api import properties, suites, services, utilities, codes, contacts, edit_history, property_photos


app = FastAPI()
app.mount("/uploads", StaticFiles(directory="static/uploads"), name="uploads")

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

# Include routers
app.include_router(properties.router)
app.include_router(suites.router)
app.include_router(services.router)
app.include_router(utilities.router)
app.include_router(codes.router)
app.include_router(contacts.router)
app.include_router(edit_history.router)
app.include_router(property_photos.router)
