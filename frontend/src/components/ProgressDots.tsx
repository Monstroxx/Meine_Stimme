interface ProgressDotsProps {
  step: number;
  total: number;
}

export function ProgressDots({ step, total }: ProgressDotsProps) {
  return (
    <div className="flex justify-center gap-3 pt-4" role="presentation">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`h-3.5 w-3.5 rounded-full transition-colors ${
            i === step ? 'bg-brand-blue' : 'bg-gray-300'
          }`}
        />
      ))}
    </div>
  );
}
