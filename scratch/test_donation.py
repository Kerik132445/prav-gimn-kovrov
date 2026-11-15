import http.server
import socketserver
import threading
import urllib.request
import time

PORT = 8011
Handler = http.server.SimpleHTTPRequestHandler

httpd = socketserver.TCPServer(('', PORT), Handler)
t = threading.Thread(target=httpd.serve_forever, daemon=True)
t.start()
time.sleep(0.5)

req = urllib.request.urlopen(f'http://localhost:{PORT}/index.html')
content = req.read().decode('utf-8')
print('Status:', req.status)
print('Has donation section:', 'id="donation"' in content)
print('Has donation.js:', 'js/donation.js' in content)
print('Has qr-donation.svg:', 'qr-donation.svg' in content)
print('Has copy buttons:', 'requisite-copy-btn' in content)
httpd.shutdown()
