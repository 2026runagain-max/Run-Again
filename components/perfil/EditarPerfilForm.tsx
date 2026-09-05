"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { editarPerfilAction, enviarFotoPerfilAction } from "@/lib/auth/actions";

/**
 * Item 14 (feedback da Marina) — edição de informações básicas do perfil:
 * nome, foto, Instagram e Strava (os dois últimos são só texto — sem
 * integração de API com nenhuma das plataformas nesta fase).
 *
 * Dois <form> independentes (foto e dados de texto) em vez de um só: o
 * upload de foto já revalida e atualiza sozinho ao soltar o arquivo — não
 * faz sentido prender essa ação ao clique de "Salvar" dos campos de texto.
 */
export function EditarPerfilForm({
  nomeInicial,
  instagramInicial,
  stravaInicial,
  fotoUrlInicial,
}: {
  nomeInicial: string;
  instagramInicial: string;
  stravaInicial: string;
  fotoUrlInicial: string | null;
}) {
  return (
    <div className="flex flex-col gap-6">
      <FotoPerfilUpload nome={nomeInicial} fotoUrlInicial={fotoUrlInicial} />
      <DadosBasicosForm nomeInicial={nomeInicial} instagramInicial={instagramInicial} stravaInicial={stravaInicial} />
    </div>
  );
}

function FotoPerfilUpload({ nome, fotoUrlInicial }: { nome: string; fotoUrlInicial: string | null }) {
  const [state, formAction, pending] = useActionState(enviarFotoPerfilAction, null);
  const [fotoUrl, setFotoUrl] = useState(fotoUrlInicial);
  const formRef = useRef<HTMLFormElement>(null);

  // Ajuste de estado durante a renderização: assim que o upload terminar
  // com sucesso, troca a prévia pra URL definitiva do Storage.
  const [stateAnterior, setStateAnterior] = useState(state);
  if (state !== stateAnterior) {
    setStateAnterior(state);
    if (state?.ok && state.data) setFotoUrl(state.data.fotoUrl);
  }

  return (
    <form ref={formRef} action={formAction} className="flex items-center gap-4">
      <Avatar nome={nome} fotoUrl={fotoUrl} className="h-16 w-16 text-base" />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium font-sans text-ink" htmlFor="foto-perfil-input">
          Foto de perfil
        </label>
        <input
          id="foto-perfil-input"
          type="file"
          name="foto"
          accept="image/jpeg,image/png,image/webp"
          onChange={() => formRef.current?.requestSubmit()}
          disabled={pending}
          className="text-xs font-sans text-mid file:mr-3 file:rounded-full file:border-0 file:bg-fire-dim file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-fire-text hover:file:bg-fire/25"
        />
        {pending && (
          <p className="text-xs font-sans text-mid" role="status">
            Enviando...
          </p>
        )}
        {state && !state.ok && (
          <p className="text-xs font-sans text-fire-text" role="alert">
            {state.erro}
          </p>
        )}
      </div>
    </form>
  );
}

function DadosBasicosForm({
  nomeInicial,
  instagramInicial,
  stravaInicial,
}: {
  nomeInicial: string;
  instagramInicial: string;
  stravaInicial: string;
}) {
  const [state, formAction, pending] = useActionState(editarPerfilAction, null);
  const [mostrarSucesso, setMostrarSucesso] = useState(false);

  const [stateAnterior, setStateAnterior] = useState(state);
  if (state !== stateAnterior) {
    setStateAnterior(state);
    if (state?.ok) setMostrarSucesso(true);
  }

  useEffect(() => {
    if (!mostrarSucesso) return;
    const t = setTimeout(() => setMostrarSucesso(false), 2500);
    return () => clearTimeout(t);
  }, [mostrarSucesso]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Input name="nome" label="Nome" defaultValue={nomeInicial} maxLength={120} required />
      <Input
        name="instagram"
        label="Instagram"
        placeholder="@seuusuario"
        defaultValue={instagramInicial}
        maxLength={120}
      />
      <Input
        name="strava"
        label="Strava"
        placeholder="Link do seu perfil no Strava"
        defaultValue={stravaInicial}
        maxLength={200}
      />

      {state && !state.ok && (
        <p className="text-sm font-sans text-fire-text" role="alert">
          {state.erro}
        </p>
      )}
      {mostrarSucesso && (
        <p className="text-sm font-sans text-ink" role="status">
          Perfil atualizado.
        </p>
      )}

      <Button type="submit" variant="primary" loading={pending} className="self-start">
        Salvar
      </Button>
    </form>
  );
}
