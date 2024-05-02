import configs
import llm_utils
import common_utils
import codemod_utils
import asyncio

def generate_draft_codemod(before, after, codemod_path, prompts_thread, llm_engine, codemod_engine):
  common_utils.remove(codemod_path)
  initial_prompt = configs.get_codemod_engine(codemod_engine).get_initial_prompt(before, after)
  prompts_thread.append(initial_prompt)
  llm_output = llm_utils.send_prompt_to_model(codemod_alternatives=None, prompts_thread=prompts_thread, llm_engine=llm_engine, codemod_engine=codemod_engine)
  return llm_utils.clean_llm_output(llm_output)

def get_compiler_errors(codemod_path, codemod_engine):
  if codemod_engine == 'jscodeshift':
    return codemod_utils.parse_tsc_errors(codemod_utils.run_tsc(codemod_path))
  raise NotImplementedError(f"Compiler error detection is not implemented for {codemod_engine}")

async def attempt_error_correction(before_source, after_source, actual_after_path, compiler_errors, runtime_errors, codemod_alternatives, prompts_thread, llm_engine, codemod_engine, logger):
  if runtime_errors:
    await logger({"execution_status":'in-progress', "message": 'Attempting to fix runtime errors...'})
    prompt = codemod_utils.get_runtime_error_correction_prompt(runtime_errors)
  elif compiler_errors:
    await logger({"execution_status":'in-progress', "message": 'Attempting to fix compiler errors...'})
    prompt = codemod_utils.get_type_syntax_correction_prompt(compiler_errors, codemod_alternatives[-1], codemod_engine=codemod_engine)
  else:
    await logger({"execution_status":'in-progress', "message": 'Attempting to fix unexpected output...'})
    prompt = codemod_utils.get_not_expected_output_prompt(before_source, after_source, actual_after_path)
  prompts_thread.append(prompt)
  llm_output = llm_utils.clean_llm_output(llm_utils.send_prompt_to_model(codemod_alternatives=codemod_alternatives, prompts_thread=prompts_thread, llm_engine=llm_engine, codemod_engine=codemod_engine))
  return llm_output if llm_output else codemod_alternatives[-1]

def test_generated_codemod(before_source, after_source, codemod_path, codemod_engine):
  actual_after_path = f'actual.{codemod_path}'
  common_utils.save_source(before_source, actual_after_path)
  exec_errors = codemod_utils.apply_codemod(codemod_path, actual_after_path, codemod_engine)
  compiler_errors = get_compiler_errors(codemod_path, codemod_engine)
  return common_utils.is_same_sources(after_source, common_utils.load_source(actual_after_path)), exec_errors, compiler_errors

async def generate_codemod(before_source, after_source, uid, max_correction_attempts, llm_engine, codemod_engine, logger):
    await logger({"execution_status": "in-progress",
        "message": "Sending the before and after code snippets to LLM. The following steps may take a while..."})

    prompts_thread = []

    await logger({"execution_status": "in-progress",
        "message": "Generating a draft codemod......"})

    codemod_path = f'codemod-{uid}.ts'
    codemod = generate_draft_codemod(before_source, after_source, codemod_path, prompts_thread, llm_engine, codemod_engine)
    common_utils.save_source(codemod, path=codemod_path)

    if max_correction_attempts == 0:
        await logger({"execution_status": "finished",
            "message": "Draft codemod generated."})
        common_utils.remove(codemod_path)
        return codemod
    else:
        await logger({"execution_status": "in-progress",
            "message": "Draft codemod in progress."})

    codemod_alternatives = [codemod]

    for i in range(max_correction_attempts):
        await logger({"execution_status": 'in-progress', "message": f'Attempt #{i+1} to refine the draft codemod...'})
        # apply the codemod
        actual_after_path = f'actual.{codemod_path}'
        is_same, exec_errors, compiler_errors = test_generated_codemod(before_source, after_source, codemod_path, codemod_engine)
        if is_same:
          if i == 0:
            await logger({"execution_status": 'finished', "message": f'The draft codemod is already correct.'})
          else:
            await logger({"execution_status": 'finished', "message": f'Attempt #{i+1} corrected the codemod.'})
          # The actual output is the same as the expected one. We are done!
          common_utils.remove(codemod_path)
          common_utils.remove(actual_after_path)
          return codemod
        else:
          # find out which error occurred and try to fix it
          try:
            codemod = await attempt_error_correction(before_source,
                                              after_source, actual_after_path,
                                              compiler_errors=compiler_errors,
                                              runtime_errors=exec_errors,
                                              codemod_alternatives=codemod_alternatives,
                                              prompts_thread=prompts_thread,
                                              llm_engine=llm_engine,
                                              codemod_engine=codemod_engine,
                                              logger=logger)
            common_utils.save_source(codemod, path=codemod_path)
            codemod_alternatives.append(codemod)
          except Exception as e:
            await logger({"execution_status": 'error', "message": f'An error occurred while attempting to refine the codemod.'})

    # if we reach here, we have used all the attempts
    # but we should still do a final check to see whether the last attempt fixed the issue
    is_same, exec_errors, compiler_errors = test_generated_codemod(before_source, after_source, codemod_path, codemod_engine)
    if is_same:
      await logger({"execution_status": 'finished', "message": f'Attempt #{max_correction_attempts} corrected the codemod.'})
    else:
      await logger({"execution_status": 'finished', "message": f'The model finished generating the codemod.'})
    common_utils.remove(codemod_path)
    common_utils.remove(actual_after_path)
    return codemod

async def logger(message):
    print(message)
async def main():
    configs.cmd_args = configs.initialize_arguments()
    result = await generate_codemod(
        before_source=common_utils.load_source(configs.cmd_args.before_path),
        after_source=common_utils.load_source(configs.cmd_args.after_path),
        uid=common_utils.gen_uid(),
        max_correction_attempts=configs.cmd_args.max_correction_attempts,
        llm_engine=configs.cmd_args.llm_engine,
        codemod_engine=configs.cmd_args.codemod_engine,
        logger=logger
    )
    print('result: ', result)

if __name__ == "__main__":
    asyncio.run(main())
