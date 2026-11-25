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

sftp = paramiko.SFTPClient.from_transport(t)

files_to_sync = [
    (r"c:\Users\kerik\krytoi_site\admin\documents.js", "/var/www/krytoi_site/admin/documents.js"),
    (r"c:\Users\kerik\krytoi_site\js\documents.js", "/var/www/krytoi_site/js/documents.js"),
    (r"c:\Users\kerik\krytoi_site\js\calendar.js", "/var/www/krytoi_site/js/calendar.js"),
    (r"c:\Users\kerik\krytoi_site\backend\routes\auth.py", "/var/www/krytoi_site/backend/routes/auth.py")
]

for local_path, remote_path in files_to_sync:
    print(f"[*] Uploading {local_path} -> {remote_path}...")
    with open(local_path, "rb") as lf:
        sftp.putfo(lf, remote_path)

sftp.close()

client = paramiko.SSHClient()
client._transport = t
stdin, stdout, stderr = client.exec_command("chown -R www-data:www-data /var/www/krytoi_site && systemctl restart gymnasium.service")
print(stdout.read().decode('utf-8', errors='ignore'))
print(stderr.read().decode('utf-8', errors='ignore'))

client.close()
s.close()
print("[+] Sync completed successfully!")
