"""
AI-SERP Self-Auditor - Standalone Package
Analyzes websites for AI search engine visibility and generates optimization fixes.

Install on any Replit Python project to automatically audit and optimize your site.
"""

import os
import json
import logging
import hashlib
from datetime import datetime
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from enum import Enum

import requests
from bs4 import BeautifulSoup
from openai import OpenAI

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class AutoFixMode(Enum):
    OFF = "off"
    PROPOSE = "propose"
    AUTO = "auto"


@dataclass
class AuditConfig:
    site_url: str
    brand_name: str
    focus_keywords: List[str] = None
    auto_fix_mode: AutoFixMode = AutoFixMode.PROPOSE
    
    def __post_init__(self):
        if self.focus_keywords is None:
            self.focus_keywords = []


class AIAnalyzer:
    """Analyzes content for AI search visibility."""
    
    def __init__(self, api_key: str = None, base_url: str = None):
        self.api_key = api_key or os.environ.get("OPENAI_API_KEY") or os.environ.get("AI_INTEGRATIONS_OPENAI_API_KEY")
        self.base_url = base_url or os.environ.get("AI_INTEGRATIONS_OPENAI_BASE_URL")
        
        if not self.api_key:
            raise ValueError("OpenAI API key not found. Set OPENAI_API_KEY in environment or Replit Secrets.")
        
        self.client = OpenAI(api_key=self.api_key, base_url=self.base_url)
    
    def analyze_page(self, url: str, content: str, brand_name: str) -> Dict[str, Any]:
        """Analyze a page for AI search visibility."""
        try:
            prompt = f"""Analyze this webpage content for AI search engine visibility.
            
URL: {url}
Brand: {brand_name}

Content (first 8000 chars):
{content[:8000]}

Provide a JSON response with:
{{
    "visibility_score": 0-100,
    "seo_score": 0-100,
    "ai_context_score": 0-100,
    "authority_score": 0-100,
    "quick_wins": [
        {{"priority": 1-10, "action": "description", "impact": "HIGH/MEDIUM/LOW"}}
    ],
    "technical_issues": ["issue1", "issue2"],
    "content_gaps": ["gap1", "gap2"],
    "schema_recommendations": ["rec1", "rec2"]
}}"""

            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are an AI search optimization expert. Respond only with valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=2000,
                temperature=0.3
            )
            
            result_text = response.choices[0].message.content.strip()
            if result_text.startswith("```"):
                result_text = result_text.split("```")[1]
                if result_text.startswith("json"):
                    result_text = result_text[4:]
            
            return json.loads(result_text)
        except Exception as e:
            logger.error(f"AI analysis failed: {e}")
            return {
                "visibility_score": 50,
                "seo_score": 50,
                "ai_context_score": 50,
                "authority_score": 50,
                "quick_wins": [],
                "technical_issues": [str(e)],
                "content_gaps": [],
                "schema_recommendations": []
            }


class WebCrawler:
    """Simple web crawler for page analysis."""
    
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'AI-SERP-Auditor/1.0 (compatible; optimization bot)'
        })
    
    def crawl(self, url: str) -> Dict[str, Any]:
        """Crawl a URL and extract relevant data."""
        try:
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.text, 'html.parser')
            
            title = soup.find('title')
            meta_desc = soup.find('meta', attrs={'name': 'description'})
            
            scripts = soup.find_all('script', type='application/ld+json')
            schema_data = []
            for script in scripts:
                try:
                    schema_data.append(json.loads(script.string))
                except:
                    pass
            
            headers = {}
            for i in range(1, 7):
                headers[f'h{i}'] = [h.get_text(strip=True) for h in soup.find_all(f'h{i}')]
            
            for tag in soup(['script', 'style', 'nav', 'footer', 'header']):
                tag.decompose()
            text_content = soup.get_text(separator=' ', strip=True)
            
            return {
                'url': url,
                'title': title.get_text(strip=True) if title else '',
                'meta_description': meta_desc.get('content', '') if meta_desc else '',
                'schema_data': schema_data,
                'headers': headers,
                'text_content': text_content[:15000],
                'word_count': len(text_content.split()),
                'status_code': response.status_code
            }
        except Exception as e:
            logger.error(f"Crawl failed for {url}: {e}")
            return {'url': url, 'error': str(e)}


