"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  Loader2,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SingleSelectGroup,
  MultiSelectGroup,
  RankingList,
  QuestionLabel,
} from "@/components/early-access/form-controls";
import {
  SECTION_NAMES,
  AGE_RANGES,
  PROFESSIONAL_PROFILES,
  CURRENT_SITUATIONS,
  PROGRAMMING_EXPERIENCE,
  PLATFORMS_USED,
  BIGGEST_FRUSTRATIONS,
  ABANDONED_COURSES,
  PROJECT_TYPES,
  DEPLOYMENT_IMPORTANCE,
  FEATURES_TO_RANK,
  WEEKLY_TIME,
  MONTHLY_PAYMENT,
} from "@/lib/early-access-options";
import {
  type EarlyAccessFormData,
  INITIAL_FORM_DATA,
} from "@/types/early-access";
import { PRODUCT_NAME } from "@/lib/constants";
import { supabase } from "@/lib/supabase";

const TOTAL_STEPS = 5;

// ── Validation ──

function validateStep(step: number, data: EarlyAccessFormData): string | null {
  switch (step) {
    case 0:
      if (!data.name.trim()) return "El nombre es requerido.";
      if (!data.email.trim()) return "El correo es requerido.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
        return "El correo no es válido.";
      if (!data.country.trim()) return "El país es requerido.";
      if (!data.age_range) return "Selecciona tu rango de edad.";
      if (data.professional_profiles.length === 0)
        return "Selecciona al menos un perfil profesional.";
      if (!data.current_situation) return "Selecciona tu situación actual.";
      if (!data.programming_experience)
        return "Selecciona tu experiencia programando.";
      return null;
    case 1:
      if (data.platforms_used.length === 0)
        return "Selecciona al menos una plataforma.";
      if (data.biggest_frustrations.length === 0)
        return "Selecciona al menos una frustración.";
      if (!data.abandoned_courses)
        return "Responde sobre cursos abandonados.";
      return null;
    case 2:
      if (data.project_types.length === 0)
        return "Selecciona al menos un tipo de proyecto.";
      if (!data.deployment_importance)
        return "Selecciona la importancia del despliegue.";
      return null;
    case 3:
      if (data.feature_ranking.length === 0)
        return "Ordena las features por importancia.";
      if (!data.weekly_time) return "Selecciona el tiempo semanal.";
      return null;
    case 4:
      if (!data.monthly_payment) return "Selecciona una opción de pago.";
      if (!data.confirmations.terms)
        return "Debes aceptar los Términos y Condiciones.";
      if (!data.confirmations.privacy)
        return "Debes aceptar la Política de Privacidad.";
      if (!data.confirmations.beta)
        return "Debes aceptar participar en el programa beta.";
      return null;
    default:
      return null;
  }
}

// ── Page ──

