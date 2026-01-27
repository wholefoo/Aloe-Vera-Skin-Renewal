# AI-SERP Self-Auditor - Standalone Package

A lightweight, installable package to analyze your websites for AI search engine visibility and generate optimization recommendations.

## Features

- **Self-Audit**: Crawls your site and analyzes it for AI search visibility
- **AI Analysis**: Uses GPT-4o to score visibility, SEO, AI context, and authority
- **Fix Tracking**: Generates and tracks actionable fixes with priority rankings
- **Agentic Signals**: Maintains current AI SERP ranking signals
- **Web Dashboard**: Simple Flask dashboard to manage audits and fixes
- **Persistent Storage**: Stores audit history, fixes, and config locally

## Important Notes

- Fixes are **tracked for manual implementation** - the tool identifies issues and you apply changes to your site
- Scores and recommendations are AI-generated based on content analysis
- Configuration persists across restarts via JSON files

## Quick Install on Replit

### Option 1: Single-File Install (Recommended)

1. **Create a new Python Repl** or use an existing one

2. **Copy `quick_install.py`** to your Repl

3. **Run the installer** (installs everything automatically):
   ```bash
   python quick_install.py
   ```

4. **Add your secrets** in Replit (Tools → Secrets):
   - `OPENAI_API_KEY` - Your OpenAI API key
   - `SITE_URL` - Your website URL to audit
   - `BRAND_NAME` - Your brand name

5. **Start the dashboard**:
   ```bash
   python dashboard.py
   ```

### Option 2: Git Clone

```bash
# In your Replit Shell:
git clone https://github.com/your-repo/ai-serp-auditor.git
cd ai-serp-auditor
python install.py
```

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | Your OpenAI API key |
| `SITE_URL` | Yes | Website URL to audit |
| `BRAND_NAME` | Yes | Your brand/company name |
| `AUTO_FIX_MODE` | No | `off`, `propose`, or `auto` (default: propose) |

### Using Replit's AI Integration

If your Repl has Replit's AI integration enabled, the package will automatically use:
- `AI_INTEGRATIONS_OPENAI_API_KEY`
- `AI_INTEGRATIONS_OPENAI_BASE_URL`

## Usage

### Command Line

```bash
# Run a self-audit
python main.py audit

# Research signal updates
python main.py update

# View audit history
python main.py history

# View pending fixes
python main.py fixes
```

### Web Dashboard

```bash
python dashboard.py
```

Then open your browser to your Repl's URL (port 5000).

### Python API

```python
from ai_serp_auditor import AuditConfig, SelfAuditor, AgenticUpdater

# Configure
config = AuditConfig(
    site_url="https://yoursite.com",
    brand_name="Your Brand"
)

# Run audit
auditor = SelfAuditor(config)
result = auditor.run_audit()

print(f"Visibility Score: {result['scores']['visibility']}/100")
print(f"Fixes Found: {result['fixes_count']}")

# Get pending fixes
fixes = auditor.get_pending_fixes()
for fix in fixes:
    print(f"- {fix['action']}")

# Apply a fix
auditor.apply_fix("qw_1")

# Run signal updates
updater = AgenticUpdater()
updates = updater.run_update()
```

## Understanding Scores

| Score | Meaning |
|-------|---------|
| **Visibility** | How likely AI search engines are to cite your content |
| **SEO** | Traditional SEO health metrics |
| **AI Context** | How well content is structured for LLM understanding |
| **Authority** | Expertise, experience, authoritativeness, trustworthiness |

### Score Colors
- 🟢 **80+**: Excellent
- 🟡 **60-79**: Needs improvement
- 🔴 **<60**: Critical issues

## Fix Categories

| Category | Description |
|----------|-------------|
| `quick_win` | Easy, high-impact changes |
| `technical` | Technical SEO issues |
| `schema` | Structured data improvements |
| `content` | Content optimization suggestions |

## File Structure

```
your-repl/
├── ai_serp_auditor.py   # Core module
├── dashboard.py          # Web dashboard
├── main.py              # CLI entry point
├── audit_data.json      # Audit history & fixes
└── signals_data.json    # AI SERP signals
```

## Customization

### Adding Custom Signals

```python
updater = AgenticUpdater()
updater.data['signals'].append({
    'id': 'custom_1',
    'name': 'My Custom Signal',
    'category': 'Content',
    'weight': 7,
    'description': 'Custom signal description'
})
updater._save_data()
```

### Scheduling Automatic Audits

Add to your Repl's scheduled tasks or use a cron job:

```python
# scheduled_audit.py
from ai_serp_auditor import AuditConfig, SelfAuditor
import os

config = AuditConfig(
    site_url=os.environ['SITE_URL'],
    brand_name=os.environ['BRAND_NAME']
)

auditor = SelfAuditor(config)
result = auditor.run_audit()

# Optional: Send notification
if result['scores']['visibility'] < 60:
    print(f"WARNING: Visibility dropped to {result['scores']['visibility']}")
```

## Troubleshooting

### "OPENAI_API_KEY not found"
Add your API key to Replit Secrets (Tools → Secrets)

### "Site crawl failed"
- Check if the URL is accessible
- Some sites block bots - try adding your site to allowed crawlers

### "No fixes found"
Your site may already be well-optimized! Try running with different focus keywords.

## License

MIT License - Use freely for your projects.

## Support

For issues or questions, check:
1. Your API key is valid
2. Your site URL is accessible
3. Replit secrets are properly configured
