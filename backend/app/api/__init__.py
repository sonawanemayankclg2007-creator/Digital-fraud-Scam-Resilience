from fastapi import APIRouter
from backend.app.api.auth import router as auth_router
from backend.app.api.scam import router as scam_router
from backend.app.api.accounts import router as accounts_router
from backend.app.api.phones import router as phones_router
from backend.app.api.transactions import router as transactions_router
from backend.app.api.networks import router as networks_router
from backend.app.api.reports import router as reports_router
from backend.app.api.alerts import router as alerts_router
from backend.app.api.notifications import router as notifications_router
from backend.app.api.dashboard import router as dashboard_router
from backend.app.api.admin import router as admin_router
from backend.app.api.translate import router as translate_router
from backend.app.api.announcements import router as announcements_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(scam_router)
api_router.include_router(accounts_router)
api_router.include_router(phones_router)
api_router.include_router(transactions_router)
api_router.include_router(networks_router)
api_router.include_router(reports_router)
api_router.include_router(alerts_router)
api_router.include_router(notifications_router)
api_router.include_router(dashboard_router)
api_router.include_router(admin_router)
api_router.include_router(translate_router)
api_router.include_router(announcements_router)

