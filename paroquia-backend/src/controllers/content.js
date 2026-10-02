const pool = require('../config/database');
const env = require('../config/env');
const { parse, intentionSchema, eventSchema, mediaSchema, donationSchema } = require('../validators/schemas');
const { toDataUrl } = require('../services/file');

async function createIntention(req, res) {
  const input = parse(intentionSchema, req.body);
  const result = await pool.query('INSERT INTO intencoes_missa (usuario_id,descricao,data_missa) VALUES ($1,$2,$3) RETURNING *', [req.user.id, input.descricao, input.data_missa]);
  res.status(201).json(result.rows[0]);
}

async function listIntentions(req, res) {
  const result = await pool.query('SELECT * FROM intencoes_missa WHERE usuario_id=$1 ORDER BY data_missa DESC', [req.user.id]);
  res.json(result.rows);
}

async function updateIntention(req, res) {
  const input = parse(intentionSchema, req.body);
  const result = await pool.query('UPDATE intencoes_missa SET descricao=$1,data_missa=$2 WHERE id=$3 AND usuario_id=$4 RETURNING *', [input.descricao, input.data_missa, req.params.id, req.user.id]);
  if (!result.rowCount) return res.status(404).json({ erro: 'Intenção não encontrada.' });
  res.json(result.rows[0]);
}

async function deleteIntention(req, res) {
  const result = await pool.query('DELETE FROM intencoes_missa WHERE id=$1 AND usuario_id=$2', [req.params.id, req.user.id]);
  if (!result.rowCount) return res.status(404).json({ erro: 'Intenção não encontrada.' });
  res.status(204).end();
}

async function listEvents(req, res) { const result = await pool.query('SELECT id,titulo,data_inicio,data_texto,local,banner,criado_em FROM eventos ORDER BY data_inicio ASC'); res.json(result.rows); }
async function createEvent(req, res) {
  const input = parse(eventSchema, req.body); if (!req.file) return res.status(400).json({ erro: 'A imagem do evento é obrigatória.' });
  const result = await pool.query('INSERT INTO eventos (titulo,data_inicio,data_texto,local,banner) VALUES ($1,$2,$3,$4,$5) RETURNING *', [input.titulo,input.data_inicio,input.data_texto,input.local,toDataUrl(req.file)]); res.status(201).json(result.rows[0]);
}
async function updateEvent(req, res) {
  const input = parse(eventSchema, req.body); const values = [input.titulo,input.data_inicio,input.data_texto,input.local,req.params.id];
  const query = req.file ? 'UPDATE eventos SET titulo=$1,data_inicio=$2,data_texto=$3,local=$4,banner=$5 WHERE id=$6 RETURNING *' : 'UPDATE eventos SET titulo=$1,data_inicio=$2,data_texto=$3,local=$4 WHERE id=$5 RETURNING *';
  if (req.file) values.splice(4, 0, toDataUrl(req.file)); const result = await pool.query(query, values); if (!result.rowCount) return res.status(404).json({ erro: 'Evento não encontrado.' }); res.json(result.rows[0]);
}
async function deleteEvent(req, res) { const result = await pool.query('DELETE FROM eventos WHERE id=$1',[req.params.id]); if (!result.rowCount) return res.status(404).json({ erro: 'Evento não encontrado.' }); res.status(204).end(); }

async function listMedia(req, res) { const result = await pool.query('SELECT id,titulo,data_evento,link_externo,banner,criado_em FROM midias ORDER BY data_evento DESC'); res.json(result.rows); }
async function createMedia(req, res) { const input = parse(mediaSchema, req.body); if (!req.file) return res.status(400).json({ erro: 'A capa da mídia é obrigatória.' }); const result = await pool.query('INSERT INTO midias (titulo,data_evento,link_externo,banner) VALUES ($1,$2,$3,$4) RETURNING *',[input.titulo,input.data_evento,input.link_externo,toDataUrl(req.file)]); res.status(201).json(result.rows[0]); }
async function updateMedia(req, res) { const input = parse(mediaSchema, req.body); const values = [input.titulo,input.data_evento,input.link_externo,req.params.id]; const query = req.file ? 'UPDATE midias SET titulo=$1,data_evento=$2,link_externo=$3,banner=$4 WHERE id=$5 RETURNING *' : 'UPDATE midias SET titulo=$1,data_evento=$2,link_externo=$3 WHERE id=$4 RETURNING *'; if(req.file) values.splice(3,0,toDataUrl(req.file)); const result=await pool.query(query,values); if(!result.rowCount)return res.status(404).json({erro:'Mídia não encontrada.'}); res.json(result.rows[0]); }
async function deleteMedia(req, res) { const result=await pool.query('DELETE FROM midias WHERE id=$1',[req.params.id]); if(!result.rowCount)return res.status(404).json({erro:'Mídia não encontrada.'}); res.status(204).end(); }

async function createDonation(req, res) { const input=parse(donationSchema,req.body); if(!req.file)return res.status(400).json({erro:'O comprovante é obrigatório.'}); const result=await pool.query('INSERT INTO pagamentos_dizimo (usuario_id,valor,data_pagamento,chave_pix,comprovante) VALUES ($1,$2,$3,$4,$5) RETURNING id,status,data_pagamento',[req.user.id,input.valor,input.data_pagamento,env.pixKey,toDataUrl(req.file)]); res.status(201).json(result.rows[0]); }
async function listDonations(req, res) { const result=await pool.query('SELECT id,valor,data_pagamento,status FROM pagamentos_dizimo WHERE usuario_id=$1 ORDER BY data_pagamento DESC',[req.user.id]); res.json(result.rows); }
async function adminDonations(req,res){const result=await pool.query('SELECT p.id,p.valor,p.data_pagamento,p.comprovante,p.status,u.nome,u.email FROM pagamentos_dizimo p JOIN usuarios u ON u.id=p.usuario_id ORDER BY p.data_pagamento DESC');res.json(result.rows);}
async function updateDonation(req,res){const {status}=req.body;if(!['pendente','aprovado','rejeitado'].includes(status))return res.status(400).json({erro:'Status inválido.'});const result=await pool.query('UPDATE pagamentos_dizimo SET status=$1 WHERE id=$2 RETURNING *',[status,req.params.id]);if(!result.rowCount)return res.status(404).json({erro:'Dízimo não encontrado.'});res.json(result.rows[0]);}
async function adminIntentions(req,res){const result=await pool.query('SELECT i.id,i.descricao,i.data_missa,u.nome,u.email FROM intencoes_missa i JOIN usuarios u ON u.id=i.usuario_id WHERE ($1::date IS NULL OR i.data_missa=$1) ORDER BY i.data_missa ASC',[req.query.data||null]);res.json(result.rows);}

module.exports={createIntention,listIntentions,updateIntention,deleteIntention,listEvents,createEvent,updateEvent,deleteEvent,listMedia,createMedia,updateMedia,deleteMedia,createDonation,listDonations,adminDonations,updateDonation,adminIntentions};
