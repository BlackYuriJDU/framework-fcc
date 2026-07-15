import { readJson, writeJson } from './store.mjs';

const DEFAULTS = [
  {
    id: 'daily', name: 'Rotina diária', enabled: true, frequency: 'daily', hour: 10, minute: 0,
    prompt: 'Execute a rotina diária do Vertexion Control. Primeiro tente o fluxo interno autorizado com vertexion-growth-daily quando Growth Engine estiver configurado; caso Pipedream/Supabase já tenha produzido resultados, ingira-os sem duplicar a busca. Verifique follow-ups e incidentes, atualize o painel, selecione o melhor lead válido, pesquise contexto adicional e crie uma mensagem personalizada pronta para revisão e um roteiro Loom opcional de até 2 minutos. Não envie nada, não gere cobrança e respeite a quota gratuita. Se nada útil existir, permaneça silencioso.'
  },
  {
    id: 'weekly', name: 'Revisão semanal', enabled: true, frequency: 'weekly', weekday: 1, hour: 10, minute: 30,
    prompt: 'Execute a revisão semanal: compliance de ZapMenu e Vertexion, disponibilidade, Marketing Review, documentação, reavaliação de leads, falsos positivos, bloqueios, riscos e resumo das equipes. Não aplique ação externa.'
  },
  {
    id: 'monthly', name: 'Cápsula do tempo', enabled: true, frequency: 'monthly', day: 1, hour: 11, minute: 0,
    prompt: 'Crie a cápsula do tempo mensal comparando início e fim do mês e o mês anterior: projetos, funcionalidades, clientes, leads, receita, custos, bugs, ideias, decisões, previsões, regressões e aprendizados. Separe impacto confirmado, aparente e inconclusivo.'
  },
];

export function routines() {
  const current = readJson('routines.json', null);
  if (Array.isArray(current)) return current;
  writeJson('routines.json', DEFAULTS);
  return structuredClone(DEFAULTS);
}

export function saveRoutines(next) {
  writeJson('routines.json', next);
  return next;
}

function pad(value) { return String(value).padStart(2, '0'); }
function dateKey(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }
function weekStart(d) {
  const copy = new Date(d); const day = copy.getDay(); const delta = day === 0 ? -6 : 1 - day;
  copy.setDate(copy.getDate() + delta); copy.setHours(0, 0, 0, 0); return dateKey(copy);
}
function scheduledTime(d, routine) {
  const target = new Date(d);
  if (routine.frequency === 'weekly') {
    const current = target.getDay(); const wanted = Number(routine.weekday ?? 1);
    let delta = wanted - current; if (current === 0) delta = wanted - 7;
    target.setDate(target.getDate() + delta);
  }
  if (routine.frequency === 'monthly') target.setDate(Number(routine.day || 1));
  target.setHours(Number(routine.hour || 0), Number(routine.minute || 0), 0, 0);
  return target;
}
function periodKey(now, routine) {
  if (routine.frequency === 'daily') return `${routine.id}:${dateKey(now)}`;
  if (routine.frequency === 'weekly') return `${routine.id}:week:${weekStart(now)}`;
  return `${routine.id}:month:${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
}
function isDue(now, routine) {
  if (!routine.enabled) return false;
  const target = scheduledTime(now, routine);
  return now >= target;
}

export function startScheduler(run) {
  let checking = false;
  async function check() {
    if (checking) return; checking = true;
    try {
      const now = new Date();
      const state = readJson('routine-state.json', {});
      for (const routine of routines()) {
        const key = periodKey(now, routine);
        if (isDue(now, routine) && !state[key]) {
          state[key] = { startedAt: new Date().toISOString(), status: 'started' };
          writeJson('routine-state.json', state);
          try { await run(routine); state[key].status = 'launched'; }
          catch (error) { state[key].status = 'failed'; state[key].error = error.message; }
          state[key].updatedAt = new Date().toISOString();
          writeJson('routine-state.json', state);
        }
      }
    } finally { checking = false; }
  }
  const timer = setInterval(check, 60_000);
  setTimeout(check, 4_000);
  return () => clearInterval(timer);
}
