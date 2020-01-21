![Reuters](./badge.svg)

<br />
<img src="./logo.svg" width="300" alt="bluprint logo" />
<br />

Scaffold new projects from GitHub templates and process the files with custom actions.

<br />

[![npm version](https://badge.fury.io/js/%40reuters-graphics%2Fbluprint.svg)](https://badge.fury.io/js/%40reuters-graphics%2Fbluprint)


## Why this?

Reusing good code is the easiest way to speed up your dev time and share good practices across a team.

You may have used [Yeoman](https://yeoman.io/) or similar tools to build shareable templates. We have, too, but bluprint has two distinct benefits on our team: First, it's far simpler for anyone to create a template regardless of what languages they're comfortable working in. Second, bluprint's CLI pulls your template directly from GitHub, which means distributing your code is as easy as `git push`.

bluprint is a fast, user-friendly and highly composable tool to build out a library of reusable code for your team.

### What's it do?

A bluprint is a GitHub repository you want to use as a template to scaffold out your local directory. Just adding a `.bluprintrc` JSON file to the root of your repo makes it a bluprint.

The bluprint CLI lets you register bluprints you use regularly.

When you start a new project from a bluprint, the CLI will download the latest tarball of your files from GituHub (public or private repos supported) and scaffold out your local directory. Then it will apply any custom actions defined in your `.bluprintrc`.

bluprint actions can do complex things like move or rename files and folders, execute shell commands, ask users for input and render files through a templating engine to customize them for each project.

Best of all, bluprint makes creating templates for whatever project using whatever languages or frameworks you prefer easy for anyone. It's the fastest way to build a library of reusable code and helps enforce good development patterns on your team by starting each project from solid boilerplate. Because the bluprint CLI always pulls your latest code directly from GitHub, it's easy to keep improving your bluprints, too, and helps everyone who uses your code stay up-to-date with the latest and greatest.


## Quickstart

### Install

```
$ yarn global add @reuters-graphics/bluprint
```
or

```
$ npm install -g @reuters-graphics/bluprint
```

> This package supports the [latest active versions](https://nodejs.org/en/about/releases/) of node.

### Create a bluprint

Creating a bluprint from existing code is as easy as adding a `.bluprintrc` JSON file to the root of your project and pushing to GitHub.

The easiest way to create your `.bluprintrc` is to run the `make` command in the root of the directory you'd like to templatize:

```
$ bluprint make
```

That creates your `.bluprintrc`.

```json
{
  "bluprint": "^0.0.1",
  "name": "My bluprint",
  "category": "",
  "actions": []
}
```

Add a `category` if you like, which will be used in the CLI to group similar bluprints together.

`actions` can be added to process your bluprint files after scaffolding your directory. Read more in [Actions](#%EF%B8%8F-actions) and check out the [example bluprint](docs/example.md) to see what you can do.

Commit your project to GitHub with the `.bluprintrc` file. You now have a bluprint you and others can use with the CLI!




### Add a bluprint to your CLI

In order to use your new bluprint, you need to add it to your CLI using its GitHub repository.

```
$ bluprint add <github repo>
```

Your GitHub repo can be referenced using any of:

- the URL

  `https://github.com/reuters-graphics/my-bluprint`

- the ssh connect string

  `git@github.com:reuters-graphics/my-bluprint.git`

- the GitHub user/project shortcut

  `reuters-graphics/my-bluprint`


If your repository is private, be sure to export a [personal access token](https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line) as the environment variable `GITHUB_TOKEN` to access your bluprint:

```
export GITHUB_TOKEN=<your personal access token>
```

### Using bluprints with the CLI

Create a fresh directory for your new project.

```
$ mkdir my-new-project
$ cd my-new-project
```

Scaffold your project from one of your bluprints:


```
$ bluprint new
```

The CLI will ask you to pick a bluprint and will guide you through any other information your bluprint needs to finish scaffolding your project.

### Remove a bluprint from your CLI

If you need to remove a bluprint from your CLI, you can:

```
$ bluprint remove
```

## ⚙️ Actions

Actions let you orchestrate complex transformations of your files after your repository is pulled down. Each action is an object added to the `actions` array in your `.bluprintrc` file.

You can define as many actions as you like and they will be run in sequence when anyone uses your bluprint.


```javascript
{
  "bluprint": "^0.0.1",
  "name": "My bluprint",
  "category": "",
  "actions": [{
    "action": "prompt"
    // Runs first...
  }, {
    "action": "render"
    // Runs second...
  }, {
    "action": "log"
    // Runs last...
  }]
}
```

Check out the [example bluprint](docs/example.md) to see what you can do with actions.

Here are the actions the CLI currently supports:


### execute

```json
{
  "action": "execute",
  "cmds": [
    ["yarn"],
    ["git", ["init"]]
  ],
  "silent": true
}
```

This action executes arbitrary commands.

`cmds` are arrays passed as arguments to a synchronous [child process](https://nodejs.org/api/child_process.html#child_process_child_process_spawn_command_args_options).

In each array, the first item is a string representing the command. The second is an array passed to the command as arguments.

`silent` is an optional boolean argument that when true will suppress the output of the child process.

### log

```json
{
  "action": "log",
  "msg": "Finished creating your project!"
}
```

This action logs messages to your bluprint's users.

`msg` is a string.

The message is processed as a [chalk](https://github.com/chalk/chalk) [tagged template literal](https://github.com/chalk/chalk#tagged-template-literal) so you can easily add a bit of color to your messages:

```json
"Welcome to your {green new} project!"
```

You can also reference any context your users supplied in a previous [prompt](#prompt) action using [mustache](https://mustache.github.io/) template syntax:

```json
"Scaffolded your new project named {{ projectName }}!"
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

This action lets you move or rename files or directories.

`paths` is an array of arrays. Each inner array represents a move action. The first item in a move action represents the file or directory to be moved and the second, the destination.

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

This action lets you ask your users for more information that is then available to subsequent actions.

`questions` is an array of [prompts.js](https://github.com/terkelg/prompts) questions. The name of each question will be available in all actions that use templating syntax, like [render](#render) and [log](#log).

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

This action removes files or directories.

`paths` is an array of glob strings relative to the root of your project directory.

### render

```json
{
  "action": "render",
  "engine": "mustache",
  "files": ["README.md"],
  "questions": [],
  "context": {
    "copyrightYear": "2020"
  }
}
```

This action overwrites files after passing them through a templating engine with custom context.

`engine` is the templating engine to use. Can be either `"mustache"` or `"ejs"`.

`files` is an array of files to pass through the templating engine.

`questions` is an array of [prompts.js](https://github.com/terkelg/prompts) questions. The name of each question will be available *only in this action* as context to your template.

`context` is an object of any additional context to pass to your templates.

Remember, any answers to previous [prompt](#prompt) actions are also available as context to your templates. See the docs on [mustache](https://mustache.github.io/) and [EJS](https://ejs.co/) for more information on using their templating syntax in your files.

## Developing

See the [developing doc](docs/developing.md).


## Credits

This project borrows from other newsroom-developed scaffolding tools, including [degit](https://github.com/Rich-Harris/degit), [create-clone](https://github.com/rdmurphy/create-clone) and [politico-interactive-templates](https://github.com/The-Politico/politico-interactive-templates).

The bluprint logo was created by MHD AZMI DWIPRANATA and is part of [The Noun Project](https://thenounproject.com/), available via creative commons license.
