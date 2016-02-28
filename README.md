# zendesk-cli

A command line interface for ZenDesk admin tasks.

## Table of Contents

* [Install](#install)
* [Usage](#usage)
* [Setup](#setup)
* [Commands](#commands)
* [License](#license)

### Install
```
$ npm install -g zendesk-cli
```

### Usage

```
$ zd [options] [command]
```

### Setup 

Before running any commands, you'll need to set up the CLI with your ZenDesk credentials. This requires three pieces of information:

1. Your ZenDesk username
2. Your access token
3. The Remote URI for the API

Once you have this information, run the following command:

```
$ zd init <username> <token> <remoteUri>
```

### Commands

#### init
```
$ zd init <username> <token> <remoteUri>
```

See [Setup](#setup) for more information.

#### macro
```
$ zd macro [options]
```

Use this command to create, update, list, or open macros. By default, this command creates a new macro, unless you've specified `-u <macro_id>` (update macro), `-l` (list macros), or `-o [macro_id]` (open macro in browser).

Options:

Option | Argument | Description
------ | -------- | -----------
`-h, --help` |  | output usage information
`-t, --title` | `<title>` | Set title of macro
`-f, --file` | `<path>` | Path to comment text file
`-w, --write` | | Open editor to write comment content
`-T, --tags` | `<tags>` | Append tags (space delineated)
`-i, --inactive` | | Make macro inactive
`-p, --private` | | Set comment mode to private
`-l, --list` | | List all macros
`-u, --update` | `<macro_id>` | Update macro
`-o, --open` | `[macro_id]` | Open the macro in ZenDesk

### License

MIT