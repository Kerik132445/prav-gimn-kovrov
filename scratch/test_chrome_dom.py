import subprocess
import time
import json
import http.server
import socketserver
import threading

PORT = 8992
Handler = http.server.SimpleHTTPRequestHandler
httpd = socketserver.TCPServer(('127.0.0.1', PORT), Handler)
t = threading.Thread(target=httpd.serve_forever, daemon=True)
t.start()
time.sleep(0.5)

# Run chrome headless with remote debugging or script
# Or simply use chrome --headless --disable-gpu --run-all-compositor-stages-before-draw --dump-dom
res = subprocess.run([
    r'C:\Program Files\Google\Chrome\Application\chrome.exe',
    '--headless=new',
    '--disable-gpu',
    '--window-size=1200,900',
    '--dump-dom',
    f'http://127.0.0.1:{PORT}/life.html'
], capture_output=True, timeout=10)

html = res.stdout.decode('utf-8', errors='ignore')
print("Dump DOM length:", len(html))
httpd.shutdown()