class SelfAuditor:
    """Main self-audit orchestrator."""
    
    def __init__(self, config: AuditConfig, db_path: str = "audit_data.json"):
        self.config = config
        self.db_path = db_path
        self.crawler = WebCrawler()
        self.analyzer = AIAnalyzer()
        self.data = self._load_data()
    
    def _load_data(self) -> Dict:
        """Load persistent data."""
        if os.path.exists(self.db_path):
            with open(self.db_path, 'r') as f:
                return json.load(f)
        return {"audits": [], "fixes": [], "config": {}}
    
    def _save_data(self):
        """Save persistent data."""
        with open(self.db_path, 'w') as f:
            json.dump(self.data, f, indent=2, default=str)
    
    def run_audit(self) -> Dict[str, Any]:
        """Run a full self-audit."""
        logger.info(f"Starting audit for {self.config.site_url}")
        
        audit_id = f"audit_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        crawl_data = self.crawler.crawl(self.config.site_url)
        
        if 'error' in crawl_data:
            return {
                'audit_id': audit_id,
                'success': False,
                'error': crawl_data['error']
            }
        
        analysis = self.analyzer.analyze_page(
            self.config.site_url,
            crawl_data.get('text_content', ''),
            self.config.brand_name
        )
        
        fixes = self._extract_fixes(analysis)
        
        audit_result = {
            'audit_id': audit_id,
            'success': True,
            'site_url': self.config.site_url,
            'brand_name': self.config.brand_name,
            'timestamp': datetime.now().isoformat(),
            'scores': {
                'visibility': analysis.get('visibility_score', 0),
                'seo': analysis.get('seo_score', 0),
                'ai_context': analysis.get('ai_context_score', 0),
                'authority': analysis.get('authority_score', 0)
            },
            'crawl_data': {
                'title': crawl_data.get('title'),
                'meta_description': crawl_data.get('meta_description'),
                'word_count': crawl_data.get('word_count'),
                'schema_count': len(crawl_data.get('schema_data', []))
            },
            'fixes_count': len(fixes),
            'fixes': fixes
        }
        
        self.data['audits'].append(audit_result)
        for fix in fixes:
            fix['audit_id'] = audit_id
            fix['status'] = 'pending'
            self.data['fixes'].append(fix)
        
        self._save_data()
        
        logger.info(f"Audit complete. Score: {analysis.get('visibility_score', 0)}/100, Fixes: {len(fixes)}")
        
        return audit_result
    
    def _extract_fixes(self, analysis: Dict) -> List[Dict]:
        """Extract actionable fixes from analysis."""
        fixes = []
        
        for i, win in enumerate(analysis.get('quick_wins', []), 1):
            fixes.append({
                'id': f"qw_{i}",
                'category': 'quick_win',
                'priority': win.get('priority', 5),
                'action': win.get('action', ''),
                'impact': win.get('impact', 'MEDIUM'),
                'auto_fixable': False
            })
        
        for i, issue in enumerate(analysis.get('technical_issues', []), 1):
            fixes.append({
                'id': f"tech_{i}",
                'category': 'technical',
                'priority': 3,
                'action': f"Fix: {issue}",
                'impact': 'HIGH',
                'auto_fixable': False
            })
        
        for i, rec in enumerate(analysis.get('schema_recommendations', []), 1):
            fixes.append({
                'id': f"schema_{i}",
                'category': 'schema',
                'priority': 4,
                'action': rec,
                'impact': 'MEDIUM',
                'auto_fixable': True
            })
        
        return fixes
    
    def get_pending_fixes(self) -> List[Dict]:
        """Get all pending fixes."""
        return [f for f in self.data.get('fixes', []) if f.get('status') == 'pending']
    
    def get_audit_history(self) -> List[Dict]:
        """Get audit history."""
        return sorted(self.data.get('audits', []), key=lambda x: x.get('timestamp', ''), reverse=True)
    
    def apply_fix(self, fix_id: str) -> bool:
        """Mark a fix as applied."""
        for fix in self.data.get('fixes', []):
            if fix.get('id') == fix_id:
                fix['status'] = 'applied'
                fix['applied_at'] = datetime.now().isoformat()
                self._save_data()
                return True
        return False
    
    def reject_fix(self, fix_id: str) -> bool:
        """Mark a fix as rejected."""
        for fix in self.data.get('fixes', []):
            if fix.get('id') == fix_id:
                fix['status'] = 'rejected'
                self._save_data()
                return True
        return False


