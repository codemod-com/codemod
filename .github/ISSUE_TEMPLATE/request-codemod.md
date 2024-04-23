---
name: Request codemod
about: Request a new codemod from the community
title: '[codemod request] example codemod'
labels: codemod request
assignees: ''
---

:warning::warning: Please do not include any proprietary code in the issue. :warning::warning:

---

### Codemod name


### Codemod description


### Code before transformation

```
//insert your code before transformation here
```

### Code after transformation

```
//insert the expected **correct** output here
```

### Codemod engine
jscodeshift, ast-grep, ts-morph, filemod, piranha

### file extensions to process
["**/*.js"]

### Applicability Criteria
the patterns that codemod wants to detect can be found in projects in the below range
from: [["react", ">", "17.0.0"], ["react", "<", "17.1.9"]],
      
what is the earliest version of the package where the new pattern is introdued?
to: ["react", "=", "18.0.0"]

### post commands - installing/unsintalling packages
when this codemod is run, does user need to install or uninstall some packages?
["-jest", "vitest@2.0.0"]
    

### Codemod arguments
if your codemod needs some user inputs define the arguments here
"arguments": [
      {
        "name": "arg1",
        "description": "Arg number one",
        "kind": "string",
        "required": false
      }
    ]

### tags for discovery
which tags should be applied to this codemod to make it easily discoverable?
["react", "migration"]

### Codemod source URL
where is the source of this codemod reside?
"git": "https://github.com/codemod-com/codemod"
    
### Additional context or links
Add any other context about the problem here. This might include extra considerations, edge cases, relevant business logic, existing migration guides, relevant links, etc.
