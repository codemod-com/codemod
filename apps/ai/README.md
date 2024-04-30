## Requirements
* NodeJS and NPM
* Python3.12

### Python Packages
```
pip install openai
```

### NPM Packages
```
npm install -g typescript
npm install -g typescript-formatter
npm install -g jscodeshift
```

### Environment Variables
In the root folder of the project, run the following:
```
export PYTHONPATH=`pwd`
export OPENAI_API_KEY="you openai key"
```

## Running the Codemod Generation from terminal
To generate a codemod using AI, and given a before and after pair, run the following command:
```
python3.12 iterative_ai.py --before_path tests/before.ts --after_path tests/after.ts --max_correction_attempts 3 --llm_engine gpt-4-turbo-preview --codemod_engine jscodeshift
```

## Running server
To install server dependencies
```
pip install "fastapi[all]"
```
To run server
```
uvicorn app:app
```
Server needs to run ***before*** frontend app is loaded (refresh the app once the connection with ws is established)

After each server crash a UI needs to be refreshed.

## Running the Evaluation
To run the evaluation on the full registry, run the following commands:
```
cd evaluate
cp -r codemod_testset_jscodeshift .temp_codemod
python3.12 eval.py
```
