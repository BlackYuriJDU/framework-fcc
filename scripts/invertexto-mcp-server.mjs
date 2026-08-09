#!/usr/bin/env node

/**
 * Invertexto MCP Server — API de utilidades brasileiras.
 * Fornece validação de CPF/CNPJ, geração de pessoas, consulta de CNPJ,
 * CEP, validador de email, número por extenso, Tabela FIPE e mais.
 *
 * Uso: INVERTEXTO_TOKEN=seu_token node invertexto-mcp-server.mjs
 *
 * Token obtido em: https://api.invertexto.com/tokens
 * Documentação: https://api.invertexto.com/
 *
 * Ferramentas:
 *   validate_document   — Valida CPF ou CNPJ
 *   generate_person     — Gera dados falsos de pessoa (CPF, nome, etc.)
 *   lookup_cnpj         — Consulta dados de CNPJ na Receita Federal
 *   lookup_cep          — Consulta endereço por CEP
 *   validate_email      — Valida email (formato, MX, descartável)
 *   number_to_words     — Escreve número por extenso
 *   fipe_list_brands    — Lista marcas de veículos (carro, moto, caminhão)
 *   fipe_list_models    — Lista modelos de uma marca
 *   fipe_list_years     — Lista anos e preços de um modelo
 *   fipe_price_history  — Histórico de preços FIPE
 */

const BASE_URL = 'https://api.invertexto.com/v1';
const TOKEN = process.env.INVERTEXTO_TOKEN || '';

import { createInterface } from 'readline';
const rl = createInterface({ input: process.stdin });

// ——— MCP Protocol helpers ———
function sendMessage(msg) {
  process.stdout.write(JSON.stringify(msg) + '\n');
}

function sendError(requestId, code, message) {
  sendMessage({ jsonrpc: '2.0', id: requestId, error: { code, message } });
}

function sendResult(requestId, result) {
  sendMessage({ jsonrpc: '2.0', id: requestId, result });
}

// ——— HTTP helper ———
async function apiGet(path, params = {}) {
  if (!TOKEN) {
    return { error: true, message: 'INVERTEXTO_TOKEN não configurado. Obtenha em https://api.invertexto.com/tokens' };
  }

  const query = new URLSearchParams({ token: TOKEN });
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) query.set(k, String(v));
  });

  const url = `${BASE_URL}${path}?${query.toString()}`;

  try {
    const res = await fetch(url);
    const body = await res.text();

    if (!res.ok) {
      return { error: true, message: `Invertexto error (${res.status}): ${body}` };
    }

    let data;
    try { data = JSON.parse(body); } catch { data = body; }
    return { error: false, data };
  } catch (err) {
    return { error: true, message: `Network error: ${err.message}` };
  }
}

