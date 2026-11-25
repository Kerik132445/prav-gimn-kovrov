import socket
import paramiko
import sys
import time

HOST = "5.129.198.81"
USER = "root"
PASS = "gdwhW4K?Btv?2n"

def run_ssh(cmd, timeout=300):
    print(f"[*] Running: {cmd[:100]}...")
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
    t.close()
    s.close()
    return status, stdout.decode("utf-8", errors="ignore"), stderr.decode("utf-8", errors="ignore")

if __name__ == "__main__":
    status, out, err = run_ssh("uname -a; whoami")
    print(f"Exit status: {status}")
