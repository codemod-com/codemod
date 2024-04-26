import os
import re
import subprocess

import common_utils

HOME_DIR = os.path.dirname(os.path.realpath(__file__))

def run_tsc(codemod_file):
  return subprocess.run(["tsc", "--noEmit", "--pretty", "false", "--esModuleInterop", "true", "--lib", "es2020", codemod_file], capture_output=True, text=True)

def parse_tsc_errors(tsc_output):
  error_pattern_matches = re.findall(r".*.ts\((.*),.*\): error TS.*: (.*)", tsc_output.stdout)
  return [{'line': int(match[0]) - 1, 'message': match[1]} for match in error_pattern_matches]

def retrieve_relevant_information(errors):
  with open(f'{HOME_DIR}/prompt_utils/types.txt', 'r') as f:
    types = f.read().splitlines()
  for error in errors:
    error_tokens = error['message'].split(' ')
    # if any line in types contains any token from the error message, then it is relevant
    error['relevant'] = any(any(token in type_line for token in error_tokens) for type_line in types)

def match_missing_property(errors, types, type_aliases):
  relevant_types = set()
  relevant_type_aliases = set()
  pattern = r"Property '(.*)' does not exist on type '(.*)'."
  for error in errors:
    match = re.match(pattern, error['message'])
    if match:
      property = match.group(1)
      type = match.group(2)
      for type_line in types:
        for token in property.split(' | ') + type.split(' | '):
          if token in type_line:
            relevant_types.add(type_line)
      for type_line in type_aliases:
        for token in [property] + type.split(' | '):
          if token in type_line:
            relevant_type_aliases.add(type_line)

  relevant_info = ""
  if len(relevant_types) > 0:
    relevant_info += "If any of the errors are caused by missing properties, use the following list of available types along with their properties:\n"
    for type in relevant_types:
      relevant_info += type + "\n"
  if len(relevant_type_aliases) > 0:
    relevant_info += "\n\nThe following lines are type aliases:\n"
    for type in relevant_type_aliases:
      relevant_info += type + "\n"
  return relevant_info

def retrieve_relevant_information(errors):
  with open(f'{HOME_DIR}/prompt_utils/types.txt', 'r') as f:
    types = f.read().splitlines()
  with open(f'{HOME_DIR}/prompt_utils/type_aliases.txt', 'r') as f:
    type_aliases = f.read().splitlines()

  return match_missing_property(errors, types, type_aliases)

def get_type_syntax_correction_prompt(errors, codemod, codemod_engine):
  prompt = "TypeScript compiler encountered the following error while compiling the codemod:\n"
  codemod_lines = codemod.splitlines()

  print("----> x")
  prompt += retrieve_relevant_information(errors)
  for error in errors:
    prompt += f"* Error {error['message']} in line {codemod_lines[error['line']].strip()}\n"
  prompt += "\nPlease modify the codemod to fix the error and provide the updated codemod.\n"

  return prompt

def get_not_expected_output_prompt(before_path, after_path, actual_after_path):
   prompt = "The codemod is supposed to transform the provided BEFORE code which is the following:\n"
   prompt += "\n\nBEFORE:\n"
   prompt += f"```\n{common_utils.load_source(before_path)}\n```\n"
   prompt += "\nto the following AFTER code snippet:\n"
   prompt += "\n\nAFTER:\n"
   prompt += f"```\n{common_utils.load_source(after_path)}\n```\n"
   prompt += "However, it transforms it to the following ACTUAL code instead:\n"
   prompt += "\n\nACTUAL:\n"
   prompt += f"```\n{common_utils.load_source(actual_after_path)}\n```\n"
   prompt += "Pay close attention to the differences between the AFTER and ACTUAL code snippets. Then, use them modify the codemod to correcrly perform the transformation and provide the updated codemod.\n"
   return prompt

def get_runtime_error_correction_prompt(error):
  prompt = "The codemod execution resulted in the following error:\n"
  prompt += f"{error}\n"
  prompt += "Please fix the codemod to avoid this error and provide the updated codemod."
  return prompt

def apply_codemod(codemod_path, source_path, codemod_engine):
  if codemod_engine == 'jscodeshift':
    exec_results = subprocess.run(["jscodeshift", "--fail-on-error", "--parser", "tsx", "-t", codemod_path, source_path], capture_output=True, text=True)
    if ' ERR ' in exec_results.stdout:
      error_relevant_part = exec_results.stdout[exec_results.stdout.find(' ERR '):exec_results.stdout.find('All done.')]

      impacted_codemod_line = ""
      with open(codemod_path) as f:
        codemod = f.read().splitlines()

      error_message = " ".join(error_relevant_part.split('\n', 1)[0].split(' ')[3:])

      if loc_match := re.findall(r"at .* \((.*):(.*):(.*)\)", error_relevant_part):
        for f, row, col in loc_match:
          if f == (abs_codemod_path := os.path.abspath(codemod_path)):
            impacted_codemod_line = codemod[int(row)-1].strip() + "\n"
            break

      if error_message and impacted_codemod_line:
        return error_message + " at the following line of codemod:\n" + f'```\n{impacted_codemod_line}\n```\n'

    return None

  raise NotImplementedError(f"Compiler error detection is not implemented for {codemod_engine}")
