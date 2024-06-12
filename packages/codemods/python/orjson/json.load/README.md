This codemod converts json.load to orjson.loads. Adds `.read()` to the file object.

## Example

### Before

```python
raw_data = json.load(dist_matched_artifact_index_release_file.file.getfile())
```

### After

```python
raw_data = orjson.loads(dist_matched_artifact_index_release_file.file.getfile().read())
```

