# ThreatLyst

**AI-Assisted Security Operations, Threat Detection, and Investigation Platform**

ThreatLyst is a full-stack cybersecurity platform designed to support Security Operations Center (SOC) workflows through a combination of deterministic detection logic, machine learning, explainable analysis, incident workflows, threat intelligence, and operational security monitoring.

The project brings together AI, cybersecurity engineering, SOC operations, threat detection, and investigation workflows in a single web platform.

---

## Live Demo

**Platform:** https://threatlyst.com

### Demo Analyst Account

- **Username:** `demo_analyst`
- **Password:** `[DEMO PASSWORD HERE]`

The demo account is intentionally restricted to Analyst-level permissions and is intended only for exploring the interface and demonstration workflows.

Administrative functions and production-sensitive operations are not available through the public demo account.

---

## Project Overview

Modern SOC teams often need to analyze large volumes of security events, identify suspicious activity, prioritize alerts, investigate incidents, correlate indicators, and understand attack behavior as quickly as possible.

ThreatLyst was developed to explore how AI and machine learning can augment traditional SOC workflows.

Rather than producing only an automated AI verdict, ThreatLyst is designed to provide analysts with supporting context, risk information, indicators, explanations, and operational workflows that can assist human decision-making.

ThreatLyst V1 combines:

- Rule-based security detection
- Machine-learning-assisted anomaly detection
- Security event analysis
- Risk scoring
- MITRE ATT&CK context
- Alert management
- Incident investigation
- Threat intelligence
- Security reporting
- Operational monitoring
- Secure authentication and role-based access control

---

## ThreatLyst V1

ThreatLyst V1 establishes the core platform architecture and SOC workflow.

### Security Event Analysis

Security events can be submitted to the platform for analysis.

ThreatLyst evaluates events using a hybrid approach consisting of:

- Deterministic security rules
- Machine learning
- Risk scoring
- Security indicators
- Explainable findings
- Attack context

The goal is to help analysts understand why an event may be suspicious rather than simply returning a classification.

---

## Hybrid Detection Engine

ThreatLyst combines traditional detection logic with machine learning.

### Rule-Based Detection

Deterministic rules evaluate known security characteristics such as:

- Event severity
- Suspicious event types
- Authentication failures
- Brute-force activity
- Malware-related activity
- Source IP indicators
- User-related indicators
- Host-related indicators

### Machine Learning

ThreatLyst currently uses an **Isolation Forest** model for anomaly detection.

The ML layer evaluates structured security-event features and assists in identifying unusual or potentially suspicious activity.

The final analysis combines rule-based and ML-derived signals to provide a more informative security assessment.

---

## Explainable Analysis

ThreatLyst is designed around analyst-assisted decision making.

Analysis output can include:

- Security verdict
- Confidence
- Risk score
- Risk level
- Security indicators
- Detection explanation
- Attack context
- Recommended analyst actions

The purpose is to provide analysts with enough context to understand why an event was classified in a particular way.

---

## Major V1 Features

### Security Events

- Submit security events
- View stored events
- AI-assisted event analysis
- Security verdicts
- Risk scoring
- Security indicators
- Detection explanations

### Alerts

- Alert creation and management
- Severity tracking
- Alert details
- Operational investigation workflow

### Incidents

- Incident creation
- Incident status management
- Incident investigation workflows
- Security-event-to-incident operations

### Threat Intelligence

- IOC management
- Threat indicator tracking
- Threat intelligence records
- Investigation context

### MITRE ATT&CK

- MITRE ATT&CK technique management
- Attack-technique mapping
- Security-event context

### Notifications

- Security notifications
- Operational notification management

### Reports

- Security reporting
- SOC-oriented reporting interface

### Audit Logging

- User activity auditing
- Administrative action tracking
- Security operation history

### API Key Management

- API key generation
- Secure API key storage
- API key revocation
- API access controls

### System Health

- Service health monitoring
- Operational KPI visibility
- API-path activity
- Service-status monitoring

---

## Authentication and Security

ThreatLyst includes application-level security controls designed for a SOC platform.

### Role-Based Access Control

The platform currently supports:

- **Admin**
- **Analyst**
- **Viewer**

Access to features and operations is restricted based on user role.

### JWT Authentication

ThreatLyst uses secure JWT-based authentication.

Each successful login creates a unique authenticated session.

JWT tokens are bound to an individual session using a unique session identifier.

### User Session Monitoring

Administrators can monitor authenticated sessions, including:

- Username
- Email
- Role
- Session ID
- Login time
- Last activity
- Session expiry
- Browser
- Operating system
- Device type
- Network information
- Session status
- Session revocation

The platform distinguishes multiple simultaneous sessions even when the same account is used from different devices or browsers.

Supported session states include:

- Active
- Idle
- Logged out
- Expired
- Revoked

Administrators can revoke a specific session without affecting other active sessions belonging to the same user.

---

## Technology Stack

### Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- TanStack Query
- Axios
- Recharts
- Lucide React

### Backend

- Python
- FastAPI
- SQLAlchemy
- Pydantic
- Alembic
- REST APIs

### Database

- PostgreSQL

### Artificial Intelligence / Machine Learning

- Scikit-learn
- Isolation Forest
- Rule-based detection engine
- Hybrid security-event analysis

### Testing

- Pytest
- Vitest
- React Testing Library
- Mock Service Worker

### Deployment

- Cloudflare
- Railway
- PostgreSQL production database
- GitHub Actions / CI workflow

---

## Architecture

ThreatLyst follows a full-stack architecture:

```text
User / SOC Analyst
        |
        v
React + TypeScript Frontend
        |
        v
REST API
        |
        v
FastAPI Backend
        |
        +----------------------+
        |                      |
        v                      v
Detection Engine          Authentication
Rules + ML               RBAC + Sessions
        |                      |
        +----------+-----------+
                   |
                   v
              PostgreSQL
                   |
                   v
      Events / Alerts / Incidents /
      Threat Intel / Audit / Sessions
