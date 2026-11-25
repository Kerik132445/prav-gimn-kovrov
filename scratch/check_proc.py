import socket
import paramiko
import sys

HOST = "5.129.198.81"
USER = "root"
PASS = "gdwhW4K?Btv?2n"

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.settimeout(10)
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

session = t.open_session()
session.exec_command("ps aux | grep -E 'apt|dpkg|needrestart'; cat /etc/issue")
out = b""
while True:
    if session.recv_ready():
        out += session.recv(4096)
    if session.exit_status_ready() and not session.recv_ready():
        break

print(out.decode("utf-8", errors="ignore"))
t.close()
s.close()
