# Módulo PAR-Q — Evolution Fitness

Formulário digital do PAR-Q (Questionário de Prontidão para Atividade
Física), mobile-first, pronto para ser enviado por WhatsApp e preenchido
pelo aluno em qualquer smartphone.

Este módulo foi criado **sem acesso ao repositório atual do site**, então
ele está organizado como uma pasta independente e portável — veja "Como
integrar" abaixo para encaixá-lo no projeto real.

## O que foi criado

```
evolution-parq/
├── sql/001_create_parq_forms.sql      → tabela + RLS no Supabase
├── types/parq.ts                      → tipos e lógica de dados (sem UI)
├── lib/supabaseClient.ts              → cliente Supabase (browser, só anon key)
├── components/
│   ├── ParQForm.tsx                   → formulário completo (fluxo inteiro)
│   ├── YesNoToggle.tsx                → botão grande SIM / NÃO reutilizável
│   └── ParQForm.module.css            → identidade visual Evolution Fitness
└── app/parq/page.tsx                  → rota pública /parq (Next.js App Router)
```

## Como integrar no site real

1. **Se o site já é Next.js**: copie `components/`, `lib/`, `types/` e
   `app/parq/` para dentro da estrutura existente, ajustando os imports
   relativos conforme necessário. Se já existir um `lib/supabaseClient.ts`
   (ou similar), **reutilize o existente** e apague o deste pacote.
2. **Se o site é estático (ex: GitHub Pages, como o sistema de cadastro de
   alunos)**: este módulo precisa ser adaptado — React puro com Vite, ou
   incorporado como uma página separada com build próprio, já que GitHub
   Pages não roda Next.js server-side. Me avise qual é o caso real e eu
   adapto para essa stack.
3. Instale a dependência do Supabase, se ainda não estiver no projeto:
   ```
   npm install @supabase/supabase-js
   ```
4. Configure as variáveis de ambiente:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```
5. Rode `sql/001_create_parq_forms.sql` no SQL Editor do Supabase.
   - **Ajuste a linha do `student_id`**: se já existir uma tabela de
     alunos com outro nome, aponte o `references` para ela. Se ainda não
     existir tabela de alunos, remova o `references` e mantenha a coluna
     como `uuid` solta.
6. Teste acessando `/parq` no celular.

## Fluxo implementado

WhatsApp → link `/parq` → formulário mobile → aluno preenche → confirma
declaração → envia → dados salvos no Supabase → tela de confirmação.

- As 7 perguntas oficiais foram mantidas fiéis ao texto fornecido.
- Cada pergunta usa dois botões grandes (SIM / NÃO), com destaque visual
  ao selecionar, e é obrigatória.
- Se qualquer resposta for SIM, a seção "Se você respondeu SIM a alguma
  pergunta" aparece automaticamente, com campo de observações.
- A declaração final usa confirmação digital simples (checkbox), sem
  assinatura desenhada.
- Validação impede envio com campos faltando; os erros aparecem junto ao
  campo e nada é apagado.
- Tela de sucesso simples, sem reexibir dados sensíveis.

## Preparado para o futuro app

- **Dados estruturados**: cada pergunta é uma coluna própria (`question_1`
  a `question_7`), não um bloco de texto — dá para consultar, filtrar e
  cruzar com a Avaliação Física depois.
- **`yes_questions`**: array com os números das perguntas respondidas SIM,
  para identificar rapidamente PAR-Q que "precisam de atenção".
- **`student_id`**: coluna pronta para associar o registro a um aluno
  cadastrado assim que o app existir (aceita `null` até lá).
- **Lógica separada da UI**: `types/parq.ts` contém as perguntas, a
  validação e a montagem do registro — o futuro app pode importar esse
  arquivo sem depender da interface visual do site.
- **RLS no Supabase**: inserção pública liberada (para o link funcionar
  sem login), leitura restrita a usuários autenticados (equipe) — pronto
  para a área administrativa futura sem expor dados de saúde.
- **URL sem dados sensíveis**: o suporte a `/parq?student=ID` já está no
  código, mas nenhum CPF/telefone é usado como identificador.

## Pontos que ainda precisam de você

- Confirmar se o site atual é Next.js ou estático, para eu adaptar a
  integração corretamente (ver seção 2 acima).
- Confirmar o nome real da tabela de alunos (se existir) para ajustar a
  foreign key de `student_id` no SQL.
- Definir se o link enviado por WhatsApp será genérico (`/parq`) ou
  identificado (`/parq?student=ID`) — e como esse ID será gerado com
  segurança.
- Não há tela administrativa de consulta ainda (fora do escopo pedido);
  ficou preparado o schema para isso ser construído depois.