class AgenticUpdater:
    """Auto-updates AI SERP signals based on latest research."""
    
    def __init__(self, db_path: str = "signals_data.json"):
        self.db_path = db_path
        self.client = OpenAI(
            api_key=os.environ.get("OPENAI_API_KEY") or os.environ.get("AI_INTEGRATIONS_OPENAI_API_KEY"),
            base_url=os.environ.get("AI_INTEGRATIONS_OPENAI_BASE_URL")
        )
        self.data = self._load_data()
    
    def _load_data(self) -> Dict:
        if os.path.exists(self.db_path):
            with open(self.db_path, 'r') as f:
                return json.load(f)
        return {"signals": self._get_default_signals(), "updates": []}
    
    def _save_data(self):
        with open(self.db_path, 'w') as f:
            json.dump(self.data, f, indent=2, default=str)
    
    def _get_default_signals(self) -> List[Dict]:
        """Default AI SERP ranking signals."""
        return [
            {"id": "1", "name": "Entity Clarity", "category": "E-E-A-T", "weight": 9, "description": "Clear entity definitions and relationships"},
            {"id": "2", "name": "Author Expertise", "category": "E-E-A-T", "weight": 8, "description": "Demonstrated author credentials"},
            {"id": "3", "name": "Content Freshness", "category": "Content", "weight": 7, "description": "Recently updated content"},
            {"id": "4", "name": "Schema Markup", "category": "Technical", "weight": 8, "description": "Structured data implementation"},
            {"id": "5", "name": "LLM Readability", "category": "Content", "weight": 9, "description": "Content easily parsed by language models"},
            {"id": "6", "name": "Citation Quality", "category": "Authority", "weight": 7, "description": "Quality of external references"},
            {"id": "7", "name": "Topical Authority", "category": "Authority", "weight": 8, "description": "Domain expertise signals"}
        ]
    
    def research_updates(self) -> List[Dict]:
        """Research latest AI SERP signal updates."""
        try:
            prompt = """As an AI search optimization expert, identify the latest AI SERP ranking signals for 2025.
            
Current known signals: Entity Clarity, Author Expertise, Content Freshness, Schema Markup, LLM Readability, Citation Quality, Topical Authority.

Provide a JSON array of new or updated signals:
[
    {
        "name": "Signal Name",
        "category": "E-E-A-T|Content|Technical|Authority",
        "weight": 1-10,
        "description": "Brief description",
        "is_new": true/false,
        "confidence": 0.0-1.0
    }
]"""

            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are an AI search optimization research expert. Respond only with valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=1500,
                temperature=0.5
            )
            
            result_text = response.choices[0].message.content.strip()
            if result_text.startswith("```"):
                result_text = result_text.split("```")[1]
                if result_text.startswith("json"):
                    result_text = result_text[4:]
            
            return json.loads(result_text)
        except Exception as e:
            logger.error(f"Research failed: {e}")
            return []
    
    def run_update(self, auto_apply: bool = False) -> Dict[str, Any]:
        """Run an update cycle."""
        run_id = f"update_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        proposals = self.research_updates()
        
        applied = 0
        for proposal in proposals:
            if proposal.get('confidence', 0) >= 0.7:
                if auto_apply:
                    self._apply_signal(proposal)
                    applied += 1
                else:
                    proposal['status'] = 'pending'
        
        update_result = {
            'run_id': run_id,
            'timestamp': datetime.now().isoformat(),
            'proposals': proposals,
            'proposals_count': len(proposals),
            'applied_count': applied
        }
        
        self.data['updates'].append(update_result)
        self._save_data()
        
        return update_result
    
    def _apply_signal(self, proposal: Dict):
        """Apply a signal update."""
        new_signal = {
            'id': str(len(self.data['signals']) + 1),
            'name': proposal['name'],
            'category': proposal['category'],
            'weight': proposal['weight'],
            'description': proposal['description']
        }
        self.data['signals'].append(new_signal)
    
    def get_signals(self) -> List[Dict]:
        """Get current signals."""
        return self.data.get('signals', [])
    
    def get_update_history(self) -> List[Dict]:
        """Get update history."""
        return sorted(self.data.get('updates', []), key=lambda x: x.get('timestamp', ''), reverse=True)


def main():
    """Example usage."""
    print("=" * 60)
    print("AI-SERP Self-Auditor - Standalone Package")
    print("=" * 60)
    
    site_url = os.environ.get("SITE_URL", "https://example.com")
    brand_name = os.environ.get("BRAND_NAME", "My Brand")
    
    config = AuditConfig(
        site_url=site_url,
        brand_name=brand_name,
        auto_fix_mode=AutoFixMode.PROPOSE
    )
    
    auditor = SelfAuditor(config)
    
    print(f"\nRunning audit for: {site_url}")
    result = auditor.run_audit()
    
    if result.get('success'):
        print(f"\nAudit Complete!")
        print(f"  Visibility Score: {result['scores']['visibility']}/100")
        print(f"  SEO Score: {result['scores']['seo']}/100")
        print(f"  AI Context Score: {result['scores']['ai_context']}/100")
        print(f"  Authority Score: {result['scores']['authority']}/100")
        print(f"\n  Fixes Found: {result['fixes_count']}")
        
        for fix in result.get('fixes', [])[:5]:
            print(f"    - [{fix['category']}] {fix['action']}")
    else:
        print(f"\nAudit Failed: {result.get('error')}")
    
    print("\n" + "=" * 60)
    print("Agentic Signal Updater")
    print("=" * 60)
    
    updater = AgenticUpdater()
    print(f"\nCurrent Signals: {len(updater.get_signals())}")
    

if __name__ == "__main__":
    main()
