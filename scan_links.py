import sys
import os
import re
import ssl
import json
import time
from urllib.parse import urlparse, urljoin
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
from concurrent.futures import ThreadPoolExecutor, as_completed
from html.parser import HTMLParser

LINKS_FILE = r"c:\Users\kerik\krytoi_site\орих сайт\links.txt"
OUTPUT_JSON = r"c:\Users\kerik\krytoi_site\scan_results.json"

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
}

class DetailedHTMLAuditor(HTMLParser):
    def __init__(self, page_url):
        super().__init__()
        self.page_url = page_url
        self.tag_stack = []
        self.unclosed_tags = []
        self.stray_closing_tags = []
        self.mismatched_tags = []
        
        # Elements tracked
        self.h1_count = 0
        self.h1_texts = []
        self.h2_count = 0
        self.h3_count = 0
        self.title_text = ""
        self.in_title = False
        self.in_h1 = False
        self.current_h1_text = ""
        
        self.meta_desc = None
        self.meta_keywords = None
        self.og_title = None
        self.og_image = None
        self.og_desc = None
        self.viewport = None
        self.canonical = None
        
        self.images = [] # dict with src, alt, style, issues
        self.links = [] # dict with href, text, issues
        self.forms = [] # dict with action, inputs_without_label, issues
        self.tables_count = 0
        
        self.raw_text_chunks = []
        self.current_a = None
        self.current_a_text = ""
        
        # Self closing tags in HTML
        self.void_tags = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}

    def handle_starttag(self, tag, attrs):
        attr_dict = {k.lower(): v for k, v in attrs}
        
        if tag not in self.void_tags:
            self.tag_stack.append(tag)
            
        if tag == 'title':
            self.in_title = True
        elif tag == 'h1':
            self.h1_count += 1
            self.in_h1 = True
            self.current_h1_text = ""
        elif tag == 'h2':
            self.h2_count += 1
        elif tag == 'h3':
            self.h3_count += 1
        elif tag == 'table':
            self.tables_count += 1
        elif tag == 'meta':
            name = attr_dict.get('name', '').lower()
            prop = attr_dict.get('property', '').lower()
            content = attr_dict.get('content', '')
            if name == 'description':
                self.meta_desc = content
            elif name == 'keywords':
                self.meta_keywords = content
            elif name == 'viewport':
                self.viewport = content
            elif prop == 'og:title':
                self.og_title = content
            elif prop == 'og:image':
                self.og_image = content
            elif prop == 'og:description':
                self.og_desc = content
        elif tag == 'link':
            rel = attr_dict.get('rel', '').lower()
            if rel == 'canonical':
                self.canonical = attr_dict.get('href', '')
        elif tag == 'img':
            src = attr_dict.get('src', '')
            alt = attr_dict.get('alt', None)
            style = attr_dict.get('style', '')
            width = attr_dict.get('width', '')
            height = attr_dict.get('height', '')
            
            img_issues = []
            if not src:
                img_issues.append("empty_src")
            elif src.endswith('.jpg650') or not re.search(r'\.(jpg|jpeg|png|gif|svg|webp)(\?.*)?$', src, re.I):
                img_issues.append(f"suspicious_src:{src}")
            if alt is None:
                img_issues.append("missing_alt")
            elif alt.strip() == "":
                img_issues.append("empty_alt")
            
            # check distortion
            if ('width' in style and 'height' in style) or (width and height):
                pass
                
            self.images.append({
                'src': src,
                'alt': alt,
                'issues': img_issues
            })
        elif tag == 'a':
            self.current_a = attr_dict
            self.current_a_text = ""
        elif tag == 'form':
            self.forms.append({
                'action': attr_dict.get('action', ''),
                'method': attr_dict.get('method', 'GET').upper(),
                'inputs': []
            })
        elif tag == 'input' and self.forms:
            input_type = attr_dict.get('type', 'text').lower()
            name = attr_dict.get('name', '')
            self.forms[-1]['inputs'].append({
                'type': input_type,
                'name': name,
                'id': attr_dict.get('id', '')
            })

    def handle_endtag(self, tag):
        if tag == 'title':
            self.in_title = False
        elif tag == 'h1':
            self.in_h1 = False
            self.h1_texts.append(self.current_h1_text.strip())
        elif tag == 'a' and self.current_a is not None:
            href = self.current_a.get('href', '')
            text = self.current_a_text.strip()
            link_issues = []
            if not href or href == '#' or href.startswith('javascript:'):
                link_issues.append("empty_or_hash_href")
            elif href.startswith('http:'):
                link_issues.append("insecure_http")
            # Raw unreadable link as anchor text
            if re.match(r'^https?://', text) and len(text) > 30:
                link_issues.append("raw_unreadable_url_text")
            # Local file or raw path
            if href.startswith('file://') or 'C:' in href or 'D:' in href:
                link_issues.append("local_file_leak")
            # Document link without details
            if re.search(r'\.(pdf|doc|docx|xls|xlsx|rar|zip)$', href, re.I):
                link_issues.append("raw_document_download")
                
            self.links.append({
                'href': href,
                'text': text[:100],
                'issues': link_issues
            })
            self.current_a = None
            self.current_a_text = ""
            
        if tag in self.void_tags:
            return
            
        if self.tag_stack:
            expected = self.tag_stack[-1]
            if expected == tag:
                self.tag_stack.pop()
            else:
                # Find if it is in stack
                if tag in self.tag_stack:
                    idx = len(self.tag_stack) - 1 - self.tag_stack[::-1].index(tag)
                    skipped = self.tag_stack[idx+1:]
                    for s in skipped:
                        self.unclosed_tags.append(s)
                    self.tag_stack = self.tag_stack[:idx]
                else:
                    self.stray_closing_tags.append(tag)
        else:
            self.stray_closing_tags.append(tag)

    def handle_data(self, data):
        if self.in_title:
            self.title_text += data
        if self.in_h1:
            self.current_h1_text += data
        if self.current_a is not None:
            self.current_a_text += data
        self.raw_text_chunks.append(data)

