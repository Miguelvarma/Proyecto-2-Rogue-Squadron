import subprocess
import sys
import os
import webbrowser
import time
import threading

def run_backend():
    subprocess.run([
        sys.executable, "-m", "uvicorn", "main:app",
        "--reload", "--port", "8000"
    ])

def run_frontend():
    os.chdir("frontend")
    subprocess.run([sys.executable, "-m", "http.server", "3000"])

if __name__ == "__main__":
    print("⚔  Iniciando THE NEXUS BATTLES V — Chatbot")
    print("   Backend  → http://localhost:8000")
    print("   Frontend → http://localhost:3000")
    print("   Presiona CTRL+C para detener todo\n")

    threading.Thread(target=run_backend,  daemon=True).start()
    threading.Thread(target=run_frontend, daemon=True).start()

    time.sleep(2)
    webbrowser.open("http://localhost:3000")

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n⚔  Servidores detenidos.")