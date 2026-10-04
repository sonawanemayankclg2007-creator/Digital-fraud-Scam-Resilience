from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from backend.app.models.user import User
from backend.app.models.account import Account
from backend.app.models.transaction import Transaction
from backend.app.models.phone_report import PhoneReport
from backend.app.models.fraud_report import FraudReport
from backend.app.models.scam_message import ScamMessage
from backend.app.models.fraud_network import FraudNetwork
from backend.app.models.alert import Alert
from backend.app.models.notification import Notification
from backend.app.models.announcement import AdminAnnouncement
from backend.app.core.security import hash_password

def seed_initial_demo_data(db: Session):
    # Check if already seeded
    if db.query(User).first():
        return

    print("[ARTHRAKSHA SEED] Seeding comprehensive Bharat-first demo data...")

    now = datetime.now(timezone.utc)

    # 1. Seed Users (Admin, Analyst, Standard Users)
    users = [
        User(
            name="ArthRaksha Admin",
            email="admin@arthraksha.in",
            phone="+919999000001",
            password_hash=hash_password("Admin@123"),
            role="ADMIN",
            language="en",
            notification_consent=True,
            is_active=True,
            created_at=now
        ),
        User(
            name="Senior Fraud Analyst",
            email="analyst@arthraksha.in",
            phone="+919999000002",
            password_hash=hash_password("Analyst@123"),
            role="ANALYST",
            language="en",
            notification_consent=True,
            is_active=True,
            created_at=now
        ),
        User(
            name="Ramesh Sharma",
            email="investor@arthraksha.in",
            phone="+919876543210",
            password_hash=hash_password("User@123"),
            role="USER",
            language="hi",
            notification_consent=True,
            is_active=True,
            created_at=now
        ),
        User(
            name="Bhavik Mehta",
            email="bhavik@arthraksha.in",
            phone="+919825098765",
            password_hash=hash_password("User@123"),
            role="USER",
            language="gu",
            notification_consent=True,
            is_active=True,
            created_at=now
        )
    ]
    db.add_all(users)
    db.commit()

    # 2. Seed Accounts (Normal, Transit Mules, High Risk Target, Ring Coordinator)
    accounts = [
        # Primary Demo target
        Account(
            account_identifier="paytm-invest99@okhdfcbank",
            account_type="UPI",
            risk_score=92.0,
            risk_level="HIGH_RISK",
            status="FLAGGED",
            created_at=now - timedelta(days=10)
        ),
        # Intermediate Mules
        Account(
            account_identifier="transit_mule_1@axis",
            account_type="UPI",
            risk_score=85.0,
            risk_level="HIGH_RISK",
            status="UNDER_MONITORING",
            created_at=now - timedelta(days=8)
        ),
        Account(
            account_identifier="layering_hub_2@kotak",
            account_type="UPI",
            risk_score=88.0,
            risk_level="HIGH_RISK",
            status="UNDER_MONITORING",
            created_at=now - timedelta(days=6)
        ),
        Account(
            account_identifier="pass_through_mule_3@paytm",
            account_type="UPI",
            risk_score=82.0,
            risk_level="HIGH_RISK",
            status="FLAGGED",
            created_at=now - timedelta(days=5)
        ),
        # Ring Coordinator / Aggregator
        Account(
            account_identifier="crypto_aggregator_x@ybl",
            account_type="UPI",
            risk_score=96.0,
            risk_level="HIGH_RISK",
            status="FROZEN",
            created_at=now - timedelta(days=12)
        ),
        # Circular Ring Accounts
        Account(
            account_identifier="circle_layer_a@sbi",
            account_type="UPI",
            risk_score=78.0,
            risk_level="SUSPICIOUS",
            status="FLAGGED",
            created_at=now - timedelta(days=15)
        ),
        Account(
            account_identifier="circle_layer_b@icici",
            account_type="UPI",
            risk_score=75.0,
            risk_level="SUSPICIOUS",
            status="FLAGGED",
            created_at=now - timedelta(days=15)
        ),
        Account(
            account_identifier="circle_layer_c@pnb",
            account_type="UPI",
            risk_score=79.0,
            risk_level="SUSPICIOUS",
            status="FLAGGED",
            created_at=now - timedelta(days=15)
        ),
        # Legitimate Normal Accounts
        Account(
            account_identifier="ramesh.investor@okhdfcbank",
            account_type="UPI",
            risk_score=12.0,
            risk_level="SAFE",
            status="ACTIVE",
            created_at=now - timedelta(days=60)
        ),
        Account(
            account_identifier="priya.patel@icici",
            account_type="UPI",
            risk_score=15.0,
            risk_level="SAFE",
            status="ACTIVE",
            created_at=now - timedelta(days=45)
        ),
        Account(
            account_identifier="kavita.store@sbi",
            account_type="UPI",
            risk_score=18.0,
            risk_level="SAFE",
            status="ACTIVE",
            created_at=now - timedelta(days=30)
        )
    ]
    db.add_all(accounts)
    db.commit()

    # 3. Seed Transactions exhibiting Mule Layering, Rapid Pass-Through & Circular Cycles
    transactions = [
        # Normal baseline transfers
        Transaction(
            sender_account="ramesh.investor@okhdfcbank",
            receiver_account="kavita.store@sbi",
            amount=1200.0,
            timestamp=now - timedelta(days=2),
            status="COMPLETED",
            risk_score=10.0
        ),
        Transaction(
            sender_account="priya.patel@icici",
            receiver_account="kavita.store@sbi",
            amount=850.0,
            timestamp=now - timedelta(days=1),
            status="COMPLETED",
            risk_score=12.0
        ),

        # PRIMARY DEMO FRAUD RING (Victims -> Target Account -> Intermediate Mules -> Aggregator)
        # Victims deposit into target account
        Transaction(
            sender_account="victim_991@sbi",
            receiver_account="paytm-invest99@okhdfcbank",
            amount=10000.0,
            timestamp=now - timedelta(hours=5),
            status="COMPLETED",
            risk_score=75.0
        ),
        Transaction(
            sender_account="victim_992@icici",
            receiver_account="paytm-invest99@okhdfcbank",
            amount=25000.0,
            timestamp=now - timedelta(hours=4),
            status="COMPLETED",
            risk_score=80.0
        ),
        Transaction(
            sender_account="victim_993@axis",
            receiver_account="paytm-invest99@okhdfcbank",
            amount=15000.0,
            timestamp=now - timedelta(hours=3),
            status="COMPLETED",
            risk_score=78.0
        ),

        # Rapid pass-through: Target immediately forwards 95% of funds to intermediate mules
        Transaction(
            sender_account="paytm-invest99@okhdfcbank",
            receiver_account="transit_mule_1@axis",
            amount=24500.0,
            timestamp=now - timedelta(hours=3, minutes=10),
            status="COMPLETED",
            risk_score=88.0
        ),
        Transaction(
            sender_account="paytm-invest99@okhdfcbank",
            receiver_account="layering_hub_2@kotak",
            amount=23000.0,
            timestamp=now - timedelta(hours=2, minutes=50),
            status="COMPLETED",
            risk_score=90.0
        ),

        # Second hop: Mules forward to aggregator controller
        Transaction(
            sender_account="transit_mule_1@axis",
            receiver_account="crypto_aggregator_x@ybl",
            amount=24000.0,
            timestamp=now - timedelta(hours=2, minutes=20),
            status="COMPLETED",
            risk_score=94.0
        ),
        Transaction(
            sender_account="layering_hub_2@kotak",
            receiver_account="pass_through_mule_3@paytm",
            amount=11500.0,
            timestamp=now - timedelta(hours=1, minutes=45),
            status="COMPLETED",
            risk_score=85.0
        ),
        Transaction(
            sender_account="pass_through_mule_3@paytm",
            receiver_account="crypto_aggregator_x@ybl",
            amount=11200.0,
            timestamp=now - timedelta(hours=1, minutes=10),
            status="COMPLETED",
            risk_score=95.0
        ),

        # CIRCULAR FUND FLOW CYCLE (circle_layer_a -> circle_layer_b -> circle_layer_c -> circle_layer_a)
        Transaction(
            sender_account="circle_layer_a@sbi",
            receiver_account="circle_layer_b@icici",
            amount=50000.0,
            timestamp=now - timedelta(hours=6),
            status="COMPLETED",
            risk_score=85.0
        ),
        Transaction(
            sender_account="circle_layer_b@icici",
            receiver_account="circle_layer_c@pnb",
            amount=49500.0,
            timestamp=now - timedelta(hours=5),
            status="COMPLETED",
            risk_score=87.0
        ),
        Transaction(
            sender_account="circle_layer_c@pnb",
            receiver_account="circle_layer_a@sbi",
            amount=49000.0,
            timestamp=now - timedelta(hours=4),
            status="COMPLETED",
            risk_score=92.0
        )
    ]
    db.add_all(transactions)
    db.commit()

    # 4. Seed Phone Reports (Matches Primary Demo Scenario + Indian Context)
    phone_reports = [
        PhoneReport(
            phone_number="+919876543210",
            report_type="INVESTMENT_SCAM",
            description="Sender offered guaranteed 40% returns on ₹10,000 transfer, pressured to pay immediately via UPI.",
            report_count=8,
            risk_score=88.0,
            verified=True,
            created_at=now - timedelta(days=3)
        ),
        PhoneReport(
            phone_number="+919820011223",
            report_type="INVESTMENT_SCAM",
            description="Claiming to be SEBI registered analyst giving sure-shot jackpot stock tips in Telegram group.",
            report_count=5,
            risk_score=78.0,
            verified=True,
            created_at=now - timedelta(days=7)
        ),
        PhoneReport(
            phone_number="+919711223344",
            report_type="PHISHING",
            description="Electricity bill disconnection warning with malicious APK download link.",
            report_count=12,
            risk_score=94.0,
            verified=True,
            created_at=now - timedelta(days=1)
        )
    ]
    db.add_all(phone_reports)
    db.commit()

    # 5. Seed Community Fraud Reports
    fraud_reports = [
        FraudReport(
            reporter_id=3,
            account_id="paytm-invest99@okhdfcbank",
            phone_number="+919876543210",
            report_type="INVESTMENT_SCAM",
            description="Sent WhatsApp message claiming 40% guaranteed returns within 24 hours. Asked to pay to paytm-invest99@okhdfcbank.",
            evidence="WhatsApp chat screenshot claiming SEBI VIP Club registration.",
            status="VERIFIED",
            created_at=now - timedelta(days=2)
        ),
        FraudReport(
            reporter_id=4,
            account_id="crypto_aggregator_x@ybl",
            phone_number="+919876543210",
            report_type="ACCOUNT",
            description="Received money from unknown UPI and forwarded instantly. Suspicious layering hub.",
            evidence="Bank statement showing rapid pass-through entries.",
            status="UNDER_REVIEW",
            created_at=now - timedelta(days=1)
        ),
        FraudReport(
            reporter_id=None,
            account_id="circle_layer_a@sbi",
            phone_number="+919820011223",
            report_type="INVESTMENT_SCAM",
            description="Telegram VIP channel operator demanded upfront fees for guaranteed intraday signals.",
            evidence="Telegram channel link @SuperGainsVIP.",
            status="PENDING",
            created_at=now - timedelta(hours=6)
        )
    ]
    db.add_all(fraud_reports)
    db.commit()

    # 6. Seed Scam Messages (English, Hindi, Gujarati)
    scam_messages = [
        ScamMessage(
            user_id=3,
            message_text=(
                "Congratulations! You have been selected for an exclusive investment opportunity. "
                "Invest ₹10,000 today and receive guaranteed 40% returns. "
                "Limited slots available. Send payment immediately."
            ),
            language="en",
            scam_type="Investment Scam",
            risk_score=92.0,
            risk_level="HIGH_RISK",
            ai_explanation="Flagged for guaranteed return claim, artificial urgency, and immediate payment solicitation.",
            created_at=now - timedelta(hours=4)
        ),
        ScamMessage(
            user_id=3,
            message_text=(
                "नमस्ते! आपको विशेष शेयर बाजार निवेश योजना के लिए चुना गया है। "
                "₹5,000 जमा करें और 15 दिनों में ₹15,000 गारंटीड रिटर्न पाएं। "
                "केवल 3 सीटें बाकी हैं। तुरंत भुगतान करें।"
            ),
            language="hi",
            scam_type="Investment Scam",
            risk_score=94.0,
            risk_level="HIGH_RISK",
            ai_explanation="गारंटीड रिटर्न, झूठी तात्कालिकता और असुरक्षित यूपीआई भुगतान मांग के कारण उच्च जोखिम के रूप में चिह्नित किया गया।",
            created_at=now - timedelta(hours=3)
        ),
        ScamMessage(
            user_id=4,
            message_text=(
                "અભિનંદન! સરકારી માન્યતા પ્રાપ્ત રોકાણ યોજના. દર મહિને 35% નિશ્ચિત નફો. "
                "આજે જ ₹10,000 મોકલો. ખાતા નંબર: paytm-invest99@okhdfcbank."
            ),
            language="gu",
            scam_type="Investment Scam",
            risk_score=90.0,
            risk_level="HIGH_RISK",
            ai_explanation="સરકારી મંજૂરીનો ખોટો દાવો અને અવાસ્તવિક નિશ્ચિત નફાનું વચન આપીને નાણાં પડાવવાની યુક્તિ.",
            created_at=now - timedelta(hours=2)
        )
    ]
    db.add_all(scam_messages)
    db.commit()

    # 7. Seed Fraud Network
    fraud_networks = [
        FraudNetwork(
            network_name="Coordinated Layering Ring #01",
            risk_score=91.0,
            account_count=17,
            suspicious_account_count=9,
            description="Multi-tier mule pass-through cluster funneling victim funds through intermediate accounts towards aggregator crypto_aggregator_x@ybl.",
            created_at=now - timedelta(days=5)
        )
    ]
    db.add_all(fraud_networks)
    db.commit()

    # 8. Seed Safety Alerts
    alerts = [
        Alert(
            user_id=3,
            risk_score=92.0,
            alert_type="SCAM_MESSAGE",
            message="High risk investment scam detected: 'Invest ₹10,000 today and receive guaranteed 40% returns'.",
            status="ACTIVE",
            created_at=now - timedelta(hours=4)
        ),
        Alert(
            user_id=3,
            risk_score=88.0,
            alert_type="ACCOUNT_RISK",
            message="Beneficiary paytm-invest99@okhdfcbank flagged with rapid pass-through and mule behavior.",
            status="ACTIVE",
            created_at=now - timedelta(hours=3)
        )
    ]
    db.add_all(alerts)
    db.commit()

    # 9. Seed Initial Notifications
    notifications = [
        Notification(
            user_id=3,
            channel="SMS",
            recipient="+919876543210",
            title="Suspicious Activity Advisory",
            message=(
                "ArthRaksha Alert: Potentially suspicious financial activity was detected. "
                "Do not transfer money or share OTP/PIN/passwords until you independently verify the recipient. "
                "Check your ArthRaksha dashboard for details."
            ),
            notification_type="SAFETY_ALERT",
            priority="HIGH",
            is_read=False,
            status="SIMULATED_DEMO",
            provider_response='{"provider":"MSG91_SMS","dlt_template_id":"DLT_ARTHRAKSHA_ALERT_01","delivery_status":"DELIVERED"}',
            sent_at=now - timedelta(hours=3)
        ),
        Notification(
            user_id=3,
            channel="WHATSAPP",
            recipient="+919876543210",
            title="High Risk Network Warning",
            message=(
                "⚠️ ARTHRAKSHA ALERT\n\nPotentially suspicious financial activity detected.\n\n"
                "Risk: HIGH\nReason: Multiple suspicious network signals were detected.\n"
                "Recommended: Do not transfer money until independently verified.\n\n"
                "🛡️ Stay alert. Check your ArthRaksha security dashboard for full details."
            ),
            notification_type="SAFETY_ALERT",
            priority="HIGH",
            is_read=False,
            status="SIMULATED_DEMO",
            provider_response='{"provider":"MSG91_WHATSAPP","delivery_status":"READ"}',
            sent_at=now - timedelta(hours=2)
        )
    ]
    db.add_all(notifications)
    db.commit()

    # 10. Seed Admin Announcements (Shown on User Dashboard)
    announcements = [
        AdminAnnouncement(
            title="New Investment Scam Alert",
            message="Users are advised to be cautious of messages promising guaranteed 40% returns. Verify the sender and payment account before transferring money.",
            alert_type="SCAM_WARNING",
            priority="HIGH",
            target_type="ALL_USERS",
            created_by=1,
            language="en",
            is_active=True,
            created_at=now - timedelta(hours=1)
        ),
        AdminAnnouncement(
            title="Safety Advisory: Never Share UPI PIN to Receive Money",
            message="Remember: You only enter your UPI PIN to SEND money or check balance. You NEVER need to enter your PIN to receive funds.",
            alert_type="SAFETY_ALERT",
            priority="MEDIUM",
            target_type="ALL_USERS",
            created_by=1,
            language="en",
            is_active=True,
            created_at=now - timedelta(hours=5)
        )
    ]
    db.add_all(announcements)
    db.commit()

    # Seed User Dashboard Notification linked to the first announcement
    db.add(Notification(
        user_id=3,
        announcement_id=announcements[0].id,
        channel="DASHBOARD",
        recipient="3",
        title=announcements[0].title,
        message=announcements[0].message,
        notification_type=announcements[0].alert_type,
        priority=announcements[0].priority,
        is_read=False,
        status="DELIVERED",
        sent_at=now - timedelta(minutes=45)
    ))
    db.commit()

    print("[ARTHRAKSHA SEED] Successfully seeded initial demo data!")

