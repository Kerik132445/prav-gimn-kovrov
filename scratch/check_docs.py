import socket, paramiko

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.settimeout(15)
s.connect(('5.129.198.81', 22))
banner = b''
while not banner.endswith(b'\n'): banner += s.recv(1)
t = paramiko.Transport(s)
t.remote_version = banner.decode('ascii', errors='ignore').strip()
t._check_banner = lambda: None
t.connect(username='root', password='gdwhW4K?Btv?2n')

client = paramiko.SSHClient()
client._transport = t
cmd = """/var/www/krytoi_site/venv/bin/python3 -c "import sqlite3; conn=sqlite3.connect('/var/www/krytoi_site/backend/gymnasium.db'); cur=conn.cursor(); cur.execute('SELECT count(*) FROM documents'); print('DOCS COUNT:', cur.fetchone()); cur.execute('SELECT id, title, category FROM documents LIMIT 5'); print('SAMPLE DOCS:', cur.fetchall())" """
stdin, stdout, stderr = client.exec_command(cmd)
print("OUTPUT:", stdout.read().decode('utf-8', errors='ignore'))
print("ERR:", stderr.read().decode('utf-8', errors='ignore'))
client.close()
s.close()
