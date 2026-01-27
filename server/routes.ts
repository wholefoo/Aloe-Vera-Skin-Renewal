import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertNewsletterSchema } from "@shared/schema";
import { z } from "zod";
import session from "express-session";
import { execSync, spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";

const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || "";
const CONFIG_FILE = "config.json";
const AUDIT_DATA_FILE = "audit_data.json";

declare module "express-session" {
  interface SessionData {
    authenticated?: boolean;
  }
}

interface AuditConfig {
  site_url: string;
  brand_name: string;
}

interface AuditScores {
  visibility: number;
  seo: number;
  ai_context: number;
  authority: number;
}

interface AuditResult {
  audit_id: string;
  success: boolean;
  timestamp: string;
  scores: AuditScores;
  fixes_count: number;
}

interface Fix {
  id: string;
  category: string;
  priority: number;
  action: string;
  impact: string;
  status: string;
  audit_id?: string;
}

function loadConfig(): AuditConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
    }
  } catch (e) {}
  return { site_url: "https://aloeveraskinrenewal.com", brand_name: "L'Bri Pure n' Natural" };
}

function saveConfig(config: AuditConfig) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

function loadAuditData(): { audits: AuditResult[], fixes: Fix[] } {
  try {
    if (fs.existsSync(AUDIT_DATA_FILE)) {
      return JSON.parse(fs.readFileSync(AUDIT_DATA_FILE, "utf-8"));
    }
  } catch (e) {}
  return { audits: [], fixes: [] };
}

function saveAuditData(data: { audits: AuditResult[], fixes: Fix[] }) {
  fs.writeFileSync(AUDIT_DATA_FILE, JSON.stringify(data, null, 2));
}

const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.session?.authenticated) {
    return next();
  }
  res.redirect("/admin/login");
};

