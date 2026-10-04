from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import subprocess
import tempfile
import os
import uuid
import re

# POSIX kernel resource limiting (Linux VPS & macOS)
try:
    import resource
    HAS_RESOURCE = True
except ImportError:
    HAS_RESOURCE = False

app = FastAPI(title="Sandboxed IBM Fortran Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ExecuteRequest(BaseModel):
    cards: List[str]
    stdin: Optional[str] = ""

class ExecuteResponse(BaseModel):
    output: str
    is_error: bool

# Prohibited keywords to block host escape / shell execution
FORBIDDEN_PATTERNS = [
    r"\bSYSTEM\b",
    r"\bEXECUTE_COMMAND_LINE\b",
    r"\bISO_C_BINDING\b",      # Blocks C FFI / arbitrary syscall injection
    r"\bOPEN\b",               # Prevents unauthorized filesystem writes
    r"\bINQUIRE\b",
    r"\bPOSIX\b",
    r"\bFORK\b",
]

def apply_kernel_limits():
    """Restricts CPU time, RAM, and disk writes for the child process."""
    if not HAS_RESOURCE:
        return
    # Max 2 seconds of pure CPU time
    resource.setrlimit(resource.RLIMIT_CPU, (2, 2))
    # Max 512 MB of virtual address space for user binaries
    resource.setrlimit(resource.RLIMIT_AS, (512 * 1024 * 1024, 512 * 1024 * 1024))
    # Max 1 MB file creation size (prevents disk-filling attacks)
    resource.setrlimit(resource.RLIMIT_FSIZE, (1024 * 1024, 1024 * 1024))
    # Note: RLIMIT_NPROC is omitted to avoid blocking user process spawning on Linux

@app.post("/api/run", response_model=ExecuteResponse)
def run_fortran_deck(req: ExecuteRequest):
    full_source = "\n".join(card.rstrip() for card in req.cards) + "\n"

    # 1. Static Security Check
    for pattern in FORBIDDEN_PATTERNS:
        if re.search(pattern, full_source, re.IGNORECASE):
            return ExecuteResponse(
                output=f"SECURITY VIOLATION: Statement matches restricted keyword rule: '{pattern.strip(r'\\b')}'. Direct host access prohibited.",
                is_error=True
            )

    job_id = str(uuid.uuid4())
    temp_dir = tempfile.gettempdir()
    src_file = os.path.join(temp_dir, f"{job_id}.f")
    bin_file = os.path.join(temp_dir, f"{job_id}.exe" if os.name == "nt" else job_id)

    with open(src_file, "w") as f:
        f.write(full_source)

    try:
        # 2. Compile safely (no kernel limits applied to gfortran compiler driver)
        compile_res = subprocess.run(
            ["gfortran", "-O2", src_file, "-o", bin_file],
            capture_output=True,
            text=True,
            timeout=8
        )

        if compile_res.returncode != 0:
            return ExecuteResponse(output=compile_res.stderr.strip(), is_error=True)

        # 3. Execute with strict sandboxing and minimal environment
        if os.name == "nt":
            clean_env = {
                "PATH": os.environ.get("PATH", ""),
                "SystemRoot": os.environ.get("SystemRoot", r"C:\Windows"),
            }
        else:
            clean_env = {"PATH": "/usr/bin:/bin"}
        run_res = subprocess.run(
            [bin_file],
            input=req.stdin,
            capture_output=True,
            text=True,
            timeout=2.5,
            env=clean_env,
            preexec_fn=apply_kernel_limits if HAS_RESOURCE else None
        )

        output = run_res.stdout if run_res.returncode == 0 else run_res.stderr
        output = output.strip() if output else "[PROGRAM TERMINATED NORMALLY WITH NO OUTPUT]"

        # Cap output size to 4,000 chars to protect browser printer buffer
        if len(output) > 4000:
            output = output[:4000] + "\n... [OUTPUT TRUNCATED: BUFFER EXCEEDED]"

        return ExecuteResponse(
            output=output,
            is_error=(run_res.returncode != 0)
        )

    except subprocess.TimeoutExpired:
        return ExecuteResponse(
            output="EXECUTION HALTED: Time-limit exceeded (Possible infinite loop). Max 2.5s CPU.",
            is_error=True
        )
    except FileNotFoundError:
        return ExecuteResponse(
            output="SYSTEM FAULT: 'gfortran' compiler not located in host PATH.",
            is_error=True
        )
    finally:
        for path in [src_file, bin_file]:
            if os.path.exists(path):
                try:
                    os.remove(path)
                except OSError:
                    pass

@app.get("/health")
def health():
    return {"status": "online", "sandboxing": "active" if HAS_RESOURCE else "keyword_only"}