![Reuters](./badge.svg)

<br />
<img src="./logo.svg" width="300" alt="bluprint logo" />
<br />

The simplest way to scaffold new projects from GitHub templates.

<br />

[![npm version](https://badge.fury.io/js/%40reuters-graphics%2Fbluprint.svg)](https://badge.fury.io/js/%40reuters-graphics%2Fbluprint) [![Reuters open source software](https://badgen.net/badge/Reuters/open%20source/?color=ff8000)](https://github.com/reuters-graphics/)


## Why this?

Reusing good code is the easiest way to speed up your development time and share solid conventions across your team.

If you've used [Yeoman](https://yeoman.io/) or similar tools to build shareable templates, bluprint has a few advantages:

- It's far simpler for _anyone_ on your team to create a template regardless of what language they're comfortable working in.
- Your bluprint actually _looks like_ the boilerplate you'll start from, so it's easy to tell what your bluprint will do at a glance.
- bluprint's CLI pulls your template directly from GitHub, which means distributing your code is as easy as `git push`.

bluprint is designed to be a fast, accessible and highly composable tool to build out a library of reusable code.

### What's it do?

A bluprint is any GitHub repository you want to use as a template to scaffold out a new project. Just adding a `.bluprintrc` JSON file to the root of a repo makes it a bluprint.

Register bluprints you use regularly with the CLI.

When you start a new project, the CLI will download the latest tarball of your files from GituHub (public or private repos supported) and scaffold out your local directory. Then it will apply any custom actions defined in your `.bluprintrc` to transform your files.

bluprint [actions](#%EF%B8%8F-actions) can do complex things like move or rename files and folders, execute shell commands, ask users for input, render files through a templating engine to customize them for each project and more.

bluprint [parts](#-parts) let you split your template into segments that can help you keep files synced between projects already underway and your bluprint.


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

### Create a new bluprint

Creating a bluprint from existing code is as easy as adding a `.bluprintrc` JSON file to the root of your project and pushing to GitHub.

Use the `new` command to create your `.bluprintrc` in the root of the project you'd like to templatize:

```
$ bluprint new
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

Commit your project to GitHub with the `.bluprintrc` file.


### Add a bluprint to your CLI

To use your new bluprint, add it to your CLI using its GitHub repository.

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


If your repository is **private**, you can make sure the CLI has permission to access it by either:

1. Exporting a [personal access token](https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line) as the environment variable `GITHUB_TOKEN`:

  ```
  export GITHUB_TOKEN=<your personal access token>
  ```
2. Adding your personal access token directly to the CLI:

  ```
  $ bluprint token
  ```


### Using bluprints with the CLI

Create a fresh directory for your new project.

```
$ mkdir my-new-project
$ cd my-new-project
```

Scaffold your project from one of your bluprints:


```
$ bluprint start
```

The CLI will ask you to pick a bluprint and will guide you through providing any other information your bluprint needs to finish scaffolding your project.

You can also pass a GitHub repo directly to this command:

```
$ bluprint start <github repo>
```

### Remove a bluprint from your CLI

If you need to remove a bluprint from your CLI, you can:

```
$ bluprint remove
```

### Cloning repos

You can also use the CLI to directly clone a GitHub repo, without further processing the files as a bluprint:

```
$ bluprint clone <github repo>
```

You can clone any GitHub repo using this command, including private repos (with a GitHub personal access token) and regardless of whether it has a `.bluprintrc` config or not. This command basically duplicates the functionality you get from tools like [degit](https://github.com/Rich-Harris/degit).

## CLI commands

```
bluprint [command]

Commands:
  bluprint add [repo]           Add a new bluprint to your CLI
  bluprint clone <repo>         Clone a repo with bluprint
  bluprint new [name]           Create a new .bluprintrc file
  bluprint remove [bluprint]    Remove a bluprint from your CLI
  bluprint start [bluprint]     Start a new project from a bluprint
  bluprint token [accessToken]  Add a GitHub personal access token to your CLI

Options:
  --version  Show version number
  --help     Show help
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

`paths` is an array of arrays. Each inner array represents a move action. The first item in a move action represents the file or directory to be moved and the second, the destination. You can use the answers from a previous [prompt](#prompt) action in the destination string with [mustache](https://mustache.github.io/) template syntax:

```json
["moveme/code.js", "{{ someAnswer }}/code.js"]
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

This action lets you ask your users for more information that is then available to subsequent actions.

`questions` is an array of [prompts.js](https://github.com/terkelg/prompts) questions. The name of each question will be available in all actions that use templating syntax, like [render](#render), [log](#log), [move](#move) and [regexreplace](#regexreplace).

### regexreplace

```json
{
  "action": "regexreplace",
  "files": [
    "README.md"
  ],
  "replace": [
    ["color", "colour"],
    ["([0-9]{2})\/([0-9]{2})\/([0-9]{4})", "$2.$1.$3", "g"]
  ]
}
```

This action allows you to make replacements in files using regular expressions. The files array is a list of files in which to replace text. The first item in each replace array is a regular expression string; the second, a replacement string, which can use regex capture groups; and, optionally, a third to override [regex flags](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Advanced_searching_with_flags_2) (defaults to `gm`). You can also use the answers from a previous [prompt](#prompt) action in the replacement string with [mustache](https://mustache.github.io/) template syntax:

```
["^Name: .+$", "Name: {{ userName }}"]
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

There are also a few extra utility functions provided to your EJS and mustache templates from the [string](https://www.npmjs.com/package/string) package:  [`camelize`](https://www.npmjs.com/package/string#--camelize), [`capitalize`](https://www.npmjs.com/package/string#--capitalize), [`dasherize`](https://www.npmjs.com/package/string#--dasherize), [`humanize`](https://www.npmjs.com/package/string#--humanize), [`latinise`](https://www.npmjs.com/package/string#--latinise), [`slugify`](https://www.npmjs.com/package/string#--slugify), [`titleCase`](https://www.npmjs.com/package/string#--titlecase) and [`underscore`](https://www.npmjs.com/package/string#--underscore).

In EJS, you'd use them like:

```
<%= slugify(myVariable) %>
```

... and in mustache ...

```
{{#slugify}}{{myVariable}}{{/slugify}}
```

### Conditioning actions on prompt values

All actions can be conditionally run based on the answer to a previous prompt by adding a `condition` key to the action object:

```json
[
  {
    "action": "prompt",
    "questions": [{
      "type": "text",
      "name": "userName",
      "message": "What's your name?"
    }]
  },
  {
    "action": "log",
    "msg": "Hi, Jon!" ,
    "condition": ["userName", "Jon"]
  }
]
```

The first item in the array is the [string object path](https://lodash.com/docs/4.17.15#get) of the prompt variable name you want to test, the second is the value it should be. Any action that fails a condition test will be skipped.

```json
{
  "condition": ["myPromptVar", "some value"]  
}
```

You may also condition an action on multiple prompt values:

```json
{
  "condition": [
    ["myPromptVar", "some value"],
    ["myOtherVar", true]
  ]
}
```

## 📦 Parts

Sometimes it's handy to use just _a part_ of your bluprint. For example, you might want to update a few files in a project to sync up with changes added to the bluprint.

Parts make it possible to give your users the option to overwrite some files in a project scaffolded by your bluprint. Just add a `parts` object to your `.bluprintrc`. Each key should be the name of a part. The value should be an array of glob strings matching the files in your project that belong to that part.

```json
{
  "bluprint": "^0.0.1",
  "name": "My bluprint",
  "category": "",
  "actions": [],
  "parts": {
    "Config files": [
      "config/*",
      ".tasksrc"
    ],
    "JS components": [
      "src/js/components/*",
      "src/scss/component-styles/*"
    ]
  }
}
```

Now, when a user uses your bluprint, they'll be asked if they want to use the whole bluprint or just a part. If they choose a part, files matching any glob will be copied into the project directory. Those that don't will simply be ignored.

If you need to, you can make any action conditional on the part a user chooses using the `bluprintPart` context variable.

```json
{
  "condition": ["bluprintPart", "Config files"]  
}
```

If you want to run an action only when the _whole bluprint_ is used, you can test for `null`:

```json
{
  "condition": ["bluprintPart", null]  
}
```

## Developing

See the [developing doc](docs/developing.md).


## Credits

This project follows other newsroom-developed scaffolding tools, including [degit](https://github.com/Rich-Harris/degit), [create-clone](https://github.com/rdmurphy/create-clone) and [politico-interactive-templates](https://github.com/The-Politico/politico-interactive-templates).

The bluprint logo was created by MHD AZMI DWIPRANATA and is part of [The Noun Project](https://thenounproject.com/), available via creative commons license.
