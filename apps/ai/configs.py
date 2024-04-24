import os, sys
import openai
import argparse

# Input Arguments
parser = argparse.ArgumentParser(description='Codemod Assistant')

parser.add_argument('--before_path', type=str, help='Path to before file')
parser.add_argument('--after_path', type=str, help='Path to after file')
parser.add_argument('--codemod_engine', default='jscodeshift', type=str, help='Codemod engine')
parser.add_argument('--llm_engine', default='gpt-3.5-turbo', type=str, help='LLM engine')
parser.add_argument('--max_correction_attempts', default=2, type=int, help='Maximum number of attempts to fix syntax/type errors in the generated codemod')
parser.add_argument('--seed', default=7, type=int, help='LLM seed to add some determinism')
parser.add_argument('--debug', action='store_true', help='Debug mode')

cmd_args = parser.parse_args()

# OpenAI Cofigurations
openai.api_key = os.getenv('OPENAI_API_KEY')
openai_client = openai.OpenAI()

# Codemod Engine Configurations
if cmd_args.codemod_engine == 'jscodeshift':
  import prompt_utils.jscodeshift
  engine_utils = prompt_utils.jscodeshift
else:
  print("Unsupported codemod engine:", cmd_args.codemod_engine)
  sys.exit()