const adminLoginHtml = (error?: string) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI-SERP Auditor - Login</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, sans-serif; background: #0f172a; color: #e2e8f0; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
        .login-card { background: #1e293b; border-radius: 12px; padding: 2rem; width: 100%; max-width: 400px; }
        h1 { color: #f8fafc; margin-bottom: 1.5rem; text-align: center; font-size: 1.5rem; }
        .form-group { margin-bottom: 1rem; }
        label { display: block; margin-bottom: 0.5rem; color: #94a3b8; }
        input { width: 100%; padding: 0.75rem; border-radius: 8px; border: 1px solid #334155; background: #0f172a; color: #e2e8f0; }
        .btn { display: block; width: 100%; padding: 0.75rem 1.5rem; border-radius: 8px; border: none; cursor: pointer; font-size: 1rem; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; margin-top: 1rem; }
        .btn:hover { opacity: 0.9; }
        .error { background: #7f1d1d22; border: 1px solid #7f1d1d; padding: 0.75rem; border-radius: 8px; margin-bottom: 1rem; color: #f87171; }
    </style>
</head>
<body>
    <div class="login-card">
        <h1>AI-SERP Auditor</h1>
        ${error ? `<div class="error">${error}</div>` : ""}
        <form method="POST" action="/admin/login">
            <div class="form-group">
                <label>Password</label>
                <input type="password" name="password" required autofocus data-testid="input-admin-password">
            </div>
            <button type="submit" class="btn" data-testid="button-admin-login">Login</button>
        </form>
    </div>
</body>
</html>`;

function getScoreClass(score: number): string {
  if (score >= 80) return "score-green";
  if (score >= 60) return "score-yellow";
  return "score-red";
}

const adminDashboardHtml = (config: AuditConfig, latestAudit: AuditResult | null, pendingFixes: Fix[], message?: string, success?: boolean, isRunning?: boolean) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI-SERP Auditor Dashboard</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, sans-serif; background: #0f172a; color: #e2e8f0; min-height: 100vh; }
        .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        h1 { color: #f8fafc; }
        .card { background: #1e293b; border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; }
        .card-title { color: #f8fafc; margin-bottom: 1rem; font-size: 1.25rem; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
        .score-card { background: #0f172a; border-radius: 8px; padding: 1rem; text-align: center; }
        .score-value { font-size: 2.5rem; font-weight: bold; }
        .score-label { color: #94a3b8; font-size: 0.875rem; }
        .score-green { color: #4ade80; }
        .score-yellow { color: #fbbf24; }
        .score-red { color: #f87171; }
        .btn { display: inline-block; padding: 0.75rem 1.5rem; border-radius: 8px; border: none; cursor: pointer; font-size: 1rem; text-decoration: none; }
        .btn-primary { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; }
        .btn-success { background: #065f46; color: white; }
        .btn-danger { background: #7f1d1d; color: white; }
        .btn-ghost { background: transparent; color: #94a3b8; border: 1px solid #334155; }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .fix-item { background: #0f172a; border-radius: 8px; padding: 1rem; margin-bottom: 0.75rem; border-left: 3px solid #3b82f6; }
        .fix-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem; }
        .badge { display: inline-block; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; margin-right: 0.5rem; background: #4ade8022; color: #4ade80; }
        .config-form input { width: 100%; padding: 0.75rem; margin-bottom: 1rem; border-radius: 8px; border: 1px solid #334155; background: #0f172a; color: #e2e8f0; }
        .config-form label { display: block; margin-bottom: 0.5rem; color: #94a3b8; }
        .status { padding: 1rem; border-radius: 8px; margin-bottom: 1rem; }
        .status-success { background: #065f4622; border: 1px solid #065f46; color: #4ade80; }
        .status-error { background: #7f1d1d22; border: 1px solid #7f1d1d; color: #f87171; }
        .btn-group { display: flex; gap: 0.5rem; }
        .btn-sm { padding: 0.5rem 1rem; font-size: 0.875rem; }
        .spinner { display: inline-block; width: 1rem; height: 1rem; border: 2px solid #ffffff44; border-top-color: #fff; border-radius: 50%; animation: spin 1s linear infinite; margin-right: 0.5rem; }
        @keyframes spin { to { transform: rotate(360deg); } }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>AI-SERP Auditor Dashboard</h1>
            <a href="/admin/logout" class="btn btn-ghost" data-testid="button-admin-logout">Logout</a>
        </div>
        ${message ? `<div class="status ${success ? "status-success" : "status-error"}">${message}</div>` : ""}
        
        <div class="card">
            <h2 class="card-title">Configuration</h2>
            <form class="config-form" method="POST" action="/admin/config">
                <div class="grid">
                    <div><label>Site URL</label><input type="url" name="site_url" value="${config.site_url}" required data-testid="input-site-url"></div>
                    <div><label>Brand Name</label><input type="text" name="brand_name" value="${config.brand_name}" required data-testid="input-brand-name"></div>
                </div>
                <button type="submit" class="btn btn-primary" data-testid="button-save-config">Save Configuration</button>
            </form>
        </div>
        
        <div class="card">
            <h2 class="card-title">Actions</h2>
            <form method="POST" action="/admin/audit" style="display: inline;">
                <button class="btn btn-primary" ${isRunning ? 'disabled' : ''} data-testid="button-run-audit">
                    ${isRunning ? '<span class="spinner"></span>Running...' : 'Run Self-Audit'}
                </button>
            </form>
        </div>
        
        ${latestAudit ? `
        <div class="card">
            <h2 class="card-title">Latest Scores</h2>
            <div class="grid">
                <div class="score-card"><div class="score-value ${getScoreClass(latestAudit.scores.visibility)}">${latestAudit.scores.visibility}</div><div class="score-label">Visibility</div></div>
                <div class="score-card"><div class="score-value ${getScoreClass(latestAudit.scores.seo)}">${latestAudit.scores.seo}</div><div class="score-label">SEO</div></div>
                <div class="score-card"><div class="score-value ${getScoreClass(latestAudit.scores.ai_context)}">${latestAudit.scores.ai_context}</div><div class="score-label">AI Context</div></div>
                <div class="score-card"><div class="score-value ${getScoreClass(latestAudit.scores.authority)}">${latestAudit.scores.authority}</div><div class="score-label">Authority</div></div>
            </div>
            <p style="color: #64748b; margin-top: 1rem; font-size: 0.875rem;">Last audit: ${new Date(latestAudit.timestamp).toLocaleString()}</p>
        </div>
        ` : ''}
        
        <div class="card">
            <h2 class="card-title">Pending Fixes (${pendingFixes.length})</h2>
            ${pendingFixes.length > 0 ? pendingFixes.map(fix => `
            <div class="fix-item">
                <div class="fix-header">
                    <div><span class="badge">${fix.category}</span> ${fix.action}</div>
                    <div class="btn-group">
                        <form method="POST" action="/admin/fix/${fix.id}/apply"><button class="btn btn-success btn-sm" data-testid="button-apply-${fix.id}">Apply</button></form>
                        <form method="POST" action="/admin/fix/${fix.id}/reject"><button class="btn btn-danger btn-sm" data-testid="button-reject-${fix.id}">Reject</button></form>
                    </div>
                </div>
            </div>
            `).join('') : '<p style="color: #94a3b8;">No pending fixes. Run an audit to discover improvements.</p>'}
        </div>
    </div>
</body>
</html>`;

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Session middleware for admin auth
  app.use(session({
    secret: process.env.SESSION_SECRET || "fallback-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
  }));

  // Admin login page
  app.get("/admin/login", (req, res) => {
    if (req.session?.authenticated) {
      return res.redirect("/admin");
    }
    res.send(adminLoginHtml());
  });

  // Admin login handler
  app.post("/admin/login", (req, res) => {
    const { password } = req.body;
    if (DASHBOARD_PASSWORD && password === DASHBOARD_PASSWORD) {
      req.session.authenticated = true;
      return res.redirect("/admin");
    }
    res.send(adminLoginHtml("Invalid password"));
  });

  // Admin logout
  app.get("/admin/logout", (req, res) => {
    req.session.destroy(() => {
      res.redirect("/admin/login");
    });
  });

  // Admin dashboard
  app.get("/admin", adminAuth, (req, res) => {
    const config = loadConfig();
    const auditData = loadAuditData();
    const latestAudit = auditData.audits.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0] || null;
    const pendingFixes = auditData.fixes.filter(f => f.status === "pending");
    const message = req.query.message as string | undefined;
    const success = req.query.success === "true";
    res.send(adminDashboardHtml(config, latestAudit, pendingFixes, message, success));
  });

  // Save config
  app.post("/admin/config", adminAuth, (req, res) => {
    const config: AuditConfig = {
      site_url: req.body.site_url || "",
      brand_name: req.body.brand_name || ""
    };
    saveConfig(config);
    res.redirect("/admin?message=Configuration+saved!&success=true");
  });

  // Run audit
  app.post("/admin/audit", adminAuth, async (req, res) => {
    const config = loadConfig();
    if (!config.site_url) {
      return res.redirect("/admin?message=Configure+site+URL+first&success=false");
    }
    
    try {
      // Run Python auditor script
      const result = execSync(
        `python3 -c "
import json
from ai_serp_auditor import AuditConfig, SelfAuditor
config = AuditConfig(site_url='${config.site_url}', brand_name='${config.brand_name}')
auditor = SelfAuditor(config)
result = auditor.run_audit()
print(json.dumps(result))
"`,
        { encoding: "utf-8", timeout: 60000 }
      );
      
      const auditResult = JSON.parse(result.trim());
      if (auditResult.success) {
        res.redirect(`/admin?message=Audit+complete!+Visibility+Score:+${auditResult.scores.visibility}/100&success=true`);
      } else {
        res.redirect(`/admin?message=Audit+failed:+${encodeURIComponent(auditResult.error || "Unknown error")}&success=false`);
      }
    } catch (error: any) {
      console.error("Audit error:", error.message);
      res.redirect(`/admin?message=Audit+error:+${encodeURIComponent(error.message?.substring(0, 100) || "Unknown error")}&success=false`);
    }
  });

  // Apply fix
  app.post("/admin/fix/:fixId/apply", adminAuth, (req, res) => {
    const fixId = req.params.fixId;
    const auditData = loadAuditData();
    const fix = auditData.fixes.find(f => f.id === fixId);
    if (fix) {
      fix.status = "applied";
      saveAuditData(auditData);
      res.redirect(`/admin?message=Fix+${fixId}+marked+as+applied&success=true`);
    } else {
      res.redirect("/admin?message=Fix+not+found&success=false");
    }
  });

  // Reject fix
  app.post("/admin/fix/:fixId/reject", adminAuth, (req, res) => {
    const fixId = req.params.fixId;
    const auditData = loadAuditData();
    const fix = auditData.fixes.find(f => f.id === fixId);
    if (fix) {
      fix.status = "rejected";
      saveAuditData(auditData);
      res.redirect(`/admin?message=Fix+${fixId}+rejected&success=true`);
    } else {
      res.redirect("/admin?message=Fix+not+found&success=false");
    }
  });

  // Newsletter signup endpoint
  app.post("/api/newsletter", async (req, res) => {
    try {
      const { email } = insertNewsletterSchema.parse(req.body);
      
      // Check if email already exists
      const existingSubscriber = await storage.getNewsletterSubscriberByEmail(email);
      if (existingSubscriber) {
        return res.status(400).json({ message: "You're already subscribed!" });
      }
      
      // Create new subscriber
      const subscriber = await storage.createNewsletterSubscriber({ email });
      res.status(201).json({ message: "Successfully subscribed!", subscriber });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Please enter a valid email address." });
      }
      res.status(500).json({ message: "Something went wrong. Please try again." });
    }
  });

  return httpServer;
}
