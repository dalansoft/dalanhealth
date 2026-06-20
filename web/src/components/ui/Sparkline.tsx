import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface Props {
  data: number[];
  color?: string;
  className?: string;
}

export function Sparkline({ data, color = '#14b8a6', className }: Props) {
  const pts = data.map((v, i) => ({ i, v }));
  return (
    <div className={className ?? 'h-10 w-full'}>
      <ResponsiveContainer>
        <LineChart data={pts} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <Line type="monotone" dataKey="v" stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
