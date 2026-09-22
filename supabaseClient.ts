import { createClient } from "@supabase/supabase-js";

// IMPORTANTE: apenas a chave anônima (publishable) fica aqui.
// Nunca coloque a service role key no frontend.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  // Em produção isso deve ser configurado nas variáveis de ambiente
  // do projeto (Vercel, Netlify, etc). Se o site já tiver um cliente
  // Supabase configurado em outro arquivo, reutilize-o e apague este.
  console.warn(
    "[Supabase] NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY não configuradas."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
