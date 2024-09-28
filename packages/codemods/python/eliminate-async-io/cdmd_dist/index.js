# To see how to write a rule, check out the documentation at: https: //ast-grep.github.io/guide/rule-config.html
  id: test - ast - grep
language: bash - exp
rule:
  pattern: DATA_DIR = $A
fix: DATA_DIR = "/new/path/to/resources"