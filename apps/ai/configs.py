import os
import openai
import argparse
from dataclasses import dataclass

# OpenAI Cofigurations
openai.api_key = os.getenv('OPENAI_API_KEY')
openai_client = openai.OpenAI()

class CmdArgs:
  codemod_engine: str = 'jscodeshift'
  llm_engine: str = 'gpt-4-turbo-preview'
  max_correction_attempts: int = 3
  seed: int = 7
  debug: bool = False

cmd_args = CmdArgs()

def initialize_arguments():
  # Input Arguments
  parser = argparse.ArgumentParser(description='Codemod Assistant')

  parser.add_argument('--before_path', default="tests/before.ts", type=str, help='Path to before file')
  parser.add_argument('--after_path', default="tests/after.ts", type=str, help='Path to after file')
  parser.add_argument('--codemod_engine', default='jscodeshift', type=str, help='Codemod engine')
  parser.add_argument('--llm_engine', default=CmdArgs.llm_engine, type=str, help='LLM engine')
  parser.add_argument('--max_correction_attempts', default=CmdArgs.max_correction_attempts, type=int, help='Maximum number of attempts to fix syntax/type errors in the generated codemod')
  parser.add_argument('--seed', default=CmdArgs.seed, type=int, help='LLM seed to add some determinism')
  parser.add_argument('--debug', action='store_true', help='Debug mode')

  return parser.parse_args()

def get_codemod_engine(codemod_engine):
  if codemod_engine == 'jscodeshift':
     from prompt_utils import jscodeshift
     return jscodeshift
  raise NotImplementedError(f"Engine {codemod_engine} is not implemented")
