from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.Course import Course
from app.models.User import User
from app.models.Quiz import Quiz
from app.models.QuizMark import QuizMark
from app.services.utils import admin_required
import requests

ORCID_ID = "0000-0003-2058-3648"
BASE_URL = f"https://pub.orcid.org/v3.0/{ORCID_ID}"
HEADERS = {"Accept": "application/json"}

about_bp = Blueprint('about', __name__)

def safe_get(d, *keys):
    """Safely get nested keys from a dict."""
    for key in keys:
        if d is None:
            return None
        d = d.get(key)
    return d

@about_bp.route("/orcid/researches", methods=["GET"])
def get_works():
    url = f"{BASE_URL}/works"
    response = requests.get(url, headers=HEADERS)

    if response.status_code != 200:
        return jsonify({
            "success": False,
            "error": "Failed to fetch researches",
            "status": response.status_code,
        })

    data = response.json()
    works = []

    for group in data.get("group", []):
        summary = group.get("work-summary", [{}])[0]  # fallback empty dict

        works.append({
            "put_code": summary.get("put-code"),
            "title": safe_get(summary, "title", "title", "value") or "No title",
            "type": summary.get("type") or "Unknown",
            "year": safe_get(summary, "publication-date", "year", "value"),
            "journal": safe_get(summary, "journal-title", "value"),
            "doi": next(
                (
                    ext.get("external-id-value")
                    for ext in safe_get(summary, "external-ids", "external-id") or []
                    if ext.get("external-id-type") == "doi"
                ),
                None
            ),
            "url": safe_get(summary, "url", "value")
        })

    return jsonify({
        "success": True,
        "researches": works,
    })

@about_bp.route("/orcid/researches/<put_code>", methods=["GET"])
def get_single_work(put_code):
    url = f"{BASE_URL}/work/{put_code}"
    response = requests.get(url, headers=HEADERS)

    if response.status_code != 200:
        return jsonify({"error": "Failed to fetch work", "status": response.status_code})
    
    return jsonify(response.json())