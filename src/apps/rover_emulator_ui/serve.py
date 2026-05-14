from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path


if __name__ == "__main__":
    root = Path(__file__).parent
    server = ThreadingHTTPServer(("127.0.0.1", 8091), SimpleHTTPRequestHandler)
    print(f"Serving rover emulator UI from {root} on http://127.0.0.1:8091")
    import os

    os.chdir(root)
    server.serve_forever()
