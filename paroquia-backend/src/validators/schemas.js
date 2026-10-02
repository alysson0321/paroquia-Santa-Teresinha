const { z } = require('zod');

const userSchema = z.object({ nome: z.string().trim().min(2).max(100), email: z.string().email().max(100), senha: z.string().min(6).max(72) });
const loginSchema = z.object({ email: z.string().email(), senha: z.string().min(1) });
const intentionSchema = z.object({ descricao: z.string().trim().min(2).max(2000), data_missa: z.coerce.date() });
const eventSchema = z.object({ titulo: z.string().trim().min(2).max(255), data_inicio: z.coerce.date(), data_texto: z.string().trim().min(2).max(100), local: z.string().trim().min(2).max(255) });
const mediaSchema = z.object({ titulo: z.string().trim().min(2).max(255), data_evento: z.coerce.date(), link_externo: z.string().url() });
const donationSchema = z.object({ valor: z.coerce.number().positive(), data_pagamento: z.coerce.date() });

function parse(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const error = new Error(result.error.issues.map((issue) => issue.message).join(' '));
    error.status = 400;
    throw error;
  }
  return result.data;
}

module.exports = { userSchema, loginSchema, intentionSchema, eventSchema, mediaSchema, donationSchema, parse };
