#!/usr/bin/env node

/**
 * Vision MCP Server — traduz imagens em Design Spec textual.
 * Usa OpenRouter (modelos gratuitos com visão) como backend.
 *
 * Uso: OPENROUTER_API_KEY=... node vision-mcp-server.mjs
 *
 * Modelo padrão: google/gemma-4-31b-it:free (melhor qualidade free)
 * Alternativas: google/gemma-4-26b-a4b-it:free, nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free
 *
 * Ferramentas:
 *   analyze_design(image_url) → Design Spec JSON
 *   analyze_ui(image_url)     → UI analysis (paleta, layout, componentes)
 *   analyze_brand(image_url)  → Brand analysis (mood, estilo, emoção)
 */

import { createInterface } from 'readline';

const API_KEY = process.env.OPENROUTER_API_KEY || '';
const MODEL = process.env.VISION_MODEL || 'google/gemma-4-31b-it:free';
const OR_URL = 'https://openrouter.ai/api/v1/chat/completions';

// ——— MCP Protocol helpers ———
const rl = createInterface({ input: process.stdin });

function sendMessage(msg) {
  process.stdout.write(JSON.stringify(msg) + '\n');
}

function sendError(requestId, code, message) {
  sendMessage({
    jsonrpc: '2.0',
    id: requestId,
    error: { code, message }
  });
}

function sendResult(requestId, result) {
  sendMessage({
    jsonrpc: '2.0',
    id: requestId,
    result
  });
}

// ——— OpenRouter API call ———
async function analyzeWithOpenRouter(imageUrl, systemPrompt) {
  if (!API_KEY) {
    return {
      error: true,
      message: 'OPENROUTER_API_KEY não configurada. Obtenha em https://openrouter.ai/keys (gratuito, sem cartão)'
    };
  }

  // Aceita URL direta ou base64 data URI
  const imageContent = imageUrl.startsWith('data:')
    ? { type: 'image_url', image_url: { url: imageUrl } }
    : { type: 'image_url', image_url: { url: imageUrl } };

  try {
    const response = await fetch(OR_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://vertexion.org',
        'X-Title': 'Vertexion Vision MCP'
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Analyze this image according to the system instructions.' },
              imageContent
            ]
          }
        ],
        temperature: 0.2,
        max_tokens: 2048
      })
    });

    if (!response.ok) {
      const err = await response.text();
      return { error: true, message: `OpenRouter error (${response.status}): ${err}` };
    }

    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content || '';
    return { error: false, text };
  } catch (err) {
    return { error: true, message: `Network error: ${err.message}` };
  }
}

// ——— Tool handlers ———
const TOOLS = {
  analyze_design: {
    description: 'Analyze an image and return a complete design specification as JSON',
    inputSchema: {
      type: 'object',
      properties: {
        image_url: { type: 'string', description: 'URL or base64 data URI of the image' }
      },
      required: ['image_url']
    },
    handler: async (args) => {
      const sysPrompt = `You are a design analyst. Analyze the image and produce a COMPLETE design specification.

Return in this JSON format (ONLY valid JSON, no markdown, no code fences):
{
  "style": "description of the overall style",
  "palette": ["#hex1", "#hex2", ...],
  "typography": {
    "headings": "font description",
    "body": "font description",
    "style": "serif/sans/mixed"
  },
  "layout": {
    "type": "centered/grid/asymmetric/etc",
    "columns": "number or description",
    "gap": "spacing description"
  },
  "components": ["list of visible UI components"],
  "mood": ["emotion1", "emotion2"],
  "contrast": "high/medium/low",
  "spacing": "tight/moderate/generous",
  "radius": "border radius description",
  "lighting": "description of lighting style if applicable",
  "materials": ["material descriptions if applicable"],
  "do_not": ["things to avoid when recreating"]
}`;

      const result = await analyzeWithOpenRouter(args.image_url, sysPrompt);
      if (result.error) return { error: result.message };
      return { spec: result.text };
    }
  },

  analyze_ui: {
    description: 'Analyze UI-specific aspects of an image — layout, components, colors, typography',
    inputSchema: {
      type: 'object',
      properties: {
        image_url: { type: 'string', description: 'URL or base64 data URI of the image' }
      },
      required: ['image_url']
    },
    handler: async (args) => {
      const sysPrompt = `You are a UI analyst. Describe this interface in detail.

Focus on:
1. Layout structure (grid, single column, asymmetric, etc.)
2. Color palette used (list hex values you can identify)
3. Typography (heading and body font styles)
4. Component hierarchy (what's most prominent?)
5. Spacing and rhythm
6. Interactive states visible (hover, active, disabled)
7. Responsive behavior clues
8. Accessibility considerations

Format as structured markdown with clear sections.`;

      const result = await analyzeWithOpenRouter(args.image_url, sysPrompt);
      if (result.error) return { error: result.message };
      return { analysis: result.text };
    }
  },

  analyze_brand: {
    description: 'Analyze brand identity from an image — mood, style, audience, signals',
    inputSchema: {
      type: 'object',
      properties: {
        image_url: { type: 'string', description: 'URL or base64 data URI of the image' }
      },
      required: ['image_url']
    },
    handler: async (args) => {
      const sysPrompt = `You are a brand analyst. Analyze the brand identity in this image.

Describe:
1. Brand mood and personality (luxury, playful, serious, innovative, etc.)
2. Color psychology (what do the colors communicate?)
3. Visual metaphors and symbolism
4. Target audience implied
5. Industry fit and positioning
6. Emotional response evoked
7. Quality signals (premium cues, trust signals, authority markers)

Format as structured markdown with clear sections.`;

      const result = await analyzeWithOpenRouter(args.image_url, sysPrompt);
      if (result.error) return { error: result.message };
      return { analysis: result.text };
    }
  }
};

// ——— MCP request handler ———
function handleRequest(msg) {
  if (msg.jsonrpc !== '2.0' || !msg.id) return;

  const { id, method, params } = msg;

  if (method === 'initialize') {
    sendResult(id, {
      protocolVersion: '0.1.0',
      capabilities: { tools: {} },
      serverInfo: { name: 'vertexion-vision-mcp', version: '1.0.0' }
    });
    return;
  }

  if (method === 'tools/list') {
    sendResult(id, {
      tools: Object.entries(TOOLS).map(([name, t]) => ({
        name,
        description: t.description,
        inputSchema: t.inputSchema
      }))
    });
    return;
  }

  if (method === 'tools/call') {
    const tool = TOOLS[params.name];
    if (!tool) {
      sendError(id, -32601, `Tool not found: ${params.name}`);
      return;
    }
    tool.handler(params.arguments)
      .then(result => sendResult(id, result))
      .catch(err => sendError(id, -32603, err.message));
    return;
  }

  if (method === 'notifications/initialized') return;

  sendError(id, -32601, `Method not found: ${method}`);
}

// ——— Main ———
console.error('[vision-mcp] Server starting...');
console.error(`[vision-mcp] Model: ${MODEL}`);
console.error(`[vision-mcp] API key: ${API_KEY ? '✓ configured' : '✗ MISSING — get one at https://openrouter.ai/keys'}`);

rl.on('line', (line) => {
  try {
    const msg = JSON.parse(line);
    handleRequest(msg);
  } catch (err) {
    console.error('[vision-mcp] Parse error:', err.message);
  }
});

rl.on('close', () => process.exit(0));

console.error('[vision-mcp] Ready, waiting for requests...');
