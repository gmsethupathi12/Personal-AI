# Levi.ai — Production AI Landing Page with Chat Widget & Google Sheets Integration

A complete, production-ready, full-stack AI web application featuring an ultra-fast dark-themed landing page, native Google Sheets automation via Google Apps Script, and real-time conversational AI powered by Google's Gemini 1.5 Flash API.

Deployed at: [personal-ai-ruby.vercel.app](https://personal-ai-ruby.vercel.app)  
Active Webhook: `https://script.google.com/macros/s/AKfycbz4P6GRpl4qPdFEF0Xf441H3jpsp9vbSTua_OUedDwntoZkdhGTV9iCfFr_H4VL1RtOtw/exec`

---

## 📁 Project Architecture

```text
personal-ai-landing-page/
├── index.html          # High-converting landing page with inline styles & chat widget
├── package.json        # Project metadata & scripts
├── vercel.json         # Vercel deployment configuration & security headers
├── .gitignore          # Git ignore configuration
├── .env.example        # Environment variable template
├── Code.gs             # Google Apps Script for automated Google Sheets lead routing
├── README.md           # Comprehensive deployment & setup guide
└── api/
    ├── chat.js         # Serverless function: Gemini 1.5 Flash chat endpoint (/api/chat)
    └── analytics.js    # Serverless function: Lightweight event telemetry (/api/analytics)
```

---

## 🚀 Key Features

1. **High-Performance Landing Page (`index.html`)**:
   - **Modern Dark Aesthetic**: `#0c0e13` background, `#191c21` surface cards, `#00e5ff` cyan neon accents, `#a8ffd2` secondary mint.
   - **Zero External Dependencies**: All CSS and JavaScript are self-contained. No external font CDNs or slow render-blocking assets.
   - **Full-Spectrum Responsiveness**: Pixel-perfect on Mobile (<480px, tested down to 375px), Tablet (480–768px), and Desktop (>768px).
   - **Hero Lead Capture Form**: Strictly contains **Name, Email, and Phone ONLY**.
   - **Zero-Redirect Sheets Pipeline**: Uses browser `fetch()` with HTTP GET `URLSearchParams` in `no-cors` mode, completely avoiding CORS and redirect drops.
   - **Interactive Sections**: 4 Architecture Feature Cards, 3 Real-World Metrics, 3+ Target Audience Use Cases, and Call-to-Action.

2. **Real-Time AI Chat Widget**:
   - **Fixed Bottom-Right Dock**: Floating 60px circular toggle with vibrant gradient and status indicator.
   - **Floating Window**: Responsive 380px × 500px layout with gradient header, scrollable history, and clear/close buttons.
   - **Custom Message Styling**: Cyan bubble for user messages, dark card with cyan left-border for AI responses.
   - **Typing Indicator**: Real-time `"⏳ Thinking..."` loading animation.
   - **Local Storage Persistence**: Automatically retains conversation history across page refreshes.

3. **Vercel Serverless AI Backend (`api/chat.js`)**:
   - **Model**: Google Gemini 1.5 Flash (`gemini-1.5-flash`).
   - **System Instruction**: `"You are Levi, a helpful AI assistant for Levi.ai"`.
   - **Rate Limiting**: Sliding-window rate limiter enforcing a maximum of **60 requests/minute** per IP (aligned with Google's free tier).
   - **Security**: Secret API key stays 100% on the server; never exposed to browser clients.

4. **Google Sheets Webhook (`Code.gs`)**:
   - **Auto-Provisioning**: Automatically creates the `"Responses"` sheet if not present, complete with bold stylized headers (`Timestamp`, `Name`, `Email`, `Phone`).
   - **Dual Handlers**: Primary `doGet(e)` and fallback `doPost(e)`.
   - **Concurrent Safety**: Leverages `LockService` to prevent row overwrite race conditions.
   - **Automated Email (Optional)**: Built-in `sendWelcomeEmail()` function sends a formatted confirmation email to leads.

---

## 🔑 Step 1: Getting Your Free Google Gemini API Key

Levi.ai utilizes the free tier of Google Gemini API (no credit card required).

1. Visit [Google AI Studio](https://aistudio.google.com/) or [Google AI Dev](https://ai.google.dev/).
2. Sign in with your Google account.
3. Click on **"Get API key"** in the top navigation or sidebar.
4. Click **"Create API key"** (select an existing Google Cloud project or create a free project in one click).
5. Copy your generated key (e.g. `AIzaSy...`).

---

## 📊 Step 2: Google Apps Script & Google Sheets Setup

The live webhook is already pre-configured:
```text
https://script.google.com/macros/s/AKfycbz4P6GRpl4qPdFEF0Xf441H3jpsp9vbSTua_OUedDwntoZkdhGTV9iCfFr_H4VL1RtOtw/exec
```

If you wish to deploy your own custom Google Sheet:
1. Open [Google Sheets](https://sheets.google.com) and create a new blank spreadsheet.
2. In the top menu, go to **Extensions** > **Apps Script**.
3. Delete any default code in `Code.gs` and paste the contents of `Code.gs` from this project.
4. Click the blue **Deploy** button at top right > Select **New deployment**.
5. Click the gear icon next to "Select type" and choose **Web app**.
6. Set the configuration:
   - **Description**: `Levi.ai Webhook`
   - **Execute as**: `Me (your email)`
   - **Who has access**: `Anyone` *(Crucial: must be Anyone so public web forms can submit)*
7. Click **Deploy**, click **Authorize access**, log into your Google Account, click **Advanced** > **Go to Untitled project (unsafe)**, and click **Allow**.
8. Copy the **Web App URL** ending in `/exec`.
9. If using a new URL, update the `APPS_SCRIPT_URL` variable in `index.html`.

---

## ⚡ Step 3: Deploying to Vercel

### Option A: Deploy via GitHub (Recommended)

1. Push this project folder to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit of Levi.ai landing page"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/personal-ai-landing-page.git
   git push -u origin main
   ```
2. Log in to [Vercel](https://vercel.com).
3. Click **Add New...** > **Project** and import your repository.
4. In the **Environment Variables** section:
   - **Key**: `GOOGLE_API_KEY`
   - **Value**: `[Your Gemini API Key from Step 1]`
5. Click **Deploy**. Vercel will build and assign your production domain.

---

### Option B: Deploy via Vercel CLI

1. Install the Vercel CLI:
   ```bash
   npm install -g vercel
   ```
2. In your project directory, deploy to production:
   ```bash
   vercel --prod
   ```
3. Set your environment variable:
   ```bash
   vercel env add GOOGLE_API_KEY
   ```
   Paste your API key and select **Production, Preview, Development**.
4. Redeploy to activate the environment variable:
   ```bash
   vercel --prod
   ```

---

## 🧪 Testing Checklist

| Test Item | Expected Result | Verified |
|-----------|-----------------|:--------:|
| **Hero Form Fields** | Strictly displays Name, Email, Phone | ✅ |
| **Form Validation** | Requires all 3 fields, checks native email syntax | ✅ |
| **Submission State** | Button displays "Submitting..." spinner | ✅ |
| **Google Sheets Sync** | Record appears in "Responses" sheet with timestamp | ✅ |
| **Success Banner** | Green banner displays: *"✓ Thank you! We've received your information..."* and hides after 5s | ✅ |
| **Error Handling** | Red banner displays on failure and hides after 5s | ✅ |
| **Chat Toggle** | Circular toggle opens and closes 380px chat window | ✅ |
| **Chat AI Response** | Levi AI responds with sub-second intelligent answers | ✅ |
| **Rate Limiter** | Blocks spam queries exceeding 60 requests/minute | ✅ |
| **Responsiveness** | Flawless rendering at 375px (mobile), 768px (tablet), 1200px (desktop) | ✅ |
| **Console Errors** | Clean browser console with zero runtime warnings/errors | ✅ |

---

## 🛡️ Security & Performance Standards

- **Server-Side Key Isolation**: `GOOGLE_API_KEY` is strictly confined to `api/chat.js` and is never exposed in client-side HTML, CSS, or JS.
- **DDoS & Rate Protection**: Built-in sliding-window limiter rejects burst traffic over 60 req/min with HTTP 429.
- **Double-Submission Prevention**: The submit button is debounced and disabled while pending.
- **No CORS Pitfalls**: Form submission employs a resilient `no-cors` GET pipeline tailored for Google Apps Script redirects.
- **Zero CDN Dependencies**: All assets are completely embedded, ensuring lightning-fast First Contentful Paint (FCP) and optimal Largest Contentful Paint (LCP).

---

## 📄 License
This project is licensed under the MIT License.
