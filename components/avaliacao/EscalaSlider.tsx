"use client";

export interface EscalaSliderProps {
  name: string;
  label: string;
  hint?: string;
  defaultValue?: number;
}

/** Slider 0–10 — mesmo padrão visual de components/fisioterapia/Resposta24hForm.tsx. */
export function EscalaSlider({ name, label, hint, defaultValue = 0 }: EscalaSliderProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium font-sans text-ink">
        {label}
        {hint && <span className="ml-1 font-normal text-mid">{hint}</span>}
      </label>
      <div className="flex items-center gap-3">
        <input
          id={name}
          name={name}
          type="range"
          min={0}
          max={10}
          step={1}
          defaultValue={defaultValue}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-smoke accent-fire"
          onInput={(e) => {
            const output = e.currentTarget.nextElementSibling as HTMLOutputElement | null;
            if (output) output.value = e.currentTarget.value;
          }}
        />
        <output htmlFor={name} className="w-6 text-center font-display text-xl text-fire-text">
          {defaultValue}
        </output>
      </div>
    </div>
  );
}
