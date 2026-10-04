# 🛡️ ARTHRAKSHA
### *"Detect. Explain. Warn. Protect."*
**AI-Powered Financial Scam, Fraud & Investor Protection Platform**  
*Built for Hackathon SANGYAN — Track A: Digital Fraud & Scam Resilience*

---

## 📌 Executive Summary
**ARTHRAKSHA** is a privacy-first, Indian public-good fintech security platform designed to help first-time investors, senior citizens, regional language speakers, and Tier-2/Tier-3 internet users **detect, understand, and avoid deceptive financial scams BEFORE money changes hands**.

Unlike traditional banking tools that only freeze accounts after funds have been lost, ARTHRAKSHA intercepts suspicious social-engineering solicitations, fake guaranteed-return claims, phone numbers, and UPI identifiers at the pre-transaction stage.

```
Suspicious Message / UPI ID / Phone / Transaction
                        ↓
                   ARTHRAKSHA
                        ↓
          ┌─────────────┼─────────────┐
          ↓             ↓             ↓
     AI Analysis   Rule Engine   Graph Engine
  (Google Gemini)  (Heuristics)   (NetworkX)
          └─────────────┬─────────────┘
                        ↓
             Explainable Risk Score
                    (0 - 100)
                        ↓
           WHY Flagged? (Evidence)
                        ↓
         Actionable Safety Advisory
                        ↓
           Voice Readout / Translation
         (English / हिन्दी / ગુજરાતી)
                        ↓
          SMS / WhatsApp / Push Alert
                        ↓
        🛡️ Loss Prevented in Real-Time
```

---

## 🎯 Core Problem
Millions of Indian users are targeted daily by:
- **Guaranteed-Return Scams**: Promises of 30-50% monthly returns or "paisa double in 15 days".
- **Social Engineering & Phishing**: Impersonation of SEBI, RBI, tax authorities, or banks with artificial urgency.
- **Mule Account Networks**: Complex multi-hop money routing where victim funds pass through intermediate accounts within minutes.
- **Fake Advisory Groups**: Unregulated Telegram/WhatsApp groups soliciting upfront UPI payments for "jackpot" tips.

---

## 🚀 Key Modules & Capabilities

### 1. Scam Message Checker (AI + Deterministic Heuristics)
- Pastes SMS, WhatsApp, Telegram, or email solicitations.
- Analyzes guaranteed returns, urgency pressure, regulatory impersonation, and payment requests.
- Returns transparent **0-100 Risk Score**, **Warning Signals**, plain-language **Why Flagged** explanation, and preventive recommendations.
- **AI Fallback Guarantee**: Uses Google Gemini API when configured, seamlessly falling back to a deterministic regex engine offline.

### 2. Investment Claim Checker
- Evaluates astronomical return declarations ("Double your money in 15 days", "Govt-approved crypto fund").
- Flags mathematical impossibility, Ponzi structures, and lack of SEBI disclosures.
- Prominent statutory disclaimer: *"Risk assessment only. This is not investment advice."*

### 3. Phone Number Risk Checker
- Checks numbers against the application's consent-based community report registry.
- Displays risk level (Safe, Caution, Suspicious, High Risk), complaints count, and breakdown of investment vs. payment scams.
- Privacy-first: Automatically masks numbers (`+91 98******10`).

### 4. Account & UPI Risk Analyzer
- Evaluates VPAs (e.g. `paytm-invest99@okhdfcbank`) and bank accounts.
- Inspects transaction velocity, fan-in/fan-out ratio, and rapid pass-through fund dispersion.
- Detects intermediate transit mule behavior before transfers are initiated.

### 5. Transaction Risk Analyzer
- Simulates proposed transfers in real-time.
- Checks counterparty velocity, unusual amounts, rapid pass-through, and closed circular laundering cycles.

### 6. Fraud Network Graph Visualization
- Interactive graph powered by **React Flow (`@xyflow/react`)**.
- Directed edges with transaction volume weights.
- Color-coded nodes (Red: High Risk / Mule, Amber: Caution, Green: Safe, Blue: Ego Focal Account).
- Account inspection drawer on click detailing in/out degree, turnover ratio, and connected counterparts.
- Amount filtering and ego-network zoom.

