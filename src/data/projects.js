// Audited against linked public source on 26 October 2026. Scope is explicit; no impact metrics are inferred.
export const PROJECTS = [
  {
    "id": "examchain",
    "name": "ExamChain",
    "repo": "ExamChain",
    "category": "Systems",
    "status": "Hackathon prototype",
    "problem": "How can exam question release and result verification be made auditable?",
    "desc": "How can exam question release and result verification be made auditable?",
    "contribution": "Contributed to this team project. Individual module ownership is not yet confirmed.",
    "ownershipNote": "Overall implementation is described below; it is not a claim that I individually built each module.",
    "decisions": [
      "Encrypted question vaults and Merkle-root locking keep question integrity separate from the browser UI.",
      "FastAPI services, PostgreSQL and Redis support exam/session flows; a no-backend browser demo is available.",
      "Solidity contracts and QR credential routes explore tamper-evident result verification."
    ],
    "scope": "Hackathon prototype. A deployed frontend does not establish secure production examination infrastructure or measured scalability.",
    "stack": [
      "React",
      "FastAPI",
      "PostgreSQL",
      "Redis",
      "Solidity",
      "Web3.py"
    ],
    "year": "2026",
    "color": "#46d9ff",
    "sourceUrl": "https://github.com/Shaurya002800/ExamChain",
    "liveUrl": "https://exam-chain-pi.vercel.app",
    "url": "https://exam-chain-pi.vercel.app",
    "featured": true,
    "image": "/project-shots/examchain.png",
    "screenshotCaption": "Captured public frontend demo. Terminal/status graphics are presentation, not independent evidence of connected infrastructure.",
    "evidence": [
      {
        "label": "README.md",
        "href": "https://github.com/Shaurya002800/ExamChain/blob/main/README.md"
      },
      {
        "label": "backend/routers/exams.py",
        "href": "https://github.com/Shaurya002800/ExamChain/blob/main/backend/routers/exams.py"
      },
      {
        "label": "frontend/src/pages/ExamRoom.jsx",
        "href": "https://github.com/Shaurya002800/ExamChain/blob/main/frontend/src/pages/ExamRoom.jsx"
      }
    ]
  },
  {
    "id": "sentinelmesh",
    "name": "SentinelMesh",
    "repo": "Sentinelmesh",
    "category": "Systems",
    "status": "Hackathon prototype",
    "problem": "How can a security prototype combine device telemetry, threat assessment and an operator dashboard?",
    "desc": "How can a security prototype combine device telemetry, threat assessment and an operator dashboard?",
    "contribution": "Contributed to this team project. Individual module ownership is not yet confirmed.",
    "ownershipNote": "Overall implementation is described below; it is not a claim that I individually built each module.",
    "decisions": [
      "Python hardware-node code publishes telemetry through MQTT.",
      "The checked edge scorer uses explicit thresholds; the backend has a separate model-loading/classification path.",
      "A React dashboard presents incident and mesh information."
    ],
    "scope": "Team hackathon prototype. ESP32/TFLite and ESP-NOW are discussed in the README vision; the checked Python edge scorer is threshold-based. No on-device latency, throughput or node-failure tolerance result is claimed.",
    "stack": [
      "Python",
      "MQTT",
      "Flask",
      "React",
      "scikit-learn"
    ],
    "year": "2026",
    "color": "#ff4a5f",
    "sourceUrl": "https://github.com/Shaurya002800/Sentinelmesh",
    "liveUrl": null,
    "url": "https://github.com/Shaurya002800/Sentinelmesh",
    "featured": true,
    "image": "/project-shots/sentinelmesh.png",
    "screenshotCaption": "Previously captured prototype dashboard with its backend disconnected; interface evidence, not a live detection run.",
    "evidence": [
      {
        "label": "hardware/ai_model.py",
        "href": "https://github.com/Shaurya002800/Sentinelmesh/blob/main/hardware/ai_model.py"
      },
      {
        "label": "hardware/main.py",
        "href": "https://github.com/Shaurya002800/Sentinelmesh/blob/main/hardware/main.py"
      },
      {
        "label": "backend/ai_classifier.py",
        "href": "https://github.com/Shaurya002800/Sentinelmesh/blob/main/backend/ai_classifier.py"
      }
    ]
  },
  {
    "id": "devboard",
    "name": "DevBoard",
    "repo": "devboard",
    "category": "Web Products",
    "status": "Deployed demo",
    "problem": "How can founders publish scoped work and review structured developer applications?",
    "desc": "How can founders publish scoped work and review structured developer applications?",
    "contribution": "Project work represented in the linked repository; precise individual scope is not separately documented.",
    "ownershipNote": "Source evidence describes the project implementation, without individual impact metrics.",
    "decisions": [
      "Next.js interfaces are separated from an Express API.",
      "PostgreSQL persists projects and applications, with JWT-protected account flows.",
      "Filters and status transitions support browsing, pitching and applicant review."
    ],
    "scope": "A portfolio demo. Opening the frontend does not validate every authenticated/backend workflow.",
    "stack": [
      "Next.js",
      "React",
      "Express",
      "PostgreSQL",
      "JWT",
      "Tailwind CSS"
    ],
    "year": "2026",
    "color": "#4f8cff",
    "sourceUrl": "https://github.com/Shaurya002800/devboard",
    "liveUrl": "https://devboard-gamma-gilt.vercel.app",
    "url": "https://devboard-gamma-gilt.vercel.app",
    "featured": true,
    "image": "/project-shots/devboard.png",
    "screenshotCaption": "Captured demo interface; availability and backend operation are separate from this image.",
    "evidence": [
      {
        "label": "README.md",
        "href": "https://github.com/Shaurya002800/devboard/blob/main/README.md"
      },
      {
        "label": "server/routes/auth.js",
        "href": "https://github.com/Shaurya002800/devboard/blob/main/server/routes/auth.js"
      },
      {
        "label": "client/lib/api.js",
        "href": "https://github.com/Shaurya002800/devboard/blob/main/client/lib/api.js"
      }
    ]
  },
  {
    "id": "serenova-engine",
    "name": "Serenova Engine",
    "repo": "AstroMl",
    "category": "Applied AI",
    "status": "Pilot-stage tool",
    "availabilityNote": "The public pilot timed out during the 26 October 2026 link check. Source code remains available.",
    "problem": "How can a consultant produce structured astrology reports with clear calculation and interpretation boundaries?",
    "desc": "How can a consultant produce structured astrology reports with clear calculation and interpretation boundaries?",
    "contribution": "Project work represented in the linked repository; precise individual scope is not separately documented.",
    "ownershipNote": "Source evidence describes the project implementation, without individual impact metrics.",
    "decisions": [
      "Swiss Ephemeris and deterministic rules calculate chart features.",
      "A deterministic consultation brief and multilingual presentation layer consume the computed facts.",
      "Optional guarded LLM synthesis is separate from the default report and release-readiness gates."
    ],
    "scope": "Consultant-facing pilot-stage tool. Expert review, independent fixtures, privacy and backup gates must be satisfied before paid production use. No predictive or clinical efficacy is claimed.",
    "stack": [
      "Python",
      "Streamlit",
      "Swiss Ephemeris",
      "FastAPI",
      "Groq"
    ],
    "year": "2026",
    "color": "#9f7bff",
    "sourceUrl": "https://github.com/Shaurya002800/AstroMl",
    "liveUrl": "https://astroml.onrender.com/",
    "url": "https://astroml.onrender.com/",
    "featured": true,
    "image": "/project-shots/serenova-engine.png",
    "screenshotCaption": "Consultant tool interface; pilot status, not production approval.",
    "evidence": [
      {
        "label": "README.md",
        "href": "https://github.com/Shaurya002800/AstroMl/blob/main/README.md"
      },
      {
        "label": "src/astrology_model.py",
        "href": "https://github.com/Shaurya002800/AstroMl/blob/main/src/astrology_model.py"
      },
      {
        "label": "tests/test_deployment_readiness.py",
        "href": "https://github.com/Shaurya002800/AstroMl/blob/main/tests/test_deployment_readiness.py"
      }
    ]
  },
  {
    "id": "spendlens",
    "name": "SpendLens",
    "repo": "ai-spend-audit",
    "category": "Applied AI",
    "status": "Deployed demo",
    "problem": "Which overlapping AI subscriptions could a team review to reduce avoidable spend?",
    "desc": "Which overlapping AI subscriptions could a team review to reduce avoidable spend?",
    "contribution": "Built the audit app described in the first-person repository README, including deterministic calculations and a separate summary layer.",
    "ownershipNote": "Source evidence describes the project implementation, without individual impact metrics.",
    "decisions": [
      "Pricing math, overlap detection and recommendations are deterministic and tested.",
      "Anthropic generates explanatory text only; failures use a template summary.",
      "Supabase stores saved audits, while public share pages omit identifying details."
    ],
    "scope": "Savings are catalog-based estimates, not realised customer savings. External storage and email configuration affect sharing; no adoption or revenue metric is claimed.",
    "stack": [
      "Next.js",
      "TypeScript",
      "Supabase",
      "Anthropic",
      "Jest"
    ],
    "year": "2026",
    "color": "#4dff9a",
    "sourceUrl": "https://github.com/Shaurya002800/ai-spend-audit",
    "liveUrl": "https://ai-spend-audit-blush.vercel.app",
    "url": "https://ai-spend-audit-blush.vercel.app",
    "featured": true,
    "image": "/project-shots/spendlens.png",
    "screenshotCaption": "Captured demo interface; availability and backend operation are separate from this image.",
    "evidence": [
      {
        "label": "lib/audit-engine.ts",
        "href": "https://github.com/Shaurya002800/ai-spend-audit/blob/main/lib/audit-engine.ts"
      },
      {
        "label": "app/api/audit/route.ts",
        "href": "https://github.com/Shaurya002800/ai-spend-audit/blob/main/app/api/audit/route.ts"
      },
      {
        "label": "README.md",
        "href": "https://github.com/Shaurya002800/ai-spend-audit/blob/main/README.md"
      }
    ]
  },
  {
    "id": "peblo-notes",
    "name": "Peblo Notes",
    "repo": "AI-powered-learning-universe",
    "category": "Web Products",
    "status": "Deployed demo",
    "problem": "How can a notes workspace combine reliable editing, organisation and optional AI assistance?",
    "desc": "How can a notes workspace combine reliable editing, organisation and optional AI assistance?",
    "contribution": "Project work represented in the linked repository; precise individual scope is not separately documented.",
    "ownershipNote": "Source evidence describes the project implementation, without individual impact metrics.",
    "decisions": [
      "Next.js route handlers separate notes, authentication and sharing boundaries.",
      "Signed cookie sessions and password hashing protect account flows.",
      "AI generation is isolated behind a helper with a local fallback; the repository documents SQLite persistence."
    ],
    "scope": "Take-home challenge implementation with a deployed demo. Production persistence and multi-user operations are not certified by the screenshot.",
    "stack": [
      "Next.js",
      "TypeScript",
      "SQLite",
      "jose",
      "OpenAI"
    ],
    "year": "2026",
    "color": "#f2c94c",
    "sourceUrl": "https://github.com/Shaurya002800/AI-powered-learning-universe",
    "liveUrl": "https://ai-powered-learning-universe.vercel.app/",
    "url": "https://ai-powered-learning-universe.vercel.app/",
    "featured": true,
    "image": "/project-shots/peblo-notes.png",
    "screenshotCaption": "Captured demo interface; availability and backend operation are separate from this image.",
    "evidence": [
      {
        "label": "README.md",
        "href": "https://github.com/Shaurya002800/AI-powered-learning-universe/blob/main/README.md"
      },
      {
        "label": "lib/ai.ts",
        "href": "https://github.com/Shaurya002800/AI-powered-learning-universe/blob/main/lib/ai.ts"
      },
      {
        "label": "lib/store.ts",
        "href": "https://github.com/Shaurya002800/AI-powered-learning-universe/blob/main/lib/store.ts"
      }
    ]
  },
  {
    "id": "serenova-consult",
    "name": "Serenova Consult",
    "repo": "Consultancy",
    "category": "Web Products",
    "status": "Deployed demo",
    "problem": "How can visitors understand consultation services and request a suitable session?",
    "desc": "How can visitors understand consultation services and request a suitable session?",
    "contribution": "Project work represented in the linked repository; precise individual scope is not separately documented.",
    "ownershipNote": "Source evidence describes the project implementation, without individual impact metrics.",
    "decisions": [
      "Next.js pages and a service catalog guide the booking journey.",
      "Validated booking rules and Supabase separate request data from presentation.",
      "Booking lifecycle logic tracks pending holds and notification failures."
    ],
    "scope": "Public website demo. Payment readiness does not mean payments were tested or revenue was earned; no form or payment was submitted during this audit.",
    "stack": [
      "Next.js",
      "Supabase",
      "Zod",
      "Razorpay"
    ],
    "year": "2026",
    "color": "#ff9f43",
    "sourceUrl": "https://github.com/Shaurya002800/Consultancy",
    "liveUrl": "https://serenova-rho.vercel.app/",
    "url": "https://serenova-rho.vercel.app/",
    "featured": true,
    "image": "/project-shots/serenova-consult.png",
    "screenshotCaption": "Captured demo interface; availability and backend operation are separate from this image.",
    "evidence": [
      {
        "label": "src/lib/bookingRules.ts",
        "href": "https://github.com/Shaurya002800/Consultancy/blob/main/src/lib/bookingRules.ts"
      },
      {
        "label": "src/lib/bookingValidation.ts",
        "href": "https://github.com/Shaurya002800/Consultancy/blob/main/src/lib/bookingValidation.ts"
      },
      {
        "label": "src/lib/bookingLifecycle.ts",
        "href": "https://github.com/Shaurya002800/Consultancy/blob/main/src/lib/bookingLifecycle.ts"
      }
    ]
  },
  {
    "id": "vivayu",
    "name": "Vivayu / AgriGPT",
    "repo": "ML-project",
    "category": "Applied AI",
    "status": "Hackathon prototype",
    "problem": "How can farmers explore crop-health predictions and retrieve relevant agricultural guidance?",
    "desc": "How can farmers explore crop-health predictions and retrieve relevant agricultural guidance?",
    "contribution": "Project work represented in the linked repository; precise individual scope is not separately documented.",
    "ownershipNote": "Source evidence describes the project implementation, without individual impact metrics.",
    "decisions": [
      "XGBoost training is explicit rather than running during app import.",
      "Saved model artifacts are loaded lazily for prediction.",
      "LangChain/FAISS retrieval and a Streamlit interface combine model output with reference guidance."
    ],
    "scope": "This dossier describes the linked ML-project implementation, not the separate newer Vivayu sensor repositories. The historic Streamlit link currently redirects to login; model output is not validated agronomic advice.",
    "stack": [
      "Python",
      "Streamlit",
      "XGBoost",
      "LangChain",
      "FAISS"
    ],
    "year": "2026",
    "color": "#36d672",
    "sourceUrl": "https://github.com/Shaurya002800/ML-project",
    "liveUrl": null,
    "url": "https://github.com/Shaurya002800/ML-project",
    "featured": true,
    "image": "/project-shots/vivayu.png",
    "screenshotCaption": "Previously captured prototype interface; historical Streamlit link requires access.",
    "evidence": [
      {
        "label": "models/train_disease.py",
        "href": "https://github.com/Shaurya002800/ML-project/blob/main/models/train_disease.py"
      },
      {
        "label": "agrigpt/rag_pipeline.py",
        "href": "https://github.com/Shaurya002800/ML-project/blob/main/agrigpt/rag_pipeline.py"
      },
      {
        "label": "dashboard/streamlit_app.py",
        "href": "https://github.com/Shaurya002800/ML-project/blob/main/dashboard/streamlit_app.py"
      }
    ],
    "availabilityNote": "Historical demo currently redirects to Streamlit login; source remains available.",
    "historicalUrl": "https://ml-project-6c8bzwvgvr8xibunhdsjtt.streamlit.app"
  },
  {
    "id": "loadright",
    "name": "LoadRight",
    "repo": "LoadRight",
    "category": "Applied AI",
    "status": "Recorded-video prototype",
    "problem": "How can a loading-bay supervisor review handling incidents and their visible evidence?",
    "desc": "How can a loading-bay supervisor review handling incidents and their visible evidence?",
    "contribution": "Contributed to this team project. Individual module ownership is not yet confirmed.",
    "ownershipNote": "Overall implementation is described below; it is not a claim that I individually built each module.",
    "decisions": [
      "Recorded video becomes timestamped observations before conservative temporal rules run.",
      "Incident, correction and human inspection states remain separate.",
      "Rules can abstain when contact or release cannot be established; the assistant retrieves stored incident records."
    ],
    "scope": "Team Bit by Bit hackathon prototype. Synthetic fixtures are engineering evidence only; real warehouse footage accuracy was not validated. Batch review does not prevent incidents in real time.",
    "stack": [
      "Python",
      "FastAPI",
      "OpenCV",
      "YOLO-World",
      "SQLite",
      "JavaScript"
    ],
    "year": "2026",
    "color": "#46d9ff",
    "sourceUrl": "https://github.com/Shaurya002800/LoadRight",
    "liveUrl": null,
    "url": "https://github.com/Shaurya002800/LoadRight",
    "featured": false,
    "image": "/project-shots/loadright.png",
    "screenshotCaption": "Local recorded-video review interface before a video is analysed; not a real warehouse deployment.",
    "evidence": [
      {
        "label": "README.md",
        "href": "https://github.com/Shaurya002800/LoadRight/blob/main/README.md"
      },
      {
        "label": "backend/rules.py",
        "href": "https://github.com/Shaurya002800/LoadRight/blob/main/backend/rules.py"
      },
      {
        "label": "tests/test_fixtures.py",
        "href": "https://github.com/Shaurya002800/LoadRight/blob/main/tests/test_fixtures.py"
      }
    ]
  },
  {
    "id": "mtr-kv",
    "name": "MTR-KV",
    "repo": "MTR-KV",
    "category": "Research",
    "status": "Research experiment",
    "problem": "How can codec motion metadata inform a generation-safe model of KV-page residency?",
    "desc": "How can codec motion metadata inform a generation-safe model of KV-page residency?",
    "contribution": "Project work represented in the linked repository; precise individual scope is not separately documented.",
    "ownershipNote": "Source evidence describes the project implementation, without individual impact metrics.",
    "decisions": [
      "Spatial reconciliation maps decoder motion metadata to logical visual-token pages.",
      "A generation-validated reserve/prepare/commit/ready transaction governs tiered allocations.",
      "Conservative fallback and semantic rescue use the same control path; experiments and tests expose their boundaries."
    ],
    "scope": "A deterministic software/controller model with optional model-backed experiments, not production GPU hardware or an established production efficiency improvement.",
    "stack": [
      "Python",
      "KV memory model",
      "Codec metadata",
      "Generation safety"
    ],
    "year": "2026",
    "color": "#ff4a5f",
    "sourceUrl": "https://github.com/Shaurya002800/MTR-KV",
    "liveUrl": null,
    "url": "https://github.com/Shaurya002800/MTR-KV",
    "featured": false,
    "image": "/project-shots/mtr-kv.png",
    "screenshotCaption": "Repository-recorded prototype dashboard. Simulator counters are not production performance results.",
    "evidence": [
      {
        "label": "README.md",
        "href": "https://github.com/Shaurya002800/MTR-KV/blob/main/README.md"
      },
      {
        "label": "mtr_kv/controller.py",
        "href": "https://github.com/Shaurya002800/MTR-KV/blob/main/mtr_kv/controller.py"
      },
      {
        "label": "mtr_kv/memory.py",
        "href": "https://github.com/Shaurya002800/MTR-KV/blob/main/mtr_kv/memory.py"
      }
    ]
  },
  {
    "id": "topopatch",
    "name": "TopoPatch",
    "repo": "TopoPatch",
    "category": "Research",
    "status": "Research experiment",
    "problem": "Can selected vector-representation migrations preserve retrieval constraints for registered queries?",
    "desc": "Can selected vector-representation migrations preserve retrieval constraints for registered queries?",
    "contribution": "Project work represented in the linked repository; precise individual scope is not separately documented.",
    "ownershipNote": "Source evidence describes the project implementation, without individual impact metrics.",
    "decisions": [
      "Candidate changes are previewed and checked against protected retrieval queries before commit.",
      "SQLite stores active membership, epochs and history atomically, with rollback.",
      "The default offline fixture uses deterministic lexical encoders; optional model experiments are explicitly distinguished."
    ],
    "scope": "Local research lab. Safety applies to declared queries, not unseen queries or universal equivalence. No ANN topology savings, global optimality or proven production improvement is claimed.",
    "stack": [
      "Python",
      "SQLite",
      "Vector retrieval",
      "Rank fusion"
    ],
    "year": "2026",
    "color": "#4f8cff",
    "sourceUrl": "https://github.com/Shaurya002800/TopoPatch",
    "liveUrl": null,
    "url": "https://github.com/Shaurya002800/TopoPatch",
    "featured": false,
    "image": "/project-shots/topopatch.jpg",
    "screenshotCaption": "Repository-recorded migration workbench using the local research fixture.",
    "evidence": [
      {
        "label": "README.md",
        "href": "https://github.com/Shaurya002800/TopoPatch/blob/main/README.md"
      },
      {
        "label": "topopatch/engine.py",
        "href": "https://github.com/Shaurya002800/TopoPatch/blob/main/topopatch/engine.py"
      },
      {
        "label": "topopatch/models.py",
        "href": "https://github.com/Shaurya002800/TopoPatch/blob/main/topopatch/models.py"
      }
    ]
  },
  {
    "id": "aura",
    "name": "AURA",
    "repo": "Aura",
    "category": "Research",
    "status": "Synthetic research prototype",
    "problem": "How can a local software pipeline enforce declared privacy policies before model operations?",
    "desc": "How can a local software pipeline enforce declared privacy policies before model operations?",
    "contribution": "Project work represented in the linked repository; precise individual scope is not separately documented.",
    "ownershipNote": "Source evidence describes the project implementation, without individual impact metrics.",
    "decisions": [
      "Deterministic policy composition and short-lived tokens define the local enforcement boundary.",
      "Synthetic QR-to-track binding and volatile masking exercise pre-model controls.",
      "Signed software receipts and content-minimized evidence expose allowed, denied and unresolved outcomes."
    ],
    "scope": "Only the linked Aura repository is represented. Synthetic software demonstration, not AURA-CUT, camera-hardware attestation, legal-compliance certification or proof that external cameras obey policy.",
    "stack": [
      "Python",
      "FastAPI",
      "TypeScript",
      "Next.js",
      "Ed25519"
    ],
    "year": "2026",
    "color": "#9f7bff",
    "sourceUrl": "https://github.com/Shaurya002800/Aura",
    "liveUrl": null,
    "url": "https://github.com/Shaurya002800/Aura",
    "featured": false,
    "image": "/project-shots/aura.png",
    "screenshotCaption": "Locally rendered dashboard component from the linked repository; bundled synthetic records, not live participant data.",
    "evidence": [
      {
        "label": "README.md",
        "href": "https://github.com/Shaurya002800/Aura/blob/main/README.md"
      },
      {
        "label": "services/vision/src/aura_vision/binding.py",
        "href": "https://github.com/Shaurya002800/Aura/blob/main/services/vision/src/aura_vision/binding.py"
      },
      {
        "label": "apps/dashboard/app/page.tsx",
        "href": "https://github.com/Shaurya002800/Aura/blob/main/apps/dashboard/app/page.tsx"
      }
    ]
  },
  {
    "id": "astrasafe",
    "name": "AstraSafe",
    "repo": "AstraSafe",
    "category": "Applied AI",
    "status": "Synthetic safety simulation",
    "problem": "How can compound safety signals be explained together instead of as isolated threshold alarms?",
    "desc": "How can compound safety signals be explained together instead of as isolated threshold alarms?",
    "contribution": "Contributed to this team project. Individual module ownership is not yet confirmed.",
    "ownershipNote": "Overall implementation is described below; it is not a claim that I individually built each module.",
    "decisions": [
      "A deterministic synthetic plant scenario produces sensor, permit, worker and equipment events.",
      "An explicit weighted risk engine compares compound signals with a single-sensor baseline.",
      "Counterfactual futures, intervention ranking and evidence reports remain within the simulated scenario."
    ],
    "scope": "Team hackathon simulation. No real industrial accident prevention, deployed sensor integration or validated safety guarantee is claimed.",
    "stack": [
      "JavaScript",
      "Node.js",
      "Deterministic simulation",
      "Risk rules"
    ],
    "year": "2026",
    "color": "#4dff9a",
    "sourceUrl": "https://github.com/Shaurya002800/AstraSafe",
    "liveUrl": null,
    "url": "https://github.com/Shaurya002800/AstraSafe",
    "featured": false,
    "image": "/project-shots/astrasafe.png",
    "screenshotCaption": "Local command centre displaying synthetic scenario data.",
    "evidence": [
      {
        "label": "README.md",
        "href": "https://github.com/Shaurya002800/AstraSafe/blob/main/README.md"
      },
      {
        "label": "src/domain/risk-engine.js",
        "href": "https://github.com/Shaurya002800/AstraSafe/blob/main/src/domain/risk-engine.js"
      },
      {
        "label": "src/domain/scenario.js",
        "href": "https://github.com/Shaurya002800/AstraSafe/blob/main/src/domain/scenario.js"
      }
    ]
  },
  {
    "id": "webnest",
    "name": "WebNest",
    "repo": "webnest",
    "category": "Web Products",
    "status": "Deployed demo",
    "problem": "How can a service site explain a connected brand, website and growth offering through an interactive journey?",
    "desc": "How can a service site explain a connected brand, website and growth offering through an interactive journey?",
    "contribution": "Project work represented in the linked repository; precise individual scope is not separately documented.",
    "ownershipNote": "Source evidence describes the project implementation, without individual impact metrics.",
    "decisions": [
      "React route composition separates the homepage, enquiries, legal pages, payment and admin views.",
      "Three.js scene components and motion policies support the cinematic visual journey.",
      "Form/API boundaries and accessibility tests are present; production business outcomes are not inferred."
    ],
    "scope": "Interactive service-site demo. A visible payment or enquiry flow is not evidence of completed transactions, clients or revenue.",
    "stack": [
      "React",
      "TypeScript",
      "Three.js",
      "Vite"
    ],
    "year": "2026",
    "color": "#f2c94c",
    "sourceUrl": "https://github.com/Shaurya002800/webnest",
    "liveUrl": "https://webnest-theta.vercel.app",
    "url": "https://webnest-theta.vercel.app",
    "featured": false,
    "image": "/project-shots/webnest.png",
    "screenshotCaption": "Captured public WebNest website interface.",
    "evidence": [
      {
        "label": "src/App.jsx",
        "href": "https://github.com/Shaurya002800/webnest/blob/main/src/App.jsx"
      },
      {
        "label": "src/Accessibility.test.tsx",
        "href": "https://github.com/Shaurya002800/webnest/blob/main/src/Accessibility.test.tsx"
      },
      {
        "label": "src/prototype/motion-policy.ts",
        "href": "https://github.com/Shaurya002800/webnest/blob/main/src/prototype/motion-policy.ts"
      }
    ]
  }
]

