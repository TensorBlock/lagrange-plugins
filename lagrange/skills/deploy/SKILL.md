---
name: deploy
description: Deploy the agent in the current folder to LagrangeCloud, which runs it in the cloud behind an API endpoint, a Playground and a chat widget. Use when the user wants to deploy, host or publish this agent, put it online, run it on a schedule, or update a deployed one.
---

# Deploy this agent to LagrangeCloud

The agent is what this folder gives you: AGENTS.md, CLAUDE.md or .hermes.md, skills, MCP servers, and the scripts and data they use. Deploying uploads it, and LagrangeCloud runs it on Codex, Claude Code or Hermes in a cloud sandbox.

Choose the API URL first: use `https://lgr.tensorblock.co` for the public production service unless the user explicitly requests staging or a self-hosted server. State the selected URL before signing in or uploading anything.

`lgr` below means `node <this skill's folder>/scripts/lgr.mjs --url <selected-api-url>`, which needs Node 22 or later. It downloads LagrangeCloud's current CLI on first use and whenever a new one is released, so it always matches the service. Pass this same explicit `--url` on every command, including `whoami`, `login`, secrets, deploy, chat, and triggers. Do not let a saved CLI URL or `LGR_API_URL` silently select another environment. Run from the agent's folder. It needs the network, so ask to run it outside the sandbox when the sandbox blocks it.

## Steps

Run `lgr guide` and follow the steps it prints. They come with the current CLI, so they always match what the service supports.
