import requests
from flask import jsonify

ORCID_ID = "0000-0003-2058-3648"
BASE_URL = f"https://pub.orcid.org/v3.0/{ORCID_ID}"
HEADERS = {"Accept": "application/json"}

def get_works():
   try:
      url = f"{BASE_URL}/works"
      
   except Exception as e:
      raise e