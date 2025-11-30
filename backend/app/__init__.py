# backend/app/__init__.py

from app.models import Base

# Import all module models so Alembic can discover them
from requisitions import models as requisitions_models
from candidates import models as candidates_models
from interviews import models as interviews_models
from invoices import models as invoices_models
from offers import models as offers_models
from vendors import models as vendors_models
