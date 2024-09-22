## What Changed

This codemod updates file formats to accept options that influence output creation, with the options now nested under the `options` property. In v3, these options were previously placed directly at the file properties level alongside the `destination` and `format` props.

## Before

```jsx
{
    "source": ["tokens.json"],
    "platforms": {
      "css": {
        "transformGroup": "scss",
        "files": [
          {
            "destination": "map.scss",
            "format": "scss/map-deep",
            "mapName": "tokens"
          }
        ]
      }
    }
  }
  
```

## After

```jsx
{
    "source": [
      "tokens.json"
    ],
    "platforms": {
      "css": {
        "transformGroup": "scss",
        "files": [
          {
            "destination": "map.scss",
            "format": "scss/map-deep",
            "options": {
              "mapName": "tokens"
            }
          }
        ]
      }
    }
  }
```
