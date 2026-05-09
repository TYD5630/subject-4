import urllib.request, re, ssl
ssl_ctx = ssl.create_default_context()
ssl_ctx.check_hostname = False
ssl_ctx.verify_mode = ssl.CERT_NONE

url = 'https://www.cnblogs.com/GaoNa/p/17736591.html'
req = urllib.request.Request(url, headers={
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
})
resp = urllib.request.urlopen(req, context=ssl_ctx, timeout=15)
raw = resp.read().decode('utf-8', errors='replace')

# Extract article body
m = re.search(r'<div id="cnblogs_post_body"[^>]*>(.*?)</div>\s*<div id="blog_post_info_block"', raw, re.DOTALL)
if not m:
    m = re.search(r'<div id="cnblogs_post_body"[^>]*>(.*?)</div>', raw, re.DOTALL)
if m:
    text = re.sub(r'<[^>]+>', '\n', m.group(1))
    text = re.sub(r'&nbsp;', '', text)
    text = re.sub(r'\n{3,}', '\n\n', text)
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    print('\n'.join(lines))
