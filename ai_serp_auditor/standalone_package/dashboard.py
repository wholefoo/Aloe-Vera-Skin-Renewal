"""
AI-SERP Auditor - Web Dashboard
A simple Flask dashboard for managing audits and fixes.
"""

import os
import json
from flask import Flask, render_template_string, request, redirect, url_for, jsonify
from ai_serp_auditor import AuditConfig, SelfAuditor, AgenticUpdater, AutoFixMode

app = Flask(__name__)

DASHBOARD_HTML = '''
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI-SERP Auditor Dashboard</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #e2e8f0; min-height: 100vh; }
        .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        h1 { color: #f8fafc; margin-bottom: 0.5rem; }
        .subtitle { color: #94a3b8; margin-bottom: 2rem; }
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
        .btn:hover { opacity: 0.9; }
        .fix-item { background: #0f172a; border-radius: 8px; padding: 1rem; margin-bottom: 0.75rem; border-left: 3px solid #3b82f6; }
        .fix-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
        .fix-action { color: #f8fafc; font-weight: 500; }
        .fix-meta { color: #94a3b8; font-size: 0.875rem; }
        .badge { display: inline-block; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.75rem; margin-right: 0.5rem; }
        .badge-quick_win { background: #4ade8022; color: #4ade80; }
        .badge-technical { background: #f8717122; color: #f87171; }
        .badge-schema { background: #60a5fa22; color: #60a5fa; }
        .badge-content { background: #fbbf2422; color: #fbbf24; }
        .history-item { padding: 0.75rem; border-bottom: 1px solid #334155; }
        .history-item:last-child { border-bottom: none; }
        .config-form input, .config-form select { width: 100%; padding: 0.75rem; margin-bottom: 1rem; border-radius: 8px; border: 1px solid #334155; background: #0f172a; color: #e2e8f0; }
        .config-form label { display: block; margin-bottom: 0.5rem; color: #94a3b8; }
        .status { padding: 1rem; border-radius: 8px; margin-bottom: 1rem; }
        .status-success { background: #065f4622; border: 1px solid #065f46; }
        .status-error { background: #7f1d1d22; border: 1px solid #7f1d1d; }
        .btn-group { display: flex; gap: 0.5rem; }
        .btn-sm { padding: 0.5rem 1rem; font-size: 0.875rem; }
    </style>
</head>
<body>
    <div class="container">
        <h1>AI-SERP Auditor</h1>
        <p class="subtitle">Self-Audit & Auto-Fix Dashboard</p>
        
        {% if message %}
        <div class="status {{ 'status-success' if success else 'status-error' }}">
            {{ message }}
        </div>
        {% endif %}
        
        <!-- Configuration -->
        <div class="card">
            <h2 class="card-title">Configuration</h2>
            <form class="config-form" method="POST" action="/config">
                <div class="grid">
                    <div>
                        <label>Site URL</label>
                        <input type="url" name="site_url" value="{{ config.site_url }}" placeholder="https://yoursite.com" required>
                    </div>
                    <div>
                        <label>Brand Name</label>
                        <input type="text" name="brand_name" value="{{ config.brand_name }}" placeholder="Your Brand" required>
                    </div>
                    <div>
                        <label>Auto-Fix Mode</label>
                        <select name="auto_fix_mode">
                            <option value="off" {{ 'selected' if config.auto_fix_mode == 'off' }}>Off (Manual Only)</option>
                            <option value="propose" {{ 'selected' if config.auto_fix_mode == 'propose' }}>Propose (Review First)</option>
                            <option value="auto" {{ 'selected' if config.auto_fix_mode == 'auto' }}>Auto (Apply Safe Fixes)</option>
                        </select>
                    </div>
                </div>
                <button type="submit" class="btn btn-primary">Save Configuration</button>
            </form>
        </div>
        
        <!-- Actions -->
        <div class="card">
            <h2 class="card-title">Actions</h2>
            <div class="btn-group">
                <form method="POST" action="/audit" style="display: inline;">
                    <button type="submit" class="btn btn-primary">Run Self-Audit</button>
                </form>
                <form method="POST" action="/update-signals" style="display: inline;">
                    <button type="submit" class="btn btn-primary">Research Signal Updates</button>
                </form>
            </div>
        </div>
        
        <!-- Latest Scores -->
        {% if latest_audit %}
        <div class="card">
            <h2 class="card-title">Latest Audit Scores</h2>
            <div class="grid">
                <div class="score-card">
                    <div class="score-value {{ 'score-green' if latest_audit.scores.visibility >= 80 else 'score-yellow' if latest_audit.scores.visibility >= 60 else 'score-red' }}">
                        {{ latest_audit.scores.visibility }}
                    </div>
                    <div class="score-label">Visibility</div>
                </div>
                <div class="score-card">
                    <div class="score-value {{ 'score-green' if latest_audit.scores.seo >= 80 else 'score-yellow' if latest_audit.scores.seo >= 60 else 'score-red' }}">
                        {{ latest_audit.scores.seo }}
                    </div>
                    <div class="score-label">SEO</div>
                </div>
                <div class="score-card">
                    <div class="score-value {{ 'score-green' if latest_audit.scores.ai_context >= 80 else 'score-yellow' if latest_audit.scores.ai_context >= 60 else 'score-red' }}">
                        {{ latest_audit.scores.ai_context }}
                    </div>
                    <div class="score-label">AI Context</div>
                </div>
                <div class="score-card">
                    <div class="score-value {{ 'score-green' if latest_audit.scores.authority >= 80 else 'score-yellow' if latest_audit.scores.authority >= 60 else 'score-red' }}">
                        {{ latest_audit.scores.authority }}
                    </div>
                    <div class="score-label">Authority</div>
                </div>
            </div>
            <p style="margin-top: 1rem; color: #94a3b8;">Last audit: {{ latest_audit.timestamp[:16] }}</p>
        </div>
        {% endif %}
        
        <!-- Pending Fixes -->
        <div class="card">
            <h2 class="card-title">Pending Fixes ({{ pending_fixes|length }})</h2>
            {% if pending_fixes %}
                {% for fix in pending_fixes %}
                <div class="fix-item">
                    <div class="fix-header">
                        <div>
                            <span class="badge badge-{{ fix.category }}">{{ fix.category }}</span>
                            <span class="fix-action">{{ fix.action }}</span>
                        </div>
                        <div class="btn-group">
                            <form method="POST" action="/fix/{{ fix.id }}/apply" style="display: inline;">
                                <button type="submit" class="btn btn-success btn-sm">Apply</button>
                            </form>
                            <form method="POST" action="/fix/{{ fix.id }}/reject" style="display: inline;">
                                <button type="submit" class="btn btn-danger btn-sm">Reject</button>
                            </form>
                        </div>
                    </div>
                    <div class="fix-meta">Priority: {{ fix.priority }} | Impact: {{ fix.impact }}</div>
                </div>
                {% endfor %}
            {% else %}
                <p style="color: #94a3b8;">No pending fixes. Run a self-audit to find optimization opportunities.</p>
            {% endif %}
        </div>
        
        <!-- Audit History -->
        <div class="card">
            <h2 class="card-title">Audit History</h2>
            {% if history %}
                {% for audit in history[:5] %}
                <div class="history-item">
                    <strong>{{ audit.timestamp[:16] }}</strong> - 
                    Visibility: {{ audit.scores.visibility }}/100, 
                    Fixes: {{ audit.fixes_count }}
                </div>
                {% endfor %}
            {% else %}
                <p style="color: #94a3b8;">No audits yet.</p>
            {% endif %}
        </div>
        
        <!-- AI SERP Signals -->
        <div class="card">
            <h2 class="card-title">AI SERP Signals ({{ signals|length }})</h2>
            <div class="grid">
                {% for signal in signals[:8] %}
                <div class="score-card">
                    <div class="score-value score-green" style="font-size: 1.5rem;">{{ signal.weight }}</div>
                    <div class="score-label">{{ signal.name }}</div>
                </div>
                {% endfor %}
            </div>
        </div>
    </div>
</body>
</html>
'''

