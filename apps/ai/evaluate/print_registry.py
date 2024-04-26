import os, sys


TEMP_DIR = '.codemod_temp'

def codify(c):
    return f'```\n{c}\n```\n'



for dirs in sorted(os.listdir(TEMP_DIR)):
    sample_path = os.path.join(TEMP_DIR, dirs)
    if not os.path.isdir(sample_path):
        continue
    for f in os.listdir(sample_path):
        if f.startswith("before"):
            before_path = os.path.join(sample_path, f)
            after_path = before_path.replace("before", "after")
            with open(before_path, 'r') as f:
                print(codify(f.read()))
            with open(after_path, 'r') as f:
                print(codify(f.read()))