### 7. Fraud Ring & Mule Account Detection (NetworkX)
- Automated clustering of weakly connected components.
- Uncovers multi-tier mule chains funneling funds toward central aggregators.
- Pinpoints **potential network coordinators** using betweenness centrality and transaction volume without making defamatory legal claims.
- Detects circular fund routing cycles ($A \rightarrow B \rightarrow C \rightarrow A$).

### 8. Bharat-First Multilingual & Voice Accessibility
- Seamless UI and warning localization across **English, हिन्दी (Hindi), and ગુજરાતી (Gujarati)**.
- Integrated **Voice Readout (Web Speech API)** allowing elderly or regional users to hear safety warnings aloud.

### 9. Proactive Multi-Channel Alerts
- Simulated DLT-compliant **SMS** (MSG91).
- Template-driven **WhatsApp alerts** (MSG91 WhatsApp API).
- Mobile push notifications via **Firebase Cloud Messaging (FCM)**.
- Transactional security emails via **Resend**.
- Full delivery audit stream with simulated provider response payloads.

### 10. Community Reporting & Admin Control Room
- Citizen reporting of suspicious numbers, accounts, messages, and evidence.
- Admin moderation queue: Review, Verify, Reject, or mark Under Review.
- System audit log tracking all user logins, risk assessments, and moderation actions.

---

## 🔒 Privacy-by-Design & Guardrails

| Guardrail Principle | ARTHRAKSHA Enforcement |
| :--- | :--- |
| **Zero Credential Retention** | Passwords, OTPs, PINs, and CVVs are strictly scrubbed in memory. The system never prompts for or stores banking credentials. |
| **No Background Scraping** | Never snoops on background SMS or private WhatsApp messages; only user-submitted text is inspected. |
| **Privacy Masking** | PII and account identifiers are masked (`98******10`, `in******99@okhdfcbank`). |
| **No Stock / Advisory Signals** | Does NOT recommend stocks, buy/sell calls, or promote brokers. |
| **Responsible Terminology** | Uses *"potentially suspicious"*, *"risk indicators detected"*, and *"potential coordinating account"* instead of declaring legal guilt. |

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + Dark Slate Fintech & Cybersecurity Design System
- **Icons**: Lucide React
- **Charts**: Recharts (Area, Bar, Pie)
- **Graph Visualizer**: React Flow (`@xyflow/react`)
- **Localization**: i18next + react-i18next
- **Voice**: Web Speech API (TTS)
- **HTTP Client**: Axios with JWT Interceptors

### Backend
- **Framework**: FastAPI (Python 3.11+)
- **ORM & Database**: SQLAlchemy 2.0 with MySQL 8.0 & dynamic SQLite fallback
- **Graph Analytics**: NetworkX (DiGraph, cycle detection, weakly connected components)
- **Data Science**: Pandas, NumPy
- **Security**: bcrypt password hashing, PyJWT tokens, CORS, Rate limiting
- **AI Engine**: Google Gemini API (`GEMINI_MODEL`, `GEMINI_API_KEY`) + deterministic regex fallback engine
- **Notifications**: MSG91 (DLT SMS & WhatsApp), Firebase FCM, Resend Email

---

## ⚡ Primary Demo Scenario (15-Step Evaluator Script)

To demonstrate the full end-to-end resilience lifecycle:

1. **Step 1**: Open the app and click **"Primary Demo Scenario"** in the top bar.
2. **Step 2**: Evaluator views incoming message: *"Congratulations! Invest ₹10,000 today and receive guaranteed 40% returns. Limited slots. Send payment immediately."*
3. **Step 3**: System detects: Guaranteed returns, false urgency, investment solicitation, upfront payment.
4. **Step 4**: Computes **HIGH RISK (92/100)** with clear explainability evidence.
5. **Step 5**: Queries sender phone `+919876543210` $\rightarrow$ Profile flagged as **SUSPICIOUS (8 community complaints)**.
6. **Step 6**: Queries recipient UPI `paytm-invest99@okhdfcbank` $\rightarrow$ Evaluated as **HIGH RISK (Mule transit detected)**.
7. **Step 7**: Opens **Fraud Network Graph** $\rightarrow$ Traces multi-hop flow: Victims $\rightarrow$ Target Mule $\rightarrow$ Intermediate Mules $\rightarrow$ Aggregator.
8. **Step 8**: Highlights **rapid pass-through behavior** (95% funds routed out within 18 minutes).
9. **Step 9**: Discovers **Coordinated Ring #01** and detects closed circular flow cycle.
10. **Step 10**: Generates plain-language preventive advisory.
11. **Step 11**: Translates advisory instantly into **Hindi & Gujarati**.
12. **Step 12**: Simulates DLT-compliant SMS & WhatsApp alert dispatching.
13. **Step 13**: Checks notification audit log with delivery confirmation.
14. **Step 14**: Inspects Admin Dashboard moderation queue.
15. **Step 15**: Demonstrates that potential fraud is averted **BEFORE money leaves the victim's account**.

---

## 🔑 Demo Test Credentials

| Role | Email | Password | Preloaded Access |
| :--- | :--- | :--- | :--- |
| **User** | `investor@arthraksha.in` | `User@123` | Check scams, accounts, phones, submit complaints, view alerts |
| **Analyst** | `analyst@arthraksha.in` | `Analyst@123` | Forensic query studio, cluster inspection, degree metrics |
| **Admin** | `admin@arthraksha.in` | `Admin@123` | Report moderation (Verify/Reject), account oversight, audit trail |

*Note: You can also switch roles on the fly using the Role Switcher in the top navigation bar.*

---

## ⚙️ Environment Configuration

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

| Variable | Description | Default |
| :--- | :--- | :--- |
| `DATABASE_URL` | MySQL connection string (falls back to SQLite automatically) | `sqlite:///./arthraksha.db` |
| `JWT_SECRET` | Secret key for JWT signing | Preconfigured for hackathon |
| `GEMINI_API_KEY` | Google Gemini API key (optional; deterministic fallback if blank) | Blank |
| `GEMINI_MODEL` | Gemini Flash model identifier | `gemini-1.5-flash` |
| `DEMO_MODE` | Simulates real-world SMS/WhatsApp/Push without billing | `true` |
| `MSG91_AUTH_KEY` | MSG91 API key for real SMS | Optional |
| `FRONTEND_URL` | Allowed CORS origin | `http://localhost:5173` |

---

## 🚀 Running Locally

### Prerequisites
- Python 3.10+
- Node.js 18+ & npm

### 1. Start the FastAPI Backend
```bash
# From workspace root
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```
- Interactive Swagger API Documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Health check: [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

### 2. Start the React Frontend
```bash
cd frontend
npm run dev
```
- Access the web interface at: [http://127.0.0.1:5173](http://127.0.0.1:5173)

---

## 🐳 Docker Deployment

To launch the complete production stack (MySQL 8.0, Backend, Frontend) with one command:
```bash
docker-compose up --build
```
- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend: [http://localhost:8000](http://localhost:8000)
- MySQL: `localhost:3306`

---

## 🧪 Automated Testing
Run the backend pytest suite:
```bash
python -m pytest backend/tests/test_all.py -v
```
**Test Coverage Includes:**
- Bcrypt password hashing & verification
- JWT token lifecycle
- Privacy data masking & OTP scrubbing
- Deterministic risk engine scoring & thresholds
- NetworkX directed cycle detection & mule heuristics
- AI fallback scam message analysis
- Investment claim evaluation

---

## 🔮 Future Roadmap
- **NPCI & Bharat BillPay Integration**: Direct integration with UPI transaction pre-validation endpoints.
- **Telecom Carrier Spam Feed**: Telco-level carrier metadata for real-time SIM swap and spoofing detection.
- **Regional Voice Assistant**: Native voice-in / voice-out conversational AI in 12 Indian languages.
- **Federated Machine Learning**: Privacy-preserving collaborative fraud ring model updates across banks.

---

**ARTHRAKSHA** — *Detect. Explain. Warn. Protect.*  
*Hackathon SANGYAN Track A: Digital Fraud & Scam Resilience*
