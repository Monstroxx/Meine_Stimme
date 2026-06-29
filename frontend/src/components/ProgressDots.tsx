interface ProgressDotsProps {
  step: number;
  total: number;
}

export function ProgressDots({ step, total }: ProgressDotsProps) {
  return (
    <div className="flex justify-center gap-2" role="presentation">
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`h-3 w-3 rounded-full ${i === step ? 'bg-blue-600' : 'bg-gray-300'}`}
        />
      ))}
    </div>
  );
}