CONFIG_FILE = "config.json"

def load_config():
    """Load config from file or environment."""
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, 'r') as f:
            return json.load(f)
    return {
        'site_url': os.environ.get('SITE_URL', ''),
        'brand_name': os.environ.get('BRAND_NAME', ''),
        'auto_fix_mode': os.environ.get('AUTO_FIX_MODE', 'propose')
    }

def save_config(config):
    """Save config to file."""
    with open(CONFIG_FILE, 'w') as f:
        json.dump(config, f, indent=2)

config_data = load_config()


def get_auditor():
    config = AuditConfig(
        site_url=config_data['site_url'],
        brand_name=config_data['brand_name'],
        auto_fix_mode=AutoFixMode(config_data['auto_fix_mode'])
    )
    return SelfAuditor(config)


@app.route('/')
def index():
    auditor = get_auditor()
    updater = AgenticUpdater()
    
    history = auditor.get_audit_history()
    latest_audit = history[0] if history else None
    
    return render_template_string(
        DASHBOARD_HTML,
        config=config_data,
        latest_audit=latest_audit,
        pending_fixes=auditor.get_pending_fixes(),
        history=history,
        signals=updater.get_signals(),
        message=request.args.get('message'),
        success=request.args.get('success') == 'true'
    )


@app.route('/config', methods=['POST'])
def update_config():
    global config_data
    config_data['site_url'] = request.form.get('site_url', '')
    config_data['brand_name'] = request.form.get('brand_name', '')
    config_data['auto_fix_mode'] = request.form.get('auto_fix_mode', 'propose')
    save_config(config_data)
    return redirect(url_for('index', message='Configuration saved!', success='true'))


@app.route('/audit', methods=['POST'])
def run_audit():
    if not config_data['site_url']:
        return redirect(url_for('index', message='Please configure site URL first', success='false'))
    
    auditor = get_auditor()
    result = auditor.run_audit()
    
    if result.get('success'):
        msg = f"Audit complete! Score: {result['scores']['visibility']}/100, Fixes: {result['fixes_count']}"
        return redirect(url_for('index', message=msg, success='true'))
    else:
        return redirect(url_for('index', message=f"Audit failed: {result.get('error')}", success='false'))


@app.route('/update-signals', methods=['POST'])
def update_signals():
    updater = AgenticUpdater()
    result = updater.run_update(auto_apply=False)
    msg = f"Found {result['proposals_count']} signal updates"
    return redirect(url_for('index', message=msg, success='true'))


@app.route('/fix/<fix_id>/apply', methods=['POST'])
def apply_fix(fix_id):
    auditor = get_auditor()
    if auditor.apply_fix(fix_id):
        return redirect(url_for('index', message=f'Fix {fix_id} applied!', success='true'))
    else:
        return redirect(url_for('index', message=f'Failed to apply fix {fix_id}', success='false'))


@app.route('/fix/<fix_id>/reject', methods=['POST'])
def reject_fix(fix_id):
    auditor = get_auditor()
    if auditor.reject_fix(fix_id):
        return redirect(url_for('index', message=f'Fix {fix_id} rejected', success='true'))
    else:
        return redirect(url_for('index', message=f'Failed to reject fix {fix_id}', success='false'))


if __name__ == '__main__':
    print("Starting AI-SERP Auditor Dashboard...")
    print("Open your browser to: http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=True)
