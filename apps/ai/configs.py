import os, sys
import openai
import argparse
import prompt_utils.jscodeshift
from dataclasses import dataclass
# OpenAI Cofigurations
openai.api_key = os.getenv('OPENAI_API_KEY')
openai_client = openai.OpenAI()

engine_utils = prompt_utils.jscodeshift
@dataclass
class CmdArgs:
  before_path: str = 'tests/before.ts'
  after_path: str = 'tests/after.ts'
  codemod_engine: str = 'jscodeshift'
  llm_engine: str = 'gpt-3.5-turbo'
  max_correction_attempts: int = 2
  seed: int = 7
  debug: bool = False

cmd_args= CmdArgs()

if __name__ == "__main__":
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

  # Codemod Engine Configurations
  if cmd_args.codemod_engine == 'jscodeshift':
    import prompt_utils.jscodeshift
    engine_utils = prompt_utils.jscodeshift
  else:
    print("Unsupported codemod engine:", cmd_args.codemod_engine)
    sys.exit()
