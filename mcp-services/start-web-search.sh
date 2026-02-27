#!/bin/bash
# Start Web Search MCP Server
# Multi-provider web search (DuckDuckGo, Bing, SearXNG)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MCP_DIR="$SCRIPT_DIR/../mcp-services"

node "$MCP_DIR/node_modules/.bin/mcp-web-search"