// ——— Tool definitions ———
const TOOLS = [
  {
    name: 'validate_document',
    description: 'Valida CPF ou CNPJ. Retorna se o documento é válido ou não.',
    inputSchema: {
      type: 'object',
      properties: {
        value: { type: 'string', description: 'Número do CPF ou CNPJ (com ou sem pontuação)' },
        type: { type: 'string', enum: ['cpf', 'cnpj'], description: 'Tipo do documento (opcional, API detecta automaticamente)' }
      },
      required: ['value']
    },
    handler: async (args) => {
      const result = await apiGet('/validator', { value: args.value, type: args.type });
      if (result.error) return { error: result.message };
      return { valid: result.data.valid, document: args.value };
    }
  },

  {
    name: 'generate_person',
    description: 'Gera dados falsos de uma pessoa (CPF, CNPJ, nome, data de nascimento, etc.). Útil para testes.',
    inputSchema: {
      type: 'object',
      properties: {
        locale: { type: 'string', default: 'pt_BR', description: 'Localização dos dados (pt_BR, en_US, etc.)' },
        fields: { type: 'string', description: 'Campos específicos separados por vírgula (ex: nome,cpf,data_nascimento)' }
      }
    },
    handler: async (args) => {
      const result = await apiGet('/faker', { locale: args.locale || 'pt_BR', fields: args.fields });
      if (result.error) return { error: result.message };
      return { person: result.data };
    }
  },

  {
    name: 'lookup_cnpj',
    description: 'Consulta dados completos de um CNPJ na Receita Federal (situação cadastral, CNAE, sócios, endereço).',
    inputSchema: {
      type: 'object',
      properties: {
        cnpj: { type: 'string', description: 'CNPJ com 14 dígitos (sem pontuação)' }
      },
      required: ['cnpj']
    },
    handler: async (args) => {
      const cnpj = args.cnpj.replace(/\D/g, '');
      const result = await apiGet(`/cnpj/${cnpj}`);
      if (result.error) return { error: result.message };
      return { company: result.data };
    }
  },

  {
    name: 'lookup_cep',
    description: 'Consulta endereço por CEP. Retorna logradouro, bairro, cidade e estado.',
    inputSchema: {
      type: 'object',
      properties: {
        cep: { type: 'string', description: 'CEP com 8 dígitos (com ou sem traço)' }
      },
      required: ['cep']
    },
    handler: async (args) => {
      const cep = args.cep.replace(/\D/g, '');
      const result = await apiGet(`/cep/${cep}`);
      if (result.error) return { error: result.message };
      return { address: result.data };
    }
  },

  {
    name: 'validate_email',
    description: 'Valida um email: verifica formato, registros MX do domínio e se é descartável.',
    inputSchema: {
      type: 'object',
      properties: {
        email: { type: 'string', description: 'Email para validar' }
      },
      required: ['email']
    },
    handler: async (args) => {
      const result = await apiGet(`/email-validator/${encodeURIComponent(args.email)}`);
      if (result.error) return { error: result.message };
      return { validation: result.data };
    }
  },

  {
    name: 'number_to_words',
    description: 'Escreve um número por extenso (ex: 123 → "cento e vinte e três"). Suporta moeda e 23 idiomas.',
    inputSchema: {
      type: 'object',
      properties: {
        number: { type: 'string', description: 'Número a ser escrito (casa decimal separada por ponto, ex: 123.45)' },
        language: { type: 'string', default: 'pt', description: 'Idioma (pt, en, es, fr, de, ru, etc.)' },
        currency: { type: 'string', description: 'Moeda (BRL, USD, EUR, GBP, JPY, etc.)' }
      },
      required: ['number']
    },
    handler: async (args) => {
      const result = await apiGet('/number-to-words', {
        number: args.number,
        language: args.language || 'pt',
        currency: args.currency
      });
      if (result.error) return { error: result.message };
      return { words: result.data };
    }
  },

  {
    name: 'fipe_list_brands',
    description: 'Lista marcas de veículos da Tabela FIPE.',
    inputSchema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['1', '2', '3'], default: '1', description: '1 para carro, 2 para moto, 3 para caminhão' }
      }
    },
    handler: async (args) => {
      const result = await apiGet(`/fipe/brands/${args.type || '1'}`);
      if (result.error) return { error: result.message };
      return { brands: result.data };
    }
  },

  {
    name: 'fipe_list_models',
    description: 'Lista modelos de veículos de uma marca FIPE.',
    inputSchema: {
      type: 'object',
      properties: {
        brand_id: { type: 'string', description: 'ID da marca (obtido via fipe_list_brands)' }
      },
      required: ['brand_id']
    },
    handler: async (args) => {
      const result = await apiGet(`/fipe/models/${args.brand_id}`);
      if (result.error) return { error: result.message };
      return { models: result.data };
    }
  },

  {
    name: 'fipe_list_years',
    description: 'Lista anos disponíveis e preços atuais de um modelo FIPE.',
    inputSchema: {
      type: 'object',
      properties: {
        fipe_code: { type: 'string', description: 'Código FIPE do modelo (obtido via fipe_list_models)' }
      },
      required: ['fipe_code']
    },
    handler: async (args) => {
      const result = await apiGet(`/fipe/years/${args.fipe_code}`);
      if (result.error) return { error: result.message };
      return { years: result.data };
    }
  },

  {
    name: 'fipe_price_history',
    description: 'Obtém histórico de preços FIPE de um veículo específico.',
    inputSchema: {
      type: 'object',
      properties: {
        fipe_code: { type: 'string', description: 'Código FIPE do modelo' },
        year_id: { type: 'string', description: 'ID do ano (obtido via fipe_list_years)' }
      },
      required: ['fipe_code', 'year_id']
    },
    handler: async (args) => {
      const result = await apiGet('/fipe/history', { fipe_code: args.fipe_code, year_id: args.year_id });
      if (result.error) return { error: result.message };
      return { history: result.data };
    }
  }
];

// ——— MCP handler ———
function handleRequest(msg) {
  if (msg.jsonrpc !== '2.0' || !msg.id) return;
  const { id, method, params } = msg;

  if (method === 'initialize') {
    sendResult(id, {
      protocolVersion: '0.1.0',
      capabilities: { tools: {} },
      serverInfo: { name: 'vertexion-invertexto-mcp', version: '1.0.0' }
    });
    return;
  }

  if (method === 'tools/list') {
    sendResult(id, { tools: TOOLS.map(t => ({ name: t.name, description: t.description, inputSchema: t.inputSchema })) });
    return;
  }

  if (method === 'tools/call') {
    const tool = TOOLS.find(t => t.name === params.name);
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
console.error('[invertexto-mcp] Server starting...');
console.error(`[invertexto-mcp] Token: ${TOKEN ? '✓ configurado' : '✗ FALTANDO — obtenha em https://api.invertexto.com/tokens'}`);

rl.on('line', (line) => {
  try {
    handleRequest(JSON.parse(line));
  } catch (err) {
    console.error('[invertexto-mcp] Parse error:', err.message);
  }
});

rl.on('close', () => process.exit(0));

console.error('[invertexto-mcp] Ready...');