export default function EarlyAccessPage() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<EarlyAccessFormData>({
    ...INITIAL_FORM_DATA,
    feature_ranking: [...FEATURES_TO_RANK],
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const update = useCallback(
    <K extends keyof EarlyAccessFormData>(
      key: K,
      value: EarlyAccessFormData[K]
    ) => {
      setData((prev) => ({ ...prev, [key]: value }));
      setError(null);
    },
    []
  );

  const goNext = () => {
    const err = validateStep(step, data);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goBack = () => {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    const err = validateStep(step, data);
    if (err) {
      setError(err);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const now = new Date().toISOString();
      const { error: dbError } = await supabase.from("early_access").insert({
        id: crypto.randomUUID(),
        name: data.name,
        email: data.email,
        country: data.country,
        age_range: data.age_range,
        professional_profiles: data.professional_profiles,
        professional_profiles_other:
          data.professional_profiles_other || null,
        current_situation: data.current_situation,
        current_situation_other: data.current_situation_other || null,
        programming_experience: data.programming_experience,
        platforms_used: data.platforms_used,
        platforms_used_other: data.platforms_used_other || null,
        biggest_frustrations: data.biggest_frustrations,
        biggest_frustrations_other:
          data.biggest_frustrations_other || null,
        abandoned_courses: data.abandoned_courses,
        project_types: data.project_types,
        project_types_other: data.project_types_other || null,
        deployment_importance: data.deployment_importance,
        feature_ranking: data.feature_ranking,
        weekly_time: data.weekly_time,
        suggestions: data.suggestions || null,
        monthly_payment: data.monthly_payment,
        confirmations: data.confirmations,
        status: "PENDING",
        created_at: now,
        updated_at: now,
      });

      if (dbError) {
        console.error("Supabase insert error:", dbError);
        if (dbError.code === "23505") {
          setError("Ya existe una solicitud con este correo electrónico.");
          return;
        }
        throw dbError;
      }

      setSubmitted(true);
    } catch (err) {
      console.error("Early access submit error:", err);
      setError("Hubo un error al enviar tu solicitud. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };

  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="text-xl font-display font-bold text-gradient-brand"
          >
            {PRODUCT_NAME}
          </Link>
          {!submitted && (
            <span className="font-mono text-xs text-muted-foreground">
              Paso {step + 1} de {TOTAL_STEPS}
            </span>
          )}
        </div>
        {/* Progress bar */}
        {!submitted && (
          <div className="h-0.5 bg-border">
            <div
              className="h-full bg-brand-skyblue transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-start justify-center py-10 px-4">
        <div className="w-full max-w-2xl">
          {submitted ? (
            <SuccessState />
          ) : (
            <>
              {/* Section title */}
              <div className="mb-8">
                <p className="font-mono text-xs text-brand-skyblue mb-1 tracking-wider uppercase">
                  {SECTION_NAMES[step]}
                </p>
                <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
                  Solicitud de Acceso Anticipado
                </h1>
              </div>

              {/* Step content */}
              <div className="space-y-6">
                {step === 0 && <Step1 data={data} update={update} />}
                {step === 1 && <Step2 data={data} update={update} />}
                {step === 2 && <Step3 data={data} update={update} />}
                {step === 3 && <Step4 data={data} update={update} />}
                {step === 4 && <Step5 data={data} update={update} />}
              </div>

              {/* Error */}
              {error && (
                <p className="mt-4 text-sm text-destructive font-mono">
                  {error}
                </p>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-10 pt-6 border-t border-border">
                {step > 0 ? (
                  <Button variant="ghost" onClick={goBack}>
                    <ArrowLeft className="w-4 h-4" />
                    Atrás
                  </Button>
                ) : (
                  <Button variant="ghost" asChild>
                    <Link href="/">
                      <ArrowLeft className="w-4 h-4" />
                      Volver
                    </Link>
                  </Button>
                )}
                {step < TOTAL_STEPS - 1 ? (
                  <Button variant="gradient" onClick={goNext}>
                    Siguiente
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    variant="gradient"
                    onClick={handleSubmit}
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Enviar Solicitud
                      </>
                    )}
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

// ── Success ──

function SuccessState() {
  return (
    <div className="text-center py-16 space-y-6">
      <CheckCircle2 className="w-20 h-20 text-status-completed mx-auto" />
      <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground">
        ¡Solicitud enviada!
      </h2>
      <p className="text-muted-foreground max-w-md mx-auto text-lg leading-relaxed">
        Gracias por tu interés en Umbral. Revisaremos tu solicitud y te
        contactaremos pronto.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <a
          href="https://chat.whatsapp.com/ET8AwrRVyg712LIrs6pz59"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[image:var(--gradient-brand)] text-white px-6 py-3 rounded-lg font-semibold hover:shadow-[var(--shadow-glow)] hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Únete a la comunidad en WhatsApp
        </a>
        <Link
          href="/"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}

// ── Step props ──

type StepProps = {
  data: EarlyAccessFormData;
  update: <K extends keyof EarlyAccessFormData>(
    key: K,
    value: EarlyAccessFormData[K]
  ) => void;
};

// ── Steps ──

function Step1({ data, update }: StepProps) {
  return (
    <>
      <div>
        <QuestionLabel>¿Cómo te llamas?</QuestionLabel>
        <Input
          placeholder="Tu nombre completo"
          value={data.name}
          onChange={(e) => update("name", e.target.value)}
        />
      </div>
      <div>
        <QuestionLabel>¿Cuál es tu correo electrónico?</QuestionLabel>
        <Input
          type="email"
          placeholder="tu@email.com"
          value={data.email}
          onChange={(e) => update("email", e.target.value)}
        />
      </div>
      <div>
        <QuestionLabel>¿En qué país estás?</QuestionLabel>
        <Input
          placeholder="Ej: Colombia, México, España..."
          value={data.country}
          onChange={(e) => update("country", e.target.value)}
        />
      </div>
      <div>
        <QuestionLabel>¿En qué rango de edad te encuentras?</QuestionLabel>
        <SingleSelectGroup
          options={AGE_RANGES}
          value={data.age_range}
          onChange={(v) => update("age_range", v)}
        />
      </div>
      <div>
        <QuestionLabel>
          ¿Cuál es tu perfil profesional o área principal?
        </QuestionLabel>
        <MultiSelectGroup
          options={PROFESSIONAL_PROFILES}
          value={data.professional_profiles}
          onChange={(v) => update("professional_profiles", v)}
          hasOther
          otherValue={data.professional_profiles_other}
          onOtherChange={(v) => update("professional_profiles_other", v)}
        />
      </div>
      <div>
        <QuestionLabel>¿Cuál describe mejor tu situación actual?</QuestionLabel>
        <SingleSelectGroup
          options={CURRENT_SITUATIONS}
          value={data.current_situation}
          onChange={(v) => update("current_situation", v)}
          hasOther
          otherValue={data.current_situation_other}
          onOtherChange={(v) => update("current_situation_other", v)}
        />
      </div>
      <div>
        <QuestionLabel>¿Cuánta experiencia tienes programando?</QuestionLabel>
        <SingleSelectGroup
          options={PROGRAMMING_EXPERIENCE}
          value={data.programming_experience}
          onChange={(v) => update("programming_experience", v)}
        />
      </div>
    </>
  );
}

function Step2({ data, update }: StepProps) {
  return (
    <>
      <div>
        <QuestionLabel>
          ¿Qué plataformas o recursos has usado para aprender programación o IA?
        </QuestionLabel>
        <MultiSelectGroup
          options={PLATFORMS_USED}
          value={data.platforms_used}
          onChange={(v) => update("platforms_used", v)}
          hasOther
          otherValue={data.platforms_used_other}
          onOtherChange={(v) => update("platforms_used_other", v)}
        />
      </div>
      <div>
        <QuestionLabel>
          ¿Cuál ha sido tu mayor frustración aprendiendo a programar o sobre IA?
        </QuestionLabel>
        <MultiSelectGroup
          options={BIGGEST_FRUSTRATIONS}
          value={data.biggest_frustrations}
          onChange={(v) => update("biggest_frustrations", v)}
          hasOther
          otherValue={data.biggest_frustrations_other}
          onOtherChange={(v) => update("biggest_frustrations_other", v)}
        />
      </div>
      <div>
        <QuestionLabel>
          ¿Alguna vez has abandonado un curso o tutorial antes de terminarlo?
        </QuestionLabel>
        <SingleSelectGroup
          options={ABANDONED_COURSES}
          value={data.abandoned_courses}
          onChange={(v) => update("abandoned_courses", v)}
        />
      </div>
    </>
  );
}

function Step3({ data, update }: StepProps) {
  return (
    <>
      <div>
        <QuestionLabel>
          Si pudieras construir un proyecto con IA en las próximas semanas,
          ¿qué tipo de producto te interesaría más?
        </QuestionLabel>
        <MultiSelectGroup
          options={PROJECT_TYPES}
          value={data.project_types}
          onChange={(v) => update("project_types", v)}
          hasOther
          otherValue={data.project_types_other}
          onOtherChange={(v) => update("project_types_other", v)}
        />
      </div>
      <div>
        <QuestionLabel>
          ¿Qué tan importante es para ti que tu proyecto termine desplegado en
          internet con usuarios reales?
        </QuestionLabel>
        <SingleSelectGroup
          options={DEPLOYMENT_IMPORTANCE}
          value={data.deployment_importance}
          onChange={(v) => update("deployment_importance", v)}
        />
      </div>
    </>
  );
}

function Step4({ data, update }: StepProps) {
  return (
    <>
      <div>
        <QuestionLabel>
          ¿Qué features te parecen más valiosas? (ordena de mayor a menor
          importancia)
        </QuestionLabel>
        <RankingList
          items={data.feature_ranking}
          onChange={(items) => update("feature_ranking", items)}
        />
      </div>
      <div>
        <QuestionLabel>
          ¿Cuánto tiempo a la semana podrías dedicar a construir tu proyecto?
        </QuestionLabel>
        <SingleSelectGroup
          options={WEEKLY_TIME}
          value={data.weekly_time}
          onChange={(v) => update("weekly_time", v)}
        />
      </div>
      <div>
        <QuestionLabel>
          ¿Hay algo específico que te gustaría que Umbral tuviera y que no hayas
          encontrado en otras plataformas?
        </QuestionLabel>
        <textarea
          placeholder="Escribe aquí tus sugerencias (opcional)"
          value={data.suggestions}
          onChange={(e) => update("suggestions", e.target.value)}
          rows={4}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-mono placeholder:text-muted-foreground focus-visible:border-brand-skyblue focus-visible:ring-brand-skyblue/30 focus-visible:ring-[3px] outline-none transition-all"
        />
      </div>
    </>
  );
}

function Step5({ data, update }: StepProps) {
  const toggleConfirmation = (
    key: keyof EarlyAccessFormData["confirmations"]
  ) => {
    update("confirmations", {
      ...data.confirmations,
      [key]: !data.confirmations[key],
    });
  };

  return (
    <>
      <div>
        <QuestionLabel>
          ¿Cuánto estarías dispuesto/a a pagar mensualmente por una plataforma
          como Umbral? (en USD)
        </QuestionLabel>
        <SingleSelectGroup
          options={MONTHLY_PAYMENT}
          value={data.monthly_payment}
          onChange={(v) => update("monthly_payment", v)}
        />
      </div>
      <div>
        <QuestionLabel>Confirmaciones requeridas:</QuestionLabel>
        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={data.confirmations.terms}
              onChange={() => toggleConfirmation("terms")}
              className="mt-0.5 accent-brand-skyblue"
            />
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              He leído y acepto los Términos y Condiciones de LooperTech.{" "}
              <span className="text-destructive">*</span>
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={data.confirmations.privacy}
              onChange={() => toggleConfirmation("privacy")}
              className="mt-0.5 accent-brand-skyblue"
            />
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              He leído y acepto la Política de Privacidad y Tratamiento de
              Datos de LooperTech.{" "}
              <span className="text-destructive">*</span>
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={data.confirmations.beta}
              onChange={() => toggleConfirmation("beta")}
              className="mt-0.5 accent-brand-skyblue"
            />
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              Acepto participar en el programa de acceso anticipado (beta) de
              Umbral, entendiendo que la plataforma se encuentra en fase de
              desarrollo y que mi feedback será utilizado para mejorar la
              experiencia.{" "}
              <span className="text-destructive">*</span>
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={data.confirmations.communications}
              onChange={() => toggleConfirmation("communications")}
              className="mt-0.5 accent-brand-skyblue"
            />
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
              (Opcional) Acepto recibir comunicaciones sobre actualizaciones,
              novedades y lanzamientos de Umbral y LooperTech.
            </span>
          </label>
        </div>
      </div>
    </>
  );
}
