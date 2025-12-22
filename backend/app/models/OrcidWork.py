from app.services.extenstions import db
from sqlalchemy import JSON
from datetime import datetime

class OrcidWork(db.Model):
   __tablename__ = "orcid_works"

   research_id = db.Column(db.Integer, primary_key=True)
   put_code = db.Column(db.Integer, unique=True, nullable=False)

   title = db.Column(db.String(512), nullable=False)
   work_type = db.Column(db.String(100), nullable=False)
   publication_year = db.Column(db.Integer)

   doi = db.Column(db.String(255))
   url = db.Column(db.String(512))

   contributors = db.Column(JSON, nullable=True)