export const FEATURED_PROJECTS = PROJECTS.filter(project => project.featured)

export const PROJECT_GALLERY_SPOTS = [
  { projectIndex: 0, side: 'left',  frame: [-6.18, 3.45, -14.2], circle: [-4.88, 0.12, -14.2], radius: 1.28 },
  { projectIndex: 1, side: 'left',  frame: [-6.18, 3.45,  -6.8], circle: [-4.88, 0.12,  -6.8], radius: 1.28 },
  { projectIndex: 2, side: 'left',  frame: [-6.18, 3.45,   0.6], circle: [-4.88, 0.12,   0.6], radius: 1.28 },
  { projectIndex: 3, side: 'left',  frame: [-6.18, 3.45,   8.0], circle: [-4.88, 0.12,   8.0], radius: 1.28 },
  { projectIndex: 4, side: 'right', frame: [ 6.18, 3.45, -14.2], circle: [ 4.88, 0.12, -14.2], radius: 1.28 },
  { projectIndex: 5, side: 'right', frame: [ 6.18, 3.45,  -6.8], circle: [ 4.88, 0.12,  -6.8], radius: 1.28 },
  { projectIndex: 6, side: 'right', frame: [ 6.18, 3.45,   0.6], circle: [ 4.88, 0.12,   0.6], radius: 1.28 },
  { projectIndex: 7, side: 'right', frame: [ 6.18, 3.45,   8.0], circle: [ 4.88, 0.12,   8.0], radius: 1.28 },
]
