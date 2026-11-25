import socket, paramiko

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.settimeout(30)
s.connect(('5.129.198.81', 22))

banner = b''
while not banner.endswith(b'\n'):
    banner += s.recv(1)

t = paramiko.Transport(s)
t.remote_version = banner.decode('ascii', errors='ignore').strip()
t._check_banner = lambda: None
t.connect(username='root', password='gdwhW4K?Btv?2n')

client = paramiko.SSHClient()
client._transport = t
stdin, stdout, stderr = client.exec_command('ls -la /var/www/krytoi_site; ps aux | grep -E "pip|uvicorn"')
print(stdout.read().decode('utf-8', errors='ignore'))
client.close()
s.close()
