This recipe is a set of codemods that will upgrade json to orjson in your python projects.

The recipe includes the following codemods:

-   [python/orjson/json.dumps](https://github.com/codemod-com/codemod/tree/main/packages/codemods/python/orjson/json.dumps)
-   [python/orjson/json.load](https://github.com/codemod-com/codemod/tree/main/packages/codemods/python/orjson/json.load)
-   [python/orjson/json.loads](https://github.com/codemod-com/codemod/tree/main/packages/codemods/python/orjson/json.loads)
-   [python/orjson/dumps-add-UTC_Z](https://github.com/codemod-com/codemod/tree/main/packages/codemods/python/orjson/orjson.dumps-add-UTC_Z)
-   [python/orjson/sentry-import-replacement](https://github.com/codemod-com/codemod/tree/main/packages/codemods/python/orjson/sentry-import-replacement)

```python
import orjson

raw_data = orjson.loads(dist_matched_artifact_index_release_file.file.getfile().read())
orjson.dumps(content_as_json, option=orjson.OPT_UTC_Z)
raw_data = orjson.loads(data)
```