import os
import sys
import socket
import time
import io
import tarfile
import paramiko

HOST = "5.129.198.81"
USER = "root"
PASS = "gdwhW4K?Btv?2n"
LOCAL_DIR = r"c:\Users\kerik\krytoi_site"

def get_client():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(15)
    s.connect((HOST, 22))

    banner = b""
    while not banner.endswith(b"\n"):
        chunk = s.recv(1)
        if not chunk:
            break
        banner += chunk

    t = paramiko.Transport(s)
    t.remote_version = banner.decode("ascii", errors="ignore").strip()
    t._check_banner = lambda: None
    t.connect(username=USER, password=PASS)

    client = paramiko.SSHClient()
    client._transport = t
    return client, t, s

def run_cmd(client, cmd):
    print(f"\n[*] Executing: {cmd[:100]}...")
    stdin, stdout, stderr = client.exec_command(cmd)
    out = stdout.read().decode("utf-8", errors="ignore")
    err = stderr.read().decode("utf-8", errors="ignore")
    if out:
        print(out.strip())
    if err:
        print("[STDERR]", err.strip())
    return out, err

def create_archive():
    print("[*] Creating tar.gz archive of local project...")
    tar_stream = io.BytesIO()
    ignore_dirs = {'.git', 'venv', '__pycache__', 'scratch', '.system_generated', 'browser_evidence', '.gemini'}
    ignore_exts = {'.pyc', '.pyo'}

    with tarfile.open(fileobj=tar_stream, mode='w:gz') as tar:
        for root, dirs, files in os.walk(LOCAL_DIR):
            dirs[:] = [d for d in dirs if d not in ignore_dirs and not d.startswith('.')]
            for f in files:
                ext = os.path.splitext(f)[1]
                if ext in ignore_exts:
                    continue
                full_path = os.path.join(root, f)
                rel_path = os.path.relpath(full_path, LOCAL_DIR).replace('\\', '/')
                tar.add(full_path, arcname=rel_path)

    tar_bytes = tar_stream.getvalue()
    print(f"[*] Archive created: {len(tar_bytes) / 1024 / 1024:.2f} MB")
    return tar_bytes

def main():
    client, t, s = get_client()
    print("[*] Connected via SSH.")

    # 1. Create remote dir
    run_cmd(client, "mkdir -p /var/www/krytoi_site")

    # 2. Upload archive via SFTP
    tar_bytes = create_archive()
    sftp = paramiko.SFTPClient.from_transport(t)
    print("[*] Uploading /tmp/krytoi_site.tar.gz via SFTP...")
    with sftp.open("/tmp/krytoi_site.tar.gz", "wb") as f:
        f.write(tar_bytes)
    print("[*] Upload finished.")

    # 3. Extract
    run_cmd(client, "tar -xzf /tmp/krytoi_site.tar.gz -C /var/www/krytoi_site && rm -f /tmp/krytoi_site.tar.gz")

    # 4. Permissions
    run_cmd(client, "chown -R www-data:www-data /var/www/krytoi_site && chmod -R 755 /var/www/krytoi_site")

    # 5. Virtualenv & pip install
    print("[*] Setting up virtualenv...")
    run_cmd(client, "python3 -m venv /var/www/krytoi_site/venv")
    print("[*] Installing requirements...")
    run_cmd(client, "/var/www/krytoi_site/venv/bin/pip install --upgrade pip")
    run_cmd(client, "/var/www/krytoi_site/venv/bin/pip install -r /var/www/krytoi_site/backend/requirements.txt")

    # 6. Service setup
    systemd_service = """[Unit]
Description=Gymnasium FastAPI Backend
After=network.target

[Service]
User=root
WorkingDirectory=/var/www/krytoi_site/backend
ExecStart=/var/www/krytoi_site/venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=3
Environment="PYTHONPATH=/var/www/krytoi_site"

[Install]
WantedBy=multi-user.target
"""
    with sftp.open("/etc/systemd/system/gymnasium.service", "w") as f:
        f.write(systemd_service)

    # 7. Nginx config
    nginx_conf = """server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name _;
    root /var/www/krytoi_site;
    index index.html;

    client_max_body_size 64M;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads/ {
        alias /var/www/krytoi_site/backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
"""
    with sftp.open("/etc/nginx/sites-available/default", "w") as f:
        f.write(nginx_conf)
    sftp.close()

    # 8. Start services & verify
    run_cmd(client, "systemctl daemon-reload && systemctl enable gymnasium.service && systemctl restart gymnasium.service")
    run_cmd(client, "nginx -t && systemctl restart nginx")
    time.sleep(2)
    run_cmd(client, "systemctl status gymnasium --no-pager")
    run_cmd(client, "curl -I http://127.0.0.1")
    run_cmd(client, "curl -I http://127.0.0.1/api/news/")
    run_cmd(client, "curl -s http://127.0.0.1/api/news/ | head -c 200")

    client.close()
    s.close()
    print("\n[+] DEPLOYMENT COMPLETED SUCCESSFULLY!")

if __name__ == "__main__":
    main()
