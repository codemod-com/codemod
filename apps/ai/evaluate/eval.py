import os
import tqdm 

import iterative_ai
import common_utils

TEMP_DIR = ".codemod_temp"

def initialize():
    common_utils.remove(TEMP_DIR)
    common_utils.make_dir(TEMP_DIR)
    # only get the folder of codemods
    if not os.path.exists("codemod-registry"):
        os.system("git clone https://github.com/codemod-com/codemod")
        os.system("cp -r codemod/packages/codemods codemod-registry")
        common_utils.remove("codemod")

def extract_between_backticks(text, min_length=30):
    results = []
    start_index = None
    escaped = False  # Flag to track if the previous character was a backslash

    for i, char in enumerate(text):
        if char == '\\':
            escaped = True  # A backslash was encountered
        elif char == '`' and not escaped:  # Check for a non-escaped backtick
            if start_index is None:
                start_index = i + 1
            else:
                content = text[start_index:i]
                if len(content) > min_length:
                    results.append(content)
                start_index = None
        else:
            escaped = False  # Reset the escaped flag 

    return results

def has_expected_test_structure(test_content):
    return (('const input' in test_content and 'const output' in test_content) or \
           ('const INPUT' in test_content and 'const OUTPUT' in test_content) or \
           ('const A_CONTENT' in test_content and 'const expectedResult' in test_content) or \
           ('const beforeText' in test_content and 'const afterText' in test_content)) and \
           ('const LOCALE_CONTENT' not in test_content)

# extract before/after snippets from a test fixture
# this function is approximate. In some cases, the test files may not have the expected structure.
# In such cases, the snippets may not be extracted correctly and a manual intervention may be needed.
def extract_snippets(test_path):
    befores = []
    afters = []
    with open(test_path, 'r') as f:
        content = f.read()

        # check if the test file has the expected structure
        if not has_expected_test_structure(content):
            return befores, afters

        snippets = extract_between_backticks(content)
        for idx, snippet in enumerate(snippets):
            snippet = snippet.replace('\\`', '`').strip()
            if idx % 2 == 0:
                befores.append(snippet)
            else:
                afters.append(snippet)
    assert len(befores) == len(afters), f"Unequal number of before/after snippets in {test_path}"
    return befores, afters

def extract_snippets_from_test_files(format=True):
    # get all the before and after snippets from the test files
    all_tests = {}
    print("Extracting before/after snippets from test files. This may take a while...")
    for root, dirs, _ in tqdm.tqdm(os.walk("codemod-registry")):
        if 'test' in dirs and 'src' in dirs:
            test_path = os.path.join(root, 'test', 'test.ts')
            befores, afters = extract_snippets(test_path)

            if befores and afters:
                all_tests[test_path] = (befores, afters)
                test_path_convert = test_path.replace("/", "_")
                common_utils.make_dir(f"{TEMP_DIR}/{test_path_convert}")
                for idx, (before, after) in enumerate(zip(befores, afters)):
                    common_utils.save_source(before, f"{TEMP_DIR}/{test_path_convert}/before{idx}.ts")
                    common_utils.save_source(after, f"{TEMP_DIR}/{test_path_convert}/after{idx}.ts")
                    if format:
                        common_utils.format_source(f"{TEMP_DIR}/{test_path_convert}/before{idx}.ts")
                        common_utils.format_source(f"{TEMP_DIR}/{test_path_convert}/after{idx}.ts")
    
    print(f"Found {len(all_tests)} samples with before/after snippets.")

def generate_codemods(max_correction_attempts, llm_engine, codemod_engine):
    print(f"Generating codemods for the registry: {TEMP_DIR}")
    print(f"Max correction attempts: {max_correction_attempts}")
    print(f"LLM Engine: {llm_engine}")
    print(f"Codemod Engine: {codemod_engine}")

    # evaluate the codemod generation via AI
    print("Generating codemods via AI. This may take a while...")
    for dirs in tqdm.tqdm(sorted(os.listdir(TEMP_DIR))):
        sample_path = os.path.join(TEMP_DIR, dirs)
        if not os.path.isdir(sample_path):
            continue
        for f in os.listdir(sample_path):
            if f.startswith("before"):
                before_path = os.path.join(sample_path, f)
                after_path = before_path.replace("before", "after")
                codemod_path = before_path.replace("before", "codemod")
                iterative_ai.generate_codemod(before_path, after_path, codemod_path,
                                              max_correction_attempts=max_correction_attempts,
                                              llm_engine=llm_engine, codemod_engine=codemod_engine)

def check_end_to_end(codemod_engine):
    common_utils.remove('issues.txt')
    correct_count = 0
    incorrect_count = 0
    exec_error_count = 0
    compiler_error_count = 0
    different_count = 0
    for dirs in tqdm.tqdm(sorted(os.listdir(TEMP_DIR))):
        sample_path = os.path.join(TEMP_DIR, dirs)
        if not os.path.isdir(sample_path):
            continue
        for f in sorted(os.listdir(sample_path)):
            try:
                if f.startswith("before"):
                    before_path = os.path.join(sample_path, f)
                    after_path = before_path.replace("before", "after")
                    codemod_path = before_path.replace("before", "codemod")
                    actual_after_path = before_path.replace("before", "actual_after")

                    is_same, exec_errors, compiler_errors = iterative_ai.test_generated_codemod(before_path, after_path, codemod_path, actual_after_path, codemod_engine)
                    if is_same:
                        correct_count += 1
                    else:
                        incorrect_count += 1
                        if exec_errors:
                            exec_error_count += 1
                            with open('issues.txt', 'a') as f:
                                f.write("EXEC: " + before_path + ":" + exec_errors.splitlines()[0] + '\n')
                        elif len(compiler_errors) > 0:
                            compiler_error_count += 1
                            with open('issues.txt', 'a') as f:
                                f.write("COMPILER:" + before_path + ":" + compiler_errors[0]['message'] + '\n')
                        else:
                            different_count += 1
                            with open('issues.txt', 'a') as f:
                                f.write("DIFFERENT OUTPUT: " + before_path + '\n')
            except Exception as e:
                print(f"EXCEPTION in {before_path}: {e}")

    print(f"Correct: {correct_count}, Incorrect: {incorrect_count}, Accuracy: {correct_count/(correct_count+incorrect_count)*100:.2f}%")
    print("Error Breakdown:")
    print(f"  Execution Errors: {exec_error_count}")
    print(f"  Compiler Errors: {compiler_error_count}")
    print(f"  Different Output: {different_count}")

if __name__ == "__main__":
    # configs
    number_max_correction_attempts = 2
    llm_engine = 'gpt-4'
    codemod_engine = 'jscodeshift'

    # do NOT call the following two functions unless there are major changes in the registry
    #initialize()
    #extract_snippets_from_test_files()

    # running the codemod generation on the registry
    os.system('cp -r codemod_testset_jscodeshift .codemod_temp')
    generate_codemods(number_max_correction_attempts, llm_engine, codemod_engine)

    # evaluate the generated codemods
    check_end_to_end(codemod_engine)
