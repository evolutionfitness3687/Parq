import ParQForm from "../../components/ParQForm";

export const metadata = {
  title: "PAR-Q | Evolution Fitness",
  description:
    "Questionário de Prontidão para Atividade Física da Evolution Fitness.",
};

interface ParQPageProps {
  searchParams: { student?: string };
}

// Rota pública: /parq  (ou /parq?student=ID no futuro, com um
// identificador seguro — nunca CPF ou telefone na URL).
export default function ParQPage({ searchParams }: ParQPageProps) {
  return <ParQForm studentId={searchParams.student ?? null} />;
}
