---
name: deploy
description: Deploy the agent in the current folder to LagrangeCloud, which runs it in the cloud behind an API endpoint, a Playground and a chat widget. Use when the user wants to deploy, host or publish this agent, put it online, or update a deployed one.
---

# Deploy this agent to LagrangeCloud

The agent is what this folder gives you: AGENTS.md or CLAUDE.md, skills, MCP servers, and the scripts and data they use. Deploying uploads it, and LagrangeCloud runs it on Codex or Claude Code in a cloud sandbox.

`lgr` below means `node <this skill's folder>/scripts/lgr.mjs`, which needs Node 22 or later. Run it from the agent's folder. It needs the network, so ask to run it outside the sandbox when the sandbox blocks it.

## 1. Sign in

Run `lgr whoami`. If it fails, sign in with `lgr login --url https://d3iwapvcygehqg.cloudfront.net`. It opens a page in the browser, prints a link and a code, and waits until the user approves. Run it so you can read its output while it waits (in the background, or with a long timeout), give the user the link and the code, and wait for it to finish.

## 2. Describe the agent in lgr.yaml

Run `lgr import --harness codex` if you are Codex, or `lgr import --harness claude-code` if you are Claude Code. If lgr.yaml already exists, keep it unless the user wants it rebuilt (`--force`).

Go through the notes the import prints and fix lgr.yaml with the user:

- If it lists MCP servers from the user's Codex or Claude Code config, ask which of them this agent uses, then import again with `--force --mcp name1,name2`, naming every server the agent needs, the folder's own included. Do this before editing lgr.yaml, since it rewrites the file.
- Add the scripts, data and other files the agent uses under `files:`. Only listed files are uploaded. Never list `.env` or other files that hold keys.
- If the agent uses skills from the user's own skills folder (such as ~/.codex/skills, ~/.agents/skills or ~/.claude/skills), make `skills:` a list of skill folders and add those by full path.
- A server that runs a command runs inside the cloud sandbox (Linux with Node 22 and Python 3). If the command is a path on this machine, add it to `files:` and point the command at it. `npx -y` packages work as they are; install Python servers under `setup:` with `pip install --user`.
- A server on localhost, or one the user signed in to through the browser in Codex or Claude Code, can't be used from the cloud. Tell the user and leave it out unless they have a hosted URL and a token for it.
- If the scripts read API keys from the environment, add those names under `secrets:`.

Before going on, show the user a short summary: instructions, skills, MCP servers, files, and the names of the secrets.

## 3. Upload the keys

Run `lgr secrets set NAME1 NAME2 --from-env` with every name under `secrets:`. It reads each value on this machine (the environment, `.env`, or the MCP config the server came from) and never prints it. Never ask the user to paste a key into the chat. For a name it can't find, ask the user to add it at https://d3iwapvcygehqg.cloudfront.net/console/#settings/secrets, then continue.

## 4. Deploy and try it

Run `lgr deploy`. If it prints warnings, fix what they point at and deploy again.

Send the deployed agent one message it should be able to handle: `echo "<message>" | lgr chat <name>`. If the reply shows a problem, such as a missing file or a failing tool, fix lgr.yaml and deploy again.

## 5. Hand over

Tell the user in a few lines: the agent's name and version, and the console link from the deploy output, where they can try it in the Playground, create a caller key for their app, and copy a chat widget for a website. To change the agent later, they edit the folder and ask you to deploy again: each deploy is a new version on the same endpoint and keys.
