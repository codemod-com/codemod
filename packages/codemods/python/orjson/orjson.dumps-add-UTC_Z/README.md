# Add OPT_UTC_Z to orjson.dumps

## Description
Add OPT_UTC_Z to orjson.dumps.

## Examples

### Before

```python
orjson.dumps(content_as_json)
```

### After

```python
orjson.dumps(content_as_json, option=orjson.OPT_UTC_Z)
```

