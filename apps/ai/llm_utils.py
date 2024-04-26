import configs

def ensure_code_response(answer):
  # the following code markers only work for jscodeshift. For other codemod engines, we need to update this function.
  code_markers = ["import", "from 'jscodeshift'", ";", "transform"]
  return all(marker in answer for marker in code_markers)

def send_prompt_to_model(codemod_alternatives, prompts_thread, llm_engine):
    messages = [{"role": "system", "content": configs.engine_utils.system_instructions},
                {"role": "user", "content": prompts_thread[0]}]

    if codemod_alternatives:
      for idx in range(len(codemod_alternatives)):
        messages.append({"role": "assistant", "content": f"```typescript\n{codemod_alternatives[idx]}\n```\n"})
        messages.append({"role": "user", "content": prompts_thread[idx + 1]})

    response = configs.openai_client.chat.completions.create(
      model=llm_engine,
      messages=messages,
      seed=configs.cmd_args.seed,
      temperature=0.001,
      n=1,
      timeout=60
    )

    return response.choices[0].message.content

def clean_llm_output(raw_output):
  if '```' not in raw_output:
    if 'import' not in raw_output:
      return None
    return raw_output
  return raw_output[raw_output.find('```'):raw_output.rfind('```')].replace('```typescript', '').replace('```javascript', '').replace('```js', '').replace('```ts', '').replace('```', '')
