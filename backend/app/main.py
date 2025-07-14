from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import router as api_router

app = FastAPI()

# Allow CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, etc.)
    allow_headers=["*"],  # Allows all headers
)

@app.get("/")
def read_root():
    return {"message": "Hello, World!"}

# Include the API router
app.include_router(api_router)
