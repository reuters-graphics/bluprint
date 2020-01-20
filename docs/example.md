![Reuters](../badge.svg)

<br />
<img src="../logo.svg" width="300" alt="bluprint logo" />
<br />

## Example bluprint

This bluprint copies a couple markdown files, removes one, moves another to take its place and renders it using some custom data input by a user.

### Bluprint repo

```
my-cool-bluprint/
  README.md
  README_project.md
  .bluprintrc
```

### Files


`README.md`

```markdown
# My cool bluprint

## Quickstart

Add this bluprint to your CLI ...
```

`README_project.md`
```markdown
# {{ projectName }}

## Quickstart
...
```

`.blurprintrc`

```json
{
  "bluprint": "^0.0.1",
  "name": "My cool bluprint",
  "category": "tools",
  "actions": [
    {
      "action": "prompt",
      "questions": [{
        "type": "text",
        "name": "projectName",
        "message": "What's the name of this project?"
      }]
    }, {
      "action": "remove",
      "paths": ["README.md"]
    }, {
      "action": "move",
      "paths": [
        ["README_project.md", "README.md"]
      ]
    }, {
      "action": "render",
      "engine": "mustache",
      "files": ["README.md"]
    }, {
      "action": "log",
      "msg": "Ready to start building {green {{ projectName }}}!"
    }
  ]
}
```

### Final files

```
my-new-project/
  README.md
```


`README.md`

```markdown
# My new project

## Quickstart
...
```
