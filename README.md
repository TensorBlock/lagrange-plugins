# LagrangeCloud plugins

Deploy an agent you built with Codex or Claude Code to LagrangeCloud without leaving Codex or Claude Code. The `lagrange` plugin reads your agent's folder (AGENTS.md or CLAUDE.md, skills, MCP servers, scripts), uploads it with the keys it needs, and gives you an API endpoint, a Playground and a chat widget for your site.

## Install

Codex:

```sh
codex plugin marketplace add https://github.com/TensorBlock/lagrange-plugins
codex plugin add lagrange@tensorblock
```

If you use the Codex app and have no `codex` command, run the same two lines with `npx -y @openai/codex` in place of `codex`. The app picks up the plugin from the same `~/.codex` folder.

Claude Code:

```sh
claude plugin marketplace add https://github.com/TensorBlock/lagrange-plugins
claude plugin install lagrange@tensorblock
```

The plugin needs Node 22 or later.

## Use

Open Codex or Claude Code in your agent's folder and ask it to deploy, for example "Deploy this agent to LagrangeCloud". In Claude Code you can also run `/lagrange:deploy`.

The plugin uses the production service at https://lgr.tensorblock.co. If you previously used staging, sign in to production when prompted; accounts, credit, and agents are separate between environments. To use staging or a self-hosted server, explicitly request its URL.

The first time, a browser page opens for you to sign in. Then it:

1. writes `lgr.yaml` from your folder and shows you what will be uploaded,
2. asks which of your own MCP servers the agent uses,
3. stores the keys those servers and scripts need as LagrangeCloud secrets, reading them on your machine without printing them,
4. deploys and sends the agent a test message,
5. if the agent is a recurring job, such as a daily review, asks when it should run and sets up the schedule,
6. gives you the console link.

The agent runs on the same harness you use, Codex or Claude Code. Lagrange, our own harness, is coming soon.

After you change the folder, ask again to deploy a new version. The endpoint and keys stay the same.

## Updates

The deploy steps and the `lgr` command line come from LagrangeCloud each time the plugin runs, so you get new releases without updating the plugin. The plugin itself rarely changes; to update it, run `claude plugin marketplace update tensorblock && claude plugin update lagrange@tensorblock` in Claude Code, or `codex plugin marketplace upgrade tensorblock && codex plugin add lagrange@tensorblock` in Codex.

These don't carry over: MCP servers on localhost, MCP servers you signed in to through the browser, and files not listed under `files:` in `lgr.yaml`. Add servers and keys by hand on the agent's page in the console, under **MCP servers and secrets**.

## Contents

- `lagrange/skills/deploy/SKILL.md`: tells Codex or Claude Code to run `lgr guide` and follow the steps it prints.
- `lagrange/skills/deploy/scripts/lgr.mjs`: a launcher that downloads the server's current command line (`lgr`) into `~/.cache/lgr` when it changes, then runs it.
