![](logo.jpg)

Scaffold new projects from Github templates with custom actions.

## Quickstart

### Install

```
$ yarn add -g @reuters-graphics/bluprint
```
or

```
$ npm install -g @reuters-graphics/bluprint
```

### Use the CLI

1. Add a bluprint using a GitHub repository.

  ```
  $ bluprint add <user>/<project>
  ```

2. Start a new project using your bluprint.

  ```
  $ mkdir my-new-project
  $ cd my-new-project
  $ bluprint new
  ```

## Actions

Actions let you complete complex operations on your project repo after.

### execute

```json
{
  "action": "execute",
  "cmds": [
    ["yarn"],
  ],
}
```

### log

```json
{
  "action": "log",
  "msg": "Make your {green new} project!"
}
```

### move

```json
{
  "action": "move",
  "paths": [
    ["from/", "to/"],
    ["moveme.md", "moved.md"]
  ],
}
```

### prompt

```json
{
  "action": "prompt",
  "questions": [{
      "type": "text",
      "name": "projectName",
      "message": "What should we call this project?"
  }],
}
```

### remove

```json
{
  "action": "remove",
  "paths": [
    "dir/*",
    "README.md"
  ],
}
```

### render

```json
{
  "action": "render",
  "engine": "mustache",
  "files": ["READM.md"],
  "questions": [],
  "context": {
    "copyrightYear": "2020"
  }
}
```


## Priors

This project borrows from [degit](https://github.com/Rich-Harris/degit), [create-clone](https://github.com/rdmurphy/create-clone) and [politico-interactive-templates](https://github.com/The-Politico/politico-interactive-templates).


![Reuters](./badge.svg)
