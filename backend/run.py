import os
import sys
import logging
from logging.handlers import RotatingFileHandler
from dotenv import load_dotenv

# Base directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BASE_DIR)

# Load environment variables
FLASK_ENV = os.getenv("FLASK_ENV", "development")
load_dotenv(os.path.join(BASE_DIR, f".env.{FLASK_ENV}"))

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

log_dir = os.path.join(BASE_DIR, "logs")
os.makedirs(log_dir, exist_ok=True)

file_handler = RotatingFileHandler(
    os.path.join(log_dir, "app.log"),
    maxBytes=10_240_000,
    backupCount=5
)
file_handler.setFormatter(logging.Formatter(
    "%(asctime)s %(levelname)s: %(message)s"
))
logger.addHandler(file_handler)

logger.info(f"Starting Flask app ({FLASK_ENV})")

# Create app
from app import create_app, db
app = create_app()

# Create DB tables ONLY in development
if FLASK_ENV == "development":
    with app.app_context():
        db.create_all()
        logger.info("Development database ready")

# WSGI entry point
application = app

# Development server only
if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000)),
        debug=(FLASK_ENV == "development")
    )