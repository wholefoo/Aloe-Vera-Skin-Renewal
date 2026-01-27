import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertNewsletterSchema } from "@shared/schema";
import { z } from "zod";
import session from "express-session";

const DASHBOARD_PASSWORD = process.env.DASHBOARD_PASSWORD || "";

declare module "express-session" {
  interface SessionData {
    authenticated?: boolean;
  }
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

const adminDashboardHtml = (message?: string, success?: boolean) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI-SERP Auditor Dashboard</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, sans-serif; background: #0f172a; color: #e2e8f0; min-height: 100vh; }
        .container { max-width: 900px; margin: 0 auto; padding: 2rem; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        h1 { color: #f8fafc; }
        .card { background: #1e293b; border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem; }
        .card-title { color: #f8fafc; margin-bottom: 1rem; font-size: 1.25rem; }
        .btn { display: inline-block; padding: 0.75rem 1.5rem; border-radius: 8px; border: none; cursor: pointer; font-size: 1rem; text-decoration: none; }
        .btn-primary { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; }
        .btn-ghost { background: transparent; color: #94a3b8; border: 1px solid #334155; }
        .status { padding: 1rem; border-radius: 8px; margin-bottom: 1rem; }
        .status-success { background: #065f4622; border: 1px solid #065f46; color: #4ade80; }
        .status-error { background: #7f1d1d22; border: 1px solid #7f1d1d; color: #f87171; }
        .info { background: #1e40af22; border: 1px solid #1e40af; padding: 1rem; border-radius: 8px; color: #60a5fa; }
        .form-group { margin-bottom: 1rem; }
        label { display: block; margin-bottom: 0.5rem; color: #94a3b8; }
        input { width: 100%; padding: 0.75rem; border-radius: 8px; border: 1px solid #334155; background: #0f172a; color: #e2e8f0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>AI-SERP Auditor</h1>
            <a href="/admin/logout" class="btn btn-ghost" data-testid="button-admin-logout">Logout</a>
        </div>
        ${message ? `<div class="status ${success ? "status-success" : "status-error"}">${message}</div>` : ""}
        <div class="card">
            <h2 class="card-title">Run Audit</h2>
            <p class="info">To run an audit, use the Shell and run: <code>python dashboard.py</code><br><br>
            Then access port 8080 in a new browser tab to use the full audit dashboard with scoring and fix recommendations.</p>
        </div>
        <div class="card">
            <h2 class="card-title">Quick Links</h2>
            <p style="color: #94a3b8; margin-bottom: 1rem;">Your site: <a href="https://aloeveraskinrenewal.com" target="_blank" style="color: #60a5fa;">aloeveraskinrenewal.com</a></p>
            <p style="color: #94a3b8;">Brand: L'Bri Pure n' Natural</p>
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
    const message = req.query.message as string | undefined;
    const success = req.query.success === "true";
    res.send(adminDashboardHtml(message, success));
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
