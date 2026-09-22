// Tipos do módulo PAR-Q.
// Mantidos separados da UI de propósito: o futuro app/sistema da
// Evolution Fitness poderá importar estes mesmos tipos.

export type YesNo = boolean | null;

export interface ParQQuestionKey {
  key:
    | "question_1"
    | "question_2"
    | "question_3"
    | "question_4"
    | "question_5"
    | "question_6"
    | "question_7";
  number: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  text: string;
}

// Texto oficial das 7 perguntas — mantido fiel ao documento da Evolution Fitness.
export const PARQ_QUESTIONS: ParQQuestionKey[] = [
  {
    key: "question_1",
    number: 1,
    text: "Alguma vez um médico lhe disse que você possui algum problema cardíaco e que só deveria realizar atividade física recomendada por um médico?",
  },
  {
    key: "question_2",
    number: 2,
    text: "Você sente dor no peito quando realiza atividade física?",
  },
  {
    key: "question_3",
    number: 3,
    text: "No último mês, você sentiu dor no peito quando não estava realizando atividade física?",
  },
  {
    key: "question_4",
    number: 4,
    text: "Você perde o equilíbrio por causa de tontura ou já perdeu a consciência?",
  },
  {
    key: "question_5",
    number: 5,
    text: "Você possui algum problema ósseo ou articular que poderia piorar com a prática de atividade física?",
  },
  {
    key: "question_6",
    number: 6,
    text: "Atualmente, algum médico está prescrevendo medicamentos para pressão arterial ou para algum problema cardíaco?",
  },
  {
    key: "question_7",
    number: 7,
    text: "Existe alguma outra razão, não mencionada acima, pela qual você não deveria realizar atividade física?",
  },
];

export interface ParQAnswers {
  question_1: YesNo;
  question_2: YesNo;
  question_3: YesNo;
  question_4: YesNo;
  question_5: YesNo;
  question_6: YesNo;
  question_7: YesNo;
}

export interface ParQFormState {
  full_name: string;
  birth_date: string; // YYYY-MM-DD
  phone: string;
  answers: ParQAnswers;
  observations: string;
  declaration_confirmed: boolean;
}

// Formato exatamente como será persistido no Supabase (tabela parq_forms).
export interface ParQRecord {
  student_id?: string | null;
  full_name: string;
  birth_date: string;
  phone: string;
  filled_at: string; // ISO timestamp
  question_1: boolean;
  question_2: boolean;
  question_3: boolean;
  question_4: boolean;
  question_5: boolean;
  question_6: boolean;
  question_7: boolean;
  yes_questions: number[];
  observations: string | null;
  declaration_confirmed: boolean;
}

export function buildParQRecord(
  state: ParQFormState,
  studentId?: string | null
): ParQRecord {
  const yes_questions = PARQ_QUESTIONS.filter(
    (q) => state.answers[q.key] === true
  ).map((q) => q.number);

  return {
    student_id: studentId ?? null,
    full_name: state.full_name.trim(),
    birth_date: state.birth_date,
    phone: state.phone.trim(),
    filled_at: new Date().toISOString(),
    question_1: !!state.answers.question_1,
    question_2: !!state.answers.question_2,
    question_3: !!state.answers.question_3,
    question_4: !!state.answers.question_4,
    question_5: !!state.answers.question_5,
    question_6: !!state.answers.question_6,
    question_7: !!state.answers.question_7,
    yes_questions,
    observations: state.observations.trim() || null,
    declaration_confirmed: state.declaration_confirmed,
  };
}

export function isFormComplete(state: ParQFormState): boolean {
  const allAnswered = PARQ_QUESTIONS.every(
    (q) => state.answers[q.key] !== null
  );
  return (
    state.full_name.trim().length > 0 &&
    state.birth_date.trim().length > 0 &&
    state.phone.trim().length > 0 &&
    allAnswered &&
    state.declaration_confirmed
  );
}
