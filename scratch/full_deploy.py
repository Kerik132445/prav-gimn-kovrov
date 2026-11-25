import os
import sys
import socket
import time
import paramiko
import tarfile
import io

HOST = "5.129.198.81"
USER = "root"
PASS = "gdwhW4K?Btv?2n"
LOCAL_DIR = r"c:\Users\kerik\krytoi_site"

def get_ssh_transport():
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(20)
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
    return t, s

def run_cmd(t, cmd, timeout=300):
    print(f"\n[*] Executing: {cmd[:120]}...")
    session = t.open_session()
    session.settimeout(timeout)
    session.exec_command(cmd)

    stdout = b""
    stderr = b""
    while True:
        if session.recv_ready():
            chunk = session.recv(4096)
            stdout += chunk
            sys.stdout.write(chunk.decode("utf-8", errors="ignore"))
            sys.stdout.flush()
        if session.recv_stderr_ready():
            chunk = session.recv_stderr(4096)
            stderr += chunk
            sys.stderr.write(chunk.decode("utf-8", errors="ignore"))
            sys.stderr.flush()
        if session.exit_status_ready() and not session.recv_ready() and not session.recv_stderr_ready():
            break
        time.sleep(0.1)

    status = session.recv_exit_status()
    session.close()
    return status, stdout.decode("utf-8", errors="ignore"), stderr.decode("utf-8", errors="ignore")

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
    t, s = get_ssh_transport()
    print("[*] Connected to Timeweb VPS.")

    # 1. Update apt and install dependencies
    setup_cmd = (
        "export DEBIAN_FRONTEND=noninteractive && "
        "apt update -y && "
        "apt install -y nginx python3-venv python3-pip curl && "
        "mkdir -p /var/www/krytoi_site"
    )
    status, _, _ = run_cmd(t, setup_cmd, timeout=300)
    if status != 0:
        print("[!] Setup failed!")
        return

    # 2. Upload archive via SFTP
    tar_bytes = create_archive()
    sftp = paramiko.SFTPClient.from_transport(t)
    print("[*] Uploading archive to /tmp/krytoi_site.tar.gz via SFTP...")
    with sftp.open("/tmp/krytoi_site.tar.gz", "wb") as remote_file:
        remote_file.write(tar_bytes)
    sftp.close()
    print("[*] Upload completed.")

    # 3. Extract and set permissions
    extract_cmd = (
        "tar -xzf /tmp/krytoi_site.tar.gz -C /var/www/krytoi_site && "
        "rm /tmp/krytoi_site.tar.gz && "
        "chown -R www-data:www-data /var/www/krytoi_site && "
        "chmod -R 755 /var/www/krytoi_site"
    )
    run_cmd(t, extract_cmd)

    # 4. Setup Python Virtualenv & Dependencies
    venv_cmd = (
        "python3 -m venv /var/www/krytoi_site/venv && "
        "/var/www/krytoi_site/venv/bin/pip install --upgrade pip && "
        "/var/www/krytoi_site/venv/bin/pip install -r /var/www/krytoi_site/backend/requirements.txt"
    )
    run_cmd(t, venv_cmd, timeout=300)

    # 5. Setup Gymnasium Systemd Service
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
    sftp = paramiko.SFTPClient.from_transport(t)
    with sftp.open("/etc/systemd/system/gymnasium.service", "w") as f:
        f.write(systemd_service)

    # 6. Setup Nginx Configuration
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

    # 7. Restart services and test
    restart_cmd = (
        "systemctl daemon-reload && "
        "systemctl enable gymnasium.service && "
        "systemctl restart gymnasium.service && "
        "nginx -t && "
        "systemctl restart nginx && "
        "sleep 2 && "
        "curl -I http://127.0.0.1 && "
        "curl -I http://127.0.0.1/api/news/"
    )
    status, _, _ = run_cmd(t, restart_cmd)
    print(f"\n[*] Final restart status: {status}")

    t.close()
    s.close()

if __name__ == "__main__":
    main()
