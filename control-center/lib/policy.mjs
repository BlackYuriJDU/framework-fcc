import fs from 'node:fs';
import path from 'node:path';
const systemHome=process.env.VERTEXION_SYSTEM_HOME||path.join(process.env.HOME||process.env.USERPROFILE,'.claude','vertexion-agent-system');
const GATED=['deploy production','production','push','pull request','migration remote','send external','gasto','checkout','pagamento','dados reais'];
export function loadRegistry(){return JSON.parse(fs.readFileSync(path.join(systemHome,'orchestrators','registry.json'),'utf8'));}
export function getOrchestrator(id){const item=loadRegistry().orchestrators.find(x=>x.id===id); if(!item) throw new Error(`Orchestrator not found: ${id}`); return item;}
export function resolveOrchestrator(domain){const r=loadRegistry(); const map={engineering:'tesla',reliability:'tesla',security:'tesla',growth:'einstein',marketing:'einstein',finance:'einstein',legal:'einstein',design:'da-vinci',experience:'da-vinci'}; return r.orchestrators.find(x=>x.id===map[domain])||r.orchestrators.find(x=>x.id===r.active);}
export function isExternalActionBlocked(action=''){const t=String(action).toLowerCase();return GATED.some(x=>t.includes(x));}
export function assertTaskPermission({orchestratorId,action='',approval=false}){const o=getOrchestrator(orchestratorId);if(isExternalActionBlocked(action)&&!approval)throw new Error(`Policy gate: ${o.name} requires approval for ${action}`);return true;}
