#!/usr/bin/env python3
"""
AI-SERP Auditor - Installation Script for Replit
Run this script in your Replit project to install the self-audit package.
"""

import os
import sys
import subprocess

REQUIRED_PACKAGES = [
    "openai",
    "requests",
    "beautifulsoup4",
    "flask"
]


def install_packages():
    """Install required packages."""
    print("Installing required packages...")
    for package in REQUIRED_PACKAGES:
        print(f"  Installing {package}...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", package, "-q"])
    print("All packages installed.\n")


def setup_env_vars():
    """Guide user through environment variable setup."""
    print("=" * 50)
    print("Environment Variable Setup")
    print("=" * 50)
    print("""
Required secrets (add in Replit Secrets tab):

1. OPENAI_API_KEY
   - Get from: https://platform.openai.com/api-keys
   - Or use Replit's AI integration

2. SITE_URL
   - Your website URL to audit (e.g., https://mysite.com)

3. BRAND_NAME
   - Your brand/company name

Optional:
- AUTO_FIX_MODE: 'off', 'propose', or 'auto' (default: propose)
""")


def create_main_file():
    """Create the main.py entry point if it doesn't exist."""
    main_content = '''"""
AI-SERP Self-Auditor - Main Entry Point
Runs the self-audit on your configured site.
"""

import os
from ai_serp_auditor import AuditConfig, SelfAuditor, AgenticUpdater, AutoFixMode

def run_audit():
    """Run a self-audit on your site."""
    site_url = os.environ.get("SITE_URL")
    brand_name = os.environ.get("BRAND_NAME", "My Site")
    
    if not site_url:
        print("ERROR: Please set SITE_URL in your Replit Secrets")
        print("Go to: Tools > Secrets > Add SITE_URL")
        return
    
    config = AuditConfig(
        site_url=site_url,
        brand_name=brand_name,
        auto_fix_mode=AutoFixMode.PROPOSE
    )
    
    auditor = SelfAuditor(config)
    result = auditor.run_audit()
    
    if result.get('success'):
        print("\\n" + "=" * 50)
        print("AUDIT RESULTS")
        print("=" * 50)
        print(f"Site: {site_url}")
        print(f"Brand: {brand_name}")
        print(f"\\nSCORES:")
        print(f"  Visibility:  {result['scores']['visibility']}/100")
        print(f"  SEO:         {result['scores']['seo']}/100")
        print(f"  AI Context:  {result['scores']['ai_context']}/100")
        print(f"  Authority:   {result['scores']['authority']}/100")
        print(f"\\nFIXES FOUND: {result['fixes_count']}")
        print("-" * 50)
        for fix in result.get('fixes', []):
            print(f"  [{fix['priority']}] [{fix['category']}] {fix['action']}")
        print("=" * 50)
    else:
        print(f"Audit failed: {result.get('error')}")
    
    return result


def run_signal_update():
    """Run the agentic signal updater."""
    updater = AgenticUpdater()
    
    print("\\n" + "=" * 50)
    print("AGENTIC SIGNAL UPDATER")
    print("=" * 50)
    print(f"Current signals: {len(updater.get_signals())}")
    
    print("\\nResearching latest AI SERP signals...")
    result = updater.run_update(auto_apply=False)
    
    print(f"\\nProposals found: {result['proposals_count']}")
    for proposal in result.get('proposals', [])[:5]:
        conf = proposal.get('confidence', 0) * 100
        print(f"  - {proposal['name']} ({proposal['category']}) - Confidence: {conf:.0f}%")
    
    return result


def show_history():
    """Show audit history."""
    config = AuditConfig(
        site_url=os.environ.get("SITE_URL", ""),
        brand_name=os.environ.get("BRAND_NAME", "")
    )
    auditor = SelfAuditor(config)
    
    history = auditor.get_audit_history()
    
    print("\\n" + "=" * 50)
    print("AUDIT HISTORY")
    print("=" * 50)
    
    if not history:
        print("No audits yet. Run 'python main.py audit' to start.")
        return
    
    for audit in history[:10]:
        print(f"\\n{audit['timestamp'][:16]}")
        print(f"  Visibility: {audit['scores']['visibility']}/100")
        print(f"  Fixes: {audit['fixes_count']}")


def show_pending_fixes():
    """Show pending fixes."""
    config = AuditConfig(
        site_url=os.environ.get("SITE_URL", ""),
        brand_name=os.environ.get("BRAND_NAME", "")
    )
    auditor = SelfAuditor(config)
    
    fixes = auditor.get_pending_fixes()
    
    print("\\n" + "=" * 50)
    print("PENDING FIXES")
    print("=" * 50)
    
    if not fixes:
        print("No pending fixes.")
        return
    
    for fix in fixes:
        print(f"\\n[{fix['id']}] {fix['action']}")
        print(f"  Category: {fix['category']} | Priority: {fix['priority']} | Impact: {fix['impact']}")


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("AI-SERP Self-Auditor")
        print("-" * 30)
        print("Usage:")
        print("  python main.py audit     - Run a self-audit")
        print("  python main.py update    - Research signal updates")
        print("  python main.py history   - Show audit history")
        print("  python main.py fixes     - Show pending fixes")
        sys.exit(0)
    
    command = sys.argv[1].lower()
    
    if command == "audit":
        run_audit()
    elif command == "update":
        run_signal_update()
    elif command == "history":
        show_history()
    elif command == "fixes":
        show_pending_fixes()
    else:
        print(f"Unknown command: {command}")
'''
    
    if not os.path.exists("main.py"):
        with open("main.py", "w") as f:
            f.write(main_content)
        print("Created main.py entry point")
    else:
        print("main.py already exists - skipping")


def main():
    print("=" * 50)
    print("AI-SERP Auditor - Replit Installation")
    print("=" * 50)
    print()
    
    install_packages()
    setup_env_vars()
    create_main_file()
    
    print("\n" + "=" * 50)
    print("INSTALLATION COMPLETE!")
    print("=" * 50)
    print("""
Next steps:

1. Add your secrets in Replit:
   - Click 'Tools' > 'Secrets'
   - Add OPENAI_API_KEY (or use Replit AI integration)
   - Add SITE_URL (your website URL)
   - Add BRAND_NAME (your brand name)

2. Run your first audit:
   python main.py audit

3. View your results:
   python main.py history
   python main.py fixes

For the web dashboard, run:
   python dashboard.py
""")


if __name__ == "__main__":
    main()
