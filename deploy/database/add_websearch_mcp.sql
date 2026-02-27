-- Add Web Search MCP Service
-- Multi-provider web search (DuckDuckGo, Bing, SearXNG)
-- Installation: cd mcp-services && npm install @zhafron/mcp-web-search

USE `tomybot`;

-- Insert MCP service
INSERT INTO `mcp_services` (`name`, `command`, `args`, `env`, `status`, `description`) 
VALUES (
  'web-search',
  'node',
  '["/Users/taoliang/Develop/vokiai-hp/mcp-services/node_modules/.bin/mcp-web-search"]',
  '{}',
  'active',
  '多引擎网页搜索服务 - 支持 DuckDuckGo、Bing、SearXNG，无需 API Key'
) ON DUPLICATE KEY UPDATE 
  `command` = VALUES(`command`),
  `args` = VALUES(`args`),
  `description` = VALUES(`description`),
  `status` = 'active';
