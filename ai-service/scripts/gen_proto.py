"""Regenerate ai_service/grpc_gen from libs/shared/src/ai/ai.proto.

Uses grpc_tools.protoc for the pure-protobuf message classes (_pb2.py) and
grpclib's own plugin (protoc-gen-python_grpc) for the service stubs
(_grpc.py) -- grpclib is pure-Python (asyncio + h2), unlike grpcio's
_pb2_grpc.py output which imports the grpcio package and its compiled
cygrpc extension. Both generators emit a flat `import ai_pb2`, which breaks
once packaged under ai_service.grpc_gen -- rewritten to a relative import
below.
"""

import os
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PROTO_DIR = ROOT.parent / "backend" / "libs" / "shared" / "src" / "ai"
OUT_DIR = ROOT / "src" / "ai_service" / "grpc_gen"
VENV_SCRIPTS = ROOT / ".venv" / ("Scripts" if os.name == "nt" else "bin")

OUT_DIR.mkdir(parents=True, exist_ok=True)
(OUT_DIR / "__init__.py").touch()

env = os.environ.copy()
env["PATH"] = f"{VENV_SCRIPTS}{os.pathsep}{env['PATH']}"

subprocess.run(
    [
        sys.executable,
        "-m",
        "grpc_tools.protoc",
        f"--proto_path={PROTO_DIR}",
        f"--python_out={OUT_DIR}",
        f"--python_grpc_out={OUT_DIR}",
        f"--pyi_out={OUT_DIR}",
        str(PROTO_DIR / "ai.proto"),
    ],
    check=True,
    env=env,
)

for generated_file in OUT_DIR.glob("*_pb2.py"), OUT_DIR.glob("*_grpc.py"):
    for path in generated_file:
        text = path.read_text()
        text = re.sub(r"^import (\w+_pb2)$", r"from . import \1", text, flags=re.MULTILINE)
        path.write_text(text)
