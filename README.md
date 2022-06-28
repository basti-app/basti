oclif-hello-world
=================

oclif example Hello World CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/oclif-hello-world.svg)](https://npmjs.org/package/oclif-hello-world)
[![CircleCI](https://circleci.com/gh/oclif/hello-world/tree/main.svg?style=shield)](https://circleci.com/gh/oclif/hello-world/tree/main)
[![Downloads/week](https://img.shields.io/npm/dw/oclif-hello-world.svg)](https://npmjs.org/package/oclif-hello-world)
[![License](https://img.shields.io/npm/l/oclif-hello-world.svg)](https://github.com/oclif/hello-world/blob/main/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g basti
$ basti COMMAND
running command...
$ basti (--version)
basti/0.0.0 darwin-x64 node-v16.15.0
$ basti --help [COMMAND]
USAGE
  $ basti COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`basti hello PERSON`](#basti-hello-person)
* [`basti hello world`](#basti-hello-world)
* [`basti help [COMMAND]`](#basti-help-command)
* [`basti plugins`](#basti-plugins)
* [`basti plugins:install PLUGIN...`](#basti-pluginsinstall-plugin)
* [`basti plugins:inspect PLUGIN...`](#basti-pluginsinspect-plugin)
* [`basti plugins:install PLUGIN...`](#basti-pluginsinstall-plugin-1)
* [`basti plugins:link PLUGIN`](#basti-pluginslink-plugin)
* [`basti plugins:uninstall PLUGIN...`](#basti-pluginsuninstall-plugin)
* [`basti plugins:uninstall PLUGIN...`](#basti-pluginsuninstall-plugin-1)
* [`basti plugins:uninstall PLUGIN...`](#basti-pluginsuninstall-plugin-2)
* [`basti plugins update`](#basti-plugins-update)

## `basti hello PERSON`

Say hello

```
USAGE
  $ basti hello [PERSON] -f <value>

ARGUMENTS
  PERSON  Person to say hello to

FLAGS
  -f, --from=<value>  (required) Whom is saying hello

DESCRIPTION
  Say hello

EXAMPLES
  $ oex hello friend --from oclif
  hello friend from oclif! (./src/commands/hello/index.ts)
```

_See code: [dist/commands/hello/index.ts](https://github.com/BohdanPetryshyn/basti/blob/v0.0.0/dist/commands/hello/index.ts)_

## `basti hello world`

Say hello world

```
USAGE
  $ basti hello world

DESCRIPTION
  Say hello world

EXAMPLES
  $ oex hello world
  hello world! (./src/commands/hello/world.ts)
```

## `basti help [COMMAND]`

Display help for basti.

```
USAGE
  $ basti help [COMMAND] [-n]

ARGUMENTS
  COMMAND  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.

DESCRIPTION
  Display help for basti.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v5.1.12/src/commands/help.ts)_

## `basti plugins`

List installed plugins.

```
USAGE
  $ basti plugins [--core]

FLAGS
  --core  Show core plugins.

DESCRIPTION
  List installed plugins.

EXAMPLES
  $ basti plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/v2.0.11/src/commands/plugins/index.ts)_

## `basti plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ basti plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.

  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.

ALIASES
  $ basti plugins add

EXAMPLES
  $ basti plugins:install myplugin 

  $ basti plugins:install https://github.com/someuser/someplugin

  $ basti plugins:install someuser/someplugin
```

## `basti plugins:inspect PLUGIN...`

Displays installation properties of a plugin.

```
USAGE
  $ basti plugins:inspect PLUGIN...

ARGUMENTS
  PLUGIN  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Displays installation properties of a plugin.

EXAMPLES
  $ basti plugins:inspect myplugin
```

## `basti plugins:install PLUGIN...`

Installs a plugin into the CLI.

```
USAGE
  $ basti plugins:install PLUGIN...

ARGUMENTS
  PLUGIN  Plugin to install.

FLAGS
  -f, --force    Run yarn install with force flag.
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Installs a plugin into the CLI.

  Can be installed from npm or a git url.

  Installation of a user-installed plugin will override a core plugin.

  e.g. If you have a core plugin that has a 'hello' command, installing a user-installed plugin with a 'hello' command
  will override the core plugin implementation. This is useful if a user needs to update core plugin functionality in
  the CLI without the need to patch and update the whole CLI.

ALIASES
  $ basti plugins add

EXAMPLES
  $ basti plugins:install myplugin 

  $ basti plugins:install https://github.com/someuser/someplugin

  $ basti plugins:install someuser/someplugin
```

## `basti plugins:link PLUGIN`

Links a plugin into the CLI for development.

```
USAGE
  $ basti plugins:link PLUGIN

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Links a plugin into the CLI for development.

  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.

EXAMPLES
  $ basti plugins:link myplugin
```

## `basti plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ basti plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ basti plugins unlink
  $ basti plugins remove
```

## `basti plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ basti plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ basti plugins unlink
  $ basti plugins remove
```

## `basti plugins:uninstall PLUGIN...`

Removes a plugin from the CLI.

```
USAGE
  $ basti plugins:uninstall PLUGIN...

ARGUMENTS
  PLUGIN  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Removes a plugin from the CLI.

ALIASES
  $ basti plugins unlink
  $ basti plugins remove
```

## `basti plugins update`

Update installed plugins.

```
USAGE
  $ basti plugins update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

DESCRIPTION
  Update installed plugins.
```
<!-- commandsstop -->
