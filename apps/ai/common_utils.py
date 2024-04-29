import re
import os
import uuid
import subprocess

import configs

def gen_uid():
  return str(uuid.uuid4())

def log(message):
  if configs.cmd_args.debug:
    print(message)

def remove(f):
  os.system(f'rm -rf "{f}"')

def make_dir(d):
  os.system(f'mkdir -p "{d}"')

def copy_file(src, dst):
  os.system(f'cp "{src}" "{dst}"')

def save_source(codemod, path):
    with open(path, 'w') as f:
        f.write(codemod)

def load_source(path):
    with open(path, 'r') as f:
        return f.read()

def format_source(source_path):
  return subprocess.run(["tsfmt", "-r", f'"{source_path}"'], capture_output=True)

def is_same_sources(src, dst):
  def normalize_source(s):
    return re.sub(r"\s+", "", s.replace('"', '\'').replace(';', '').replace(',', ''))
  return normalize_source(src) == normalize_source(dst)