def audit_url(url, timeout=10):
    res = {
        'url': url,
        'status': None,
        'error': None,
        'content_type': None,
        'content_len': 0,
        'h1_count': 0,
        'h1_texts': [],
        'h2_count': 0,
        'title': '',
        'meta_desc': None,
        'meta_keywords': None,
        'og_title': None,
        'og_image': None,
        'viewport': None,
        'canonical': None,
        'unclosed_tags': [],
        'stray_closing_tags': [],
        'broken_images': [],
        'missing_alt_images_count': 0,
        'total_images_count': 0,
        'raw_links_count': 0,
        'raw_links': [],
        'http_links_count': 0,
        'empty_links_count': 0,
        'tables_count': 0,
        'forms_count': 0,
        'forms': [],
        'nbsp_spam_count': 0,
        'underscore_dividers_count': 0,
        'raw_modx_tags': [],
        'outdated_years_mentions': []
    }
    
    req = Request(url, headers=HEADERS)
    try:
        with urlopen(req, timeout=timeout, context=ctx) as response:
            res['status'] = response.status
            content_type = response.headers.get('Content-Type', '')
            res['content_type'] = content_type
            
            if 'text/html' not in content_type:
                # Might be image, pdf, etc.
                raw_bytes = response.read()
                res['content_len'] = len(raw_bytes)
                return res
                
            raw_html = response.read().decode('utf-8', errors='replace')
            res['content_len'] = len(raw_html)
            
            # Content pattern checks
            # 1. nbsp spam
            nbsp_matches = re.findall(r'(?:&nbsp;|\s){5,}', raw_html)
            res['nbsp_spam_count'] = len(re.findall(r'(&nbsp;\s*){4,}', raw_html))
            
            # 2. underscores dividers
            res['underscore_dividers_count'] = len(re.findall(r'_{10,}|-{10,}', raw_html))
            
            # 3. raw modx/joomla template tags
            modx_tags = re.findall(r'\[\[(?:\+|\*|~)[^\]]+\]\]|\{\$[^\}]+\}', raw_html)
            res['raw_modx_tags'] = list(set(modx_tags))[:10]
            
            # 4. Outdated years
            years = set()
            for y in ['2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023']:
                if re.search(r'\b' + y + r'\b', raw_html):
                    # Check if it is in context of admission / active regulations
                    if re.search(r'(?:прием|зачислени|первоклассник|документ|график|огэ|егэ)[^\.\n]{0,50}\b' + y, raw_html, re.I):
                        years.add(y)
            res['outdated_years_mentions'] = sorted(list(years))
            
            # Parse DOM
            parser = DetailedHTMLAuditor(url)
            try:
                parser.feed(raw_html)
                for t in parser.tag_stack:
                    parser.unclosed_tags.append(t)
            except Exception as pe:
                res['error'] = f"parser_error: {str(pe)}"
                
            res['h1_count'] = parser.h1_count
            res['h1_texts'] = parser.h1_texts
            res['h2_count'] = parser.h2_count
            res['title'] = parser.title_text.strip()
            res['meta_desc'] = parser.meta_desc
            res['meta_keywords'] = parser.meta_keywords
            res['og_title'] = parser.og_title
            res['og_image'] = parser.og_image
            res['viewport'] = parser.viewport
            res['canonical'] = parser.canonical
            res['tables_count'] = parser.tables_count
            res['forms_count'] = len(parser.forms)
            res['forms'] = parser.forms
            
            res['unclosed_tags'] = list(set(parser.unclosed_tags))
            res['stray_closing_tags'] = list(set(parser.stray_closing_tags))
            
            # Images
            res['total_images_count'] = len(parser.images)
            res['missing_alt_images_count'] = sum(1 for img in parser.images if 'missing_alt' in img['issues'] or 'empty_alt' in img['issues'])
            broken_imgs = [img['src'] for img in parser.images if any('suspicious' in i or 'empty' in i for i in img['issues'])]
            res['broken_images'] = broken_imgs
            
            # Links
            res['raw_links'] = [l['text'] for l in parser.links if 'raw_unreadable_url_text' in l['issues']][:5]
            res['raw_links_count'] = sum(1 for l in parser.links if 'raw_unreadable_url_text' in l['issues'])
            res['http_links_count'] = sum(1 for l in parser.links if 'insecure_http' in l['issues'])
            res['empty_links_count'] = sum(1 for l in parser.links if 'empty_or_hash_href' in l['issues'])
            
    except HTTPError as he:
        res['status'] = he.code
        res['error'] = f"HTTP {he.code}: {he.reason}"
    except URLError as ue:
        res['error'] = f"URL Error: {ue.reason}"
    except Exception as e:
        res['error'] = f"General Error: {str(e)}"
        
    return res

def main():
    if not os.path.exists(LINKS_FILE):
        print(f"File not found: {LINKS_FILE}")
        return
        
    with open(LINKS_FILE, 'r', encoding='utf-8') as f:
        urls = [line.strip() for line in f if line.strip() and line.strip().startswith('http')]
        
    # Deduplicate preserving order
    seen = set()
    unique_urls = []
    for u in urls:
        if u not in seen:
            seen.add(u)
            unique_urls.append(u)
            
    total = len(unique_urls)
    print(f"Total unique URLs to scan: {total}")
    
    results = []
    start_time = time.time()
    
    with ThreadPoolExecutor(max_workers=12) as executor:
        future_to_url = {executor.submit(audit_url, url): url for url in unique_urls}
        completed = 0
        for future in as_completed(future_to_url):
            completed += 1
            res = future.result()
            results.append(res)
            if completed % 50 == 0 or completed == total:
                elapsed = time.time() - start_time
                print(f"Progress: {completed}/{total} ({completed*100//total}%) in {elapsed:.1f}s")
                
    with open(OUTPUT_JSON, 'w', encoding='utf-8') as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
        
    print(f"Scan complete! Saved to {OUTPUT_JSON}")

if __name__ == '__main__':
    main()
