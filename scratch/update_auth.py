import socket, paramiko

HOST = "5.129.198.81"
USER = "root"
PASS = "gdwhW4K?Btv?2n"

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.settimeout(15)
s.connect((HOST, 22))

banner = b''
while not banner.endswith(b'\n'):
    banner += s.recv(1)

t = paramiko.Transport(s)
t.remote_version = banner.decode('ascii', errors='ignore').strip()
t._check_banner = lambda: None
t.connect(username=USER, password=PASS)

# SFTP upload backend/routes/auth.py
sftp = paramiko.SFTPClient.from_transport(t)
print("[*] Uploading backend/routes/auth.py...")
with open(r"c:\Users\kerik\krytoi_site\backend\routes\auth.py", "rb") as local_f:
    data = local_f.read()
    with sftp.open("/var/www/krytoi_site/backend/routes/auth.py", "wb") as remote_f:
        remote_f.write(data)
sftp.close()
print("[*] Uploaded.")

client = paramiko.SSHClient()
client._transport = t
stdin, stdout, stderr = client.exec_command("systemctl restart gymnasium.service && sleep 1 && systemctl status gymnasium --no-pager")
print(stdout.read().decode('utf-8', errors='ignore'))
print(stderr.read().decode('utf-8', errors='ignore'))

client.close()
s.close()
print("[+] Gymnasium restarted.")
