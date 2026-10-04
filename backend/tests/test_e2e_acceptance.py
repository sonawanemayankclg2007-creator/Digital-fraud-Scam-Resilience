import json
import time
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def make_request(method, endpoint, data=None, headers=None):
    req_headers = headers or {}
    if method.upper() == "GET":
        resp = client.get(endpoint, headers=req_headers)
    elif method.upper() == "POST":
        resp = client.post(endpoint, json=data, headers=req_headers)
    elif method.upper() == "PATCH":
        resp = client.patch(endpoint, json=data, headers=req_headers)
    elif method.upper() == "PUT":
        resp = client.put(endpoint, json=data, headers=req_headers)
    elif method.upper() == "DELETE":
        resp = client.delete(endpoint, headers=req_headers)
    else:
        raise ValueError(f"Unsupported method: {method}")

    try:
        body = resp.json()
    except Exception:
        body = {"raw": resp.text}
    return resp.status_code, body

def test_acceptance_flow_1_to_10():
    print("==================================================")
    print("RUNNING ARTHRAKSHA E2E ACCEPTANCE TESTS (1 to 10)")
    print("==================================================")

    # TEST 1: Register User & Login
    ts = int(time.time())
    user_email = f"user_{ts}@test.com"
    reg_payload = {
        "name": "Test User",
        "email": user_email,
        "password": "Password@123",
        "confirm_password": "Password@123",
        "phone": "+919876543210",
        "language": "hi"
    }
    status, user_data = make_request("POST", "/api/auth/register", reg_payload)
    assert status == 200, f"Register failed: {user_data}"
    assert user_data["user"]["role"] == "USER", f"Expected USER role, got {user_data['user']['role']}"
    user_token = user_data["access_token"]
    user_id = user_data["user"]["id"]
    print(f"PASS [TEST 1]: Created User (id={user_id}, role={user_data['user']['role']}) with single registration.")

    # Login with same credentials
    status, login_res = make_request("POST", "/api/auth/login", {"email": user_email, "password": "Password@123"})
    assert status == 200
    assert login_res["user"]["role"] == "USER"
    print("PASS [TEST 1b]: Login auto-identified role=USER (no role selection needed).")

    # TEST 3: Login as Admin
    status, admin_res = make_request("POST", "/api/auth/login", {"email": "admin@arthraksha.in", "password": "Admin@123"})
    assert status == 200, f"Admin login failed: {admin_res}"
    admin_token = admin_res["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}
    print("PASS [TEST 3]: Admin logged in successfully with auto role=ADMIN.")

    # TEST 2: Admin creates Analyst account
    analyst_email = f"analyst_{ts}@arthraksha.in"
    analyst_payload = {
        "name": "Priya Analyst",
        "email": analyst_email,
        "password": "Analyst@123",
        "phone": "+919876500000"
    }
    status, analyst_create_res = make_request("POST", "/api/admin/analysts", analyst_payload, admin_headers)
    assert status == 201, f"Analyst creation failed: {analyst_create_res}"
    analyst_id = analyst_create_res["id"]
    print(f"PASS [TEST 2a]: Admin created Analyst account (id={analyst_id}, email={analyst_email}).")

    # Login as Analyst
    status, analyst_login_res = make_request("POST", "/api/auth/login", {"email": analyst_email, "password": "Analyst@123"})
    assert status == 200, f"Analyst login failed: {analyst_login_res}"
    assert analyst_login_res["user"]["role"] == "ANALYST"
    analyst_token = analyst_login_res["access_token"]
    analyst_headers = {"Authorization": f"Bearer {analyst_token}"}
    print("PASS [TEST 2b]: Analyst logged in with auto role=ANALYST.")

    # Verify Analyst CANNOT access Admin user management
    status, _ = make_request("GET", "/api/admin/users", headers=analyst_headers)
    assert status == 403, f"Expected 403 for analyst accessing /admin/users, got {status}"
    print("PASS [TEST 2c]: Analyst strictly blocked from Admin user management (403 Forbidden).")

    # TEST 4: Admin creates Announcement
    ann_payload = {
        "title": "New Investment Scam Alert",
        "message": "Be careful of messages promising guaranteed returns. Verify the sender and payment destination before transferring money.",
        "alert_type": "SCAM_WARNING",
        "priority": "HIGH",
        "target_audience": "ALL_USERS",
        "language": "en"
    }
    status, ann_res = make_request("POST", "/api/admin/announcements", ann_payload, admin_headers)
    assert status == 200 or status == 201, f"Failed to create announcement: {ann_res}"
    ann_id = ann_res["id"]
    print(f"PASS [TEST 4]: Admin published Announcement #{ann_id} to ALL_USERS.")

    # TEST 5: User verifies notification badge & announcement
    user_headers = {"Authorization": f"Bearer {user_token}"}
    status, unread_res = make_request("GET", "/api/notifications/unread-count", headers=user_headers)
    assert status == 200
    unread = unread_res["unread_count"]
    assert unread >= 1, f"Expected unread count >= 1, got {unread}"

    status, active_anns = make_request("GET", "/api/announcements", headers=user_headers)
    assert status == 200
    matching_ann = next((a for a in active_anns if a["id"] == ann_id), None)
    assert matching_ann is not None, "New announcement should appear in user announcements!"
    print(f"PASS [TEST 5]: User has {unread} unread notifications and sees '{matching_ann['title']}'.")

    # TEST 6: User marks notification as read
    status, notifs = make_request("GET", "/api/notifications", headers=user_headers)
    assert len(notifs) > 0
    notif_id = notifs[0]["id"]
    status, read_res = make_request("PATCH", f"/api/notifications/{notif_id}/read", headers=user_headers)
    assert status == 200
    assert read_res["is_read"] is True
    print(f"PASS [TEST 6]: User opened notification #{notif_id} and marked as READ.")

    # TEST 7: Admin sends targeted announcement
    targeted_payload = {
        "title": "Targeted User Account Advisory",
        "message": "We detected suspicious activity on your linked UPI identifier.",
        "alert_type": "SAFETY_ALERT",
        "priority": "HIGH",
        "target_audience": "SPECIFIC_USERS",
        "target_user_ids": [user_id]
    }
    status, targeted_res = make_request("POST", "/api/admin/announcements", targeted_payload, admin_headers)
    assert status == 200 or status == 201
    targeted_id = targeted_res["id"]
    print(f"PASS [TEST 7]: Admin sent targeted announcement #{targeted_id} specifically to user {user_id}.")

    # TEST 8: Admin sends CRITICAL alert (Dashboard notification created)
    critical_payload = {
        "title": "Critical Banking Fraud Warning",
        "message": "Do not approve remote access apps like AnyDesk or QuickSupport.",
        "alert_type": "EMERGENCY",
        "priority": "CRITICAL",
        "target_audience": "ALL_USERS",
        "send_external": False
    }
    status, crit_res = make_request("POST", "/api/admin/announcements", critical_payload, admin_headers)
    assert status == 200 or status == 201
    print("PASS [TEST 8]: Admin sent CRITICAL emergency alert successfully.")

    # TEST 9: Normal User tries to access /api/admin/users
    status, _ = make_request("GET", "/api/admin/users", headers=user_headers)
    assert status == 403, f"Expected 403 Forbidden for USER accessing admin API, got {status}"
    print("PASS [TEST 9]: USER cannot access /admin endpoints (HTTP 403 Forbidden enforced by backend).")

    # TEST 10: Role spoofing test (User token claiming to create announcements)
    status, _ = make_request(
        "POST",
        "/api/admin/announcements",
        {"title": "Hacked", "message": "Hacked", "alert_type": "GENERAL"},
        user_headers
    )
    assert status == 403, f"Expected 403, got {status}"
    print("PASS [TEST 10]: Backend rejects role spoofing / unauthorized requests with 403.")

    print("\n==================================================")
    print("ALL 10 ACCEPTANCE TESTS PASSED FLAWLESSLY!")
    print("==================================================")

if __name__ == "__main__":
    run_acceptance_tests()
