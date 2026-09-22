"use client";

import { useMemo, useState } from "react";
import styles from "./ParQForm.module.css";
import YesNoToggle from "./YesNoToggle";
import { supabase } from "../lib/supabaseClient";
import {
  PARQ_QUESTIONS,
  ParQFormState,
  buildParQRecord,
  isFormComplete,
} from "../types/parq";

const EMPTY_STATE: ParQFormState = {
  full_name: "",
  birth_date: "",
  phone: "",
  answers: {
    question_1: null,
    question_2: null,
    question_3: null,
    question_4: null,
    question_5: null,
    question_6: null,
    question_7: null,
  },
  observations: "",
  declaration_confirmed: false,
};

// Máscara simples de telefone brasileiro: (99) 99999-9999
function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

interface ParQFormProps {
  /** ID do aluno, se o link já vier identificado (ex: /parq?student=ID). */
  studentId?: string | null;
}

export default function ParQForm({ studentId = null }: ParQFormProps) {
  const [state, setState] = useState<ParQFormState>(EMPTY_STATE);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const hasAnyYes = useMemo(
    () => PARQ_QUESTIONS.some((q) => state.answers[q.key] === true),
    [state.answers]
  );

  const today = useMemo(
    () =>
      new Date().toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
    []
  );

  function updateField<K extends keyof ParQFormState>(
    field: K,
    value: ParQFormState[K]
  ) {
    setState((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: false }));
  }

  function updateAnswer(key: keyof ParQFormState["answers"], value: boolean) {
    setState((prev) => ({
      ...prev,
      answers: { ...prev.answers, [key]: value },
    }));
    setErrors((prev) => ({ ...prev, [key]: false }));
  }

  function validate(): boolean {
    const newErrors: Record<string, boolean> = {};

    if (!state.full_name.trim()) newErrors.full_name = true;
    if (!state.birth_date.trim()) newErrors.birth_date = true;
    if (!state.phone.trim() || state.phone.replace(/\D/g, "").length < 10)
      newErrors.phone = true;

    PARQ_QUESTIONS.forEach((q) => {
      if (state.answers[q.key] === null) newErrors[q.key] = true;
    });

    if (!state.declaration_confirmed) newErrors.declaration_confirmed = true;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (!validate() || !isFormComplete(state)) {
      // Rola até o primeiro campo com erro para facilitar em telas pequenas
      const firstErrorEl = document.querySelector("[data-error='true']");
      firstErrorEl?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setSubmitting(true);
    try {
      const record = buildParQRecord(state, studentId);
      const { error } = await supabase.from("parq_forms").insert(record);

      if (error) throw error;

      setSubmitted(true);
    } catch (err) {
      console.error("[PAR-Q] Erro ao enviar:", err);
      setSubmitError(
        "Não foi possível enviar seu PAR-Q agora. Verifique sua conexão e tente novamente."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className={styles.page}>
        <div className={`${styles.card} ${styles.successCard}`}>
          <div className={styles.successIcon} aria-hidden="true">
            ✓
          </div>
          <h1 className={styles.successTitle}>PAR-Q enviado com sucesso.</h1>
          <p className={styles.successText}>
            Obrigado por preencher seu questionário. A equipe da Evolution
            Fitness recebeu suas informações.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <form className={styles.card} onSubmit={handleSubmit} noValidate>
        <header className={styles.header}>
          <p className={styles.brand}>EVOLUTION FITNESS</p>
          <h1 className={styles.title}>
            Questionário de Prontidão para Atividade Física — PAR-Q
          </h1>
          <p className={styles.intro}>
            Este questionário tem como objetivo identificar possíveis
            situações de saúde que mereçam atenção antes do início ou da
            progressão de um programa de exercícios. Responda todas as
            perguntas com sinceridade. Em caso de dúvida, procure orientação
            de um profissional de saúde.
          </p>
        </header>

        {/* Dados do aluno */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Seus dados</h2>

          <label className={styles.label} htmlFor="full_name">
            Nome completo
          </label>
          <input
            id="full_name"
            className={styles.input}
            type="text"
            autoComplete="name"
            value={state.full_name}
            onChange={(e) => updateField("full_name", e.target.value)}
            data-error={errors.full_name}
          />
          {errors.full_name && (
            <p className={styles.errorText}>Informe seu nome completo.</p>
          )}

          <label className={styles.label} htmlFor="birth_date">
            Data de nascimento
          </label>
          <input
            id="birth_date"
            className={styles.input}
            type="date"
            value={state.birth_date}
            onChange={(e) => updateField("birth_date", e.target.value)}
            data-error={errors.birth_date}
          />
          {errors.birth_date && (
            <p className={styles.errorText}>Informe sua data de nascimento.</p>
          )}

          <label className={styles.label} htmlFor="phone">
            Telefone
          </label>
          <input
            id="phone"
            className={styles.input}
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="(99) 99999-9999"
            value={state.phone}
            onChange={(e) => updateField("phone", formatPhone(e.target.value))}
            data-error={errors.phone}
          />
          {errors.phone && (
            <p className={styles.errorText}>Informe um telefone válido.</p>
          )}

          <div className={styles.readOnlyRow}>
            <span>Data do preenchimento</span>
            <strong>{today}</strong>
          </div>
        </section>

        {/* As 7 perguntas */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Questionário</h2>
          {PARQ_QUESTIONS.map((q) => (
            <div
              key={q.key}
              className={styles.questionBlock}
              data-error={errors[q.key]}
            >
              <p className={styles.questionText}>
                <span className={styles.questionNumber}>{q.number}.</span>{" "}
                {q.text}
              </p>
              <YesNoToggle
                name={`Pergunta ${q.number}`}
                value={state.answers[q.key]}
                onChange={(value) => updateAnswer(q.key, value)}
                error={errors[q.key]}
              />
              {errors[q.key] && (
                <p className={styles.errorText}>Responda SIM ou NÃO.</p>
              )}
            </div>
          ))}
        </section>

        {/* Seção condicional */}
        {hasAnyYes && (
          <section className={`${styles.section} ${styles.alertSection}`}>
            <h2 className={styles.sectionTitle}>
              Se você respondeu SIM a alguma pergunta
            </h2>
            <p className={styles.alertText}>
              Para sua segurança, informe qual(is) pergunta(s) recebeu(ram)
              resposta &ldquo;SIM&rdquo; e, quando necessário, procure
              avaliação e liberação de um profissional de saúde antes de
              iniciar ou aumentar a intensidade dos exercícios.
            </p>

            <div className={styles.readOnlyRow}>
              <span>Pergunta(s) com resposta SIM</span>
              <strong>
                {PARQ_QUESTIONS.filter((q) => state.answers[q.key] === true)
                  .map((q) => q.number)
                  .join(", ")}
              </strong>
            </div>

            <label className={styles.label} htmlFor="observations">
              Observações
            </label>
            <textarea
              id="observations"
              className={styles.textarea}
              rows={4}
              value={state.observations}
              onChange={(e) => updateField("observations", e.target.value)}
              placeholder="Se quiser, adicione detalhes para a equipe da Evolution Fitness."
            />
          </section>
        )}

        {/* Declaração */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Declaração do aluno</h2>
          <p className={styles.declarationText}>
            Declaro que respondi às perguntas acima de forma verdadeira e
            completa e que informarei à equipe da Evolution Fitness caso
            ocorra qualquer alteração relevante no meu estado de saúde.
            Compreendo que este questionário não substitui avaliação médica e
            que devo procurar atendimento profissional quando houver
            indicação.
          </p>

          <div className={styles.readOnlyRow}>
            <span>Nome completo</span>
            <strong>{state.full_name || "—"}</strong>
          </div>

          <label
            className={styles.checkboxRow}
            data-error={errors.declaration_confirmed}
          >
            <input
              type="checkbox"
              checked={state.declaration_confirmed}
              onChange={(e) =>
                updateField("declaration_confirmed", e.target.checked)
              }
            />
            <span>Declaro que as informações acima são verdadeiras.</span>
          </label>
          {errors.declaration_confirmed && (
            <p className={styles.errorText}>
              Confirme a declaração antes de enviar.
            </p>
          )}
        </section>

        {submitError && (
          <p className={`${styles.errorText} ${styles.submitError}`}>
            {submitError}
          </p>
        )}

        <button
          type="submit"
          className={styles.submitButton}
          disabled={submitting}
        >
          {submitting ? "Enviando..." : "ENVIAR PAR-Q"}
        </button>
      </form>
    </div>
  );
}
