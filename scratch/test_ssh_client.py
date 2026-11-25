import socket
import paramiko

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

client = paramiko.SSHClient()
client._transport = t
stdin, stdout, stderr = client.exec_command("ls -la /var/www/krytoi_site; ls -lh /tmp; ps aux | grep -E 'python|pip'")
print(stdout.read().decode("utf-8", errors="ignore"))
client.close()
s.close()
