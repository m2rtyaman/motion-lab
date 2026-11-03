import type { FC } from 'react';

export interface CounterValueProps {
  id?: string;
  className?: string;
  value: string | number;
  prefix?: string;
  suffix?: string;
  unit?: string;
}

export const CounterValue: FC<CounterValueProps> = ({
  id,
  className = '',
  value,
  prefix = '',
  suffix = '',
  unit = '',
}) => {
  return (
    <div
      id={id}
      className={`inline-flex items-baseline font-mono tabular-nums tracking-tight font-bold text-white ${className}`}
    >
      {prefix && <span className="text-white/50 mr-1 text-[20px]">{prefix}</span>}
      <span className="counter-number">{value}</span>
      {suffix && <span className="text-white/50 ml-1 text-[20px]">{suffix}</span>}
      {unit && <span className="text-white/40 ml-2 font-normal text-[18px]">{unit}</span>}
    </div>
  );
};
