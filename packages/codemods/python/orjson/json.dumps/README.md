# Converts json.dumps to orjson.dumps().decode()

## Description
Converts json.dumps to orjson.dumps().decode().
Should be run `before` the `orjson.dumps-add-UTC_Z` codemod.

## Examples

### Before

```python
raw_data = json.load(dist_matched_artifact_index_release_file.file.getfile())
```

### After

```python
raw_data = orjson.loads(dist_matched_artifact_index_release_file.file.getfile().read())
```

