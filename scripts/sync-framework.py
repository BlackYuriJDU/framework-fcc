#!/usr/bin/env python3
"""Sincroniza o estado local do Vertexion Agent System com o repo framework-fcc via GitHub Git Trees API."""

import json
import base64
import os
import sys
import urllib.request
import urllib.error

REPO = "seu-usuario/framework-fcc"
BRANCH = "main"

# Read token from credentials file
with open(os.path.expanduser("~/.claude/framework-creds")) as f:
    cred_line = f.read().strip()
token = cred_line.split(":")[-1].replace("@github.com", "").strip()

HEADERS = {
    "Authorization": f"token {token}",
    "Content-Type": "application/json",
    "Accept": "application/vnd.github.v3+json",
}
API = "https://api.github.com"

def api_call(method, path, data=None):
    """Make a GitHub API call."""
    url = f"{API}{path}"
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=body, headers=HEADERS, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        err_body = e.read().decode()[:500]
        print(f"  ERROR {method} {path}: {e.code} {err_body}")
        sys.exit(1)

# --- Step 1: Get latest commit and tree ---
print("1. Getting current commit SHA...")
ref_data = api_call("GET", f"/repos/{REPO}/git/refs/heads/{BRANCH}")
commit_sha = ref_data["object"]["sha"]
print(f"   Latest commit: {commit_sha}")

commit_data = api_call("GET", f"/repos/{REPO}/git/commits/{commit_sha}")
base_tree_sha = commit_data["tree"]["sha"]
print(f"   Base tree: {base_tree_sha}")

# --- Step 2: Define what to sync ---
base_dir = os.path.expanduser("~/.claude")
vas_dir = os.path.join(base_dir, "vertexion-agent-system")

file_mappings = []

def add_dir(source_dir, repo_prefix, exclude=None):
    """Add all files from source_dir to repo_prefix path."""
    if exclude is None:
        exclude = []
    for root, dirs, files in os.walk(source_dir):
        dirs[:] = [d for d in dirs if d not in exclude]
        for f in files:
            src_path = os.path.join(root, f)
            rel_path = os.path.relpath(src_path, source_dir)
            repo_path = f"{repo_prefix}/{rel_path}" if repo_prefix else rel_path
            if any(part.startswith(".") for part in rel_path.split("/")):
                continue
            if "node_modules" in rel_path:
                continue
            file_mappings.append((src_path, repo_path))

# Agents
add_dir(os.path.join(base_dir, "agents"), "agents")

# Rules
add_dir(os.path.join(base_dir, "rules"), "rules")

# VAS root files
for item in os.listdir(vas_dir):
    item_path = os.path.join(vas_dir, item)
    if os.path.isfile(item_path) and not item.startswith("."):
        if item not in ("loop-run-log.md", "loop-cron.log"):
            file_mappings.append((item_path, item))

# VAS subdirectories
for subdir in os.listdir(vas_dir):
    subdir_path = os.path.join(vas_dir, subdir)
    if not os.path.isdir(subdir_path) or subdir.startswith(".") or subdir == "node_modules":
        continue
    exclude_dirs = ["node_modules", ".git"]
    if subdir == "state":
        exclude_dirs.append("control-center")
    if subdir == "reports":
        exclude_dirs.append("pipeline")
    add_dir(subdir_path, subdir, exclude=exclude_dirs)

print(f"2. Total files to sync: {len(file_mappings)}")

# --- Step 3: Create blobs for each file ---
print("3. Creating blobs...")
tree_items = []

for src_path, repo_path in sorted(file_mappings):
    try:
        with open(src_path, "rb") as f:
            content = f.read()
    except (IOError, OSError) as e:
        print(f"   SKIP {repo_path}: {e}")
        continue

    try:
        text = content.decode("utf-8")
        encoding = "utf-8"
        content_b64 = content
    except UnicodeDecodeError:
        encoding = "base64"
        content_b64 = base64.b64encode(content).decode()

    blob_data = {
        "content": content_b64.decode() if isinstance(content_b64, bytes) else content_b64,
        "encoding": encoding
    }
    blob_result = api_call("POST", f"/repos/{REPO}/git/blobs", blob_data)
    blob_sha = blob_result["sha"]

    mode = "100755" if repo_path.endswith(".sh") or repo_path.endswith(".mjs") else "100644"
    tree_items.append({"path": repo_path, "mode": mode, "type": "blob", "sha": blob_sha})

    if len(tree_items) % 50 == 0:
        print(f"   Processed {len(tree_items)}/{len(file_mappings)} blobs...")

print(f"   Total blobs created: {len(tree_items)}")

# --- Step 4: Create new tree ---
print("4. Creating tree...")
tree_result = api_call("POST", f"/repos/{REPO}/git/trees", {
    "base_tree": base_tree_sha,
    "tree": tree_items,
})
new_tree_sha = tree_result["sha"]
print(f"   New tree SHA: {new_tree_sha}")

# --- Step 5: Create commit ---
print("5. Creating commit...")
new_commit = api_call("POST", f"/repos/{REPO}/git/commits", {
    "message": "Sync: estado atual do Vertexion Agent System em 2026-07-28\n\n"
               "- Sub-director architecture: engineering-lead, growth-lead, product-lead\n"
               "- New agents: da-vinci, seu-projeto-activity\n"
               "- New scripts: edge-cdp, edge-control, edge-launch, edge-scroll, orq\n"
               "- Full agent bodies (replaces frontmatter-only shells)\n"
               "- Portfolio: only seu-projeto and seu-projeto-2\n"
               "- New dirs: knowledge/, orchestrators/\n"
               "- All rules and config synced from local runtime",
    "tree": new_tree_sha,
    "parents": [commit_sha],
})
new_commit_sha = new_commit["sha"]
print(f"   New commit: {new_commit_sha}")

# --- Step 6: Update branch ref ---
print("6. Updating branch ref...")
api_call("PATCH", f"/repos/{REPO}/git/refs/heads/{BRANCH}", {
    "sha": new_commit_sha,
    "force": False,
})
print(f"   Branch {BRANCH} updated!")

print("\nSync completo!")
