import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#6366f1', '#f59e0b', '#8b5cf6', '#10b981', '#ef4444'];

export const TaskBarChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={200}>
    <BarChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
      <XAxis dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
      <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
      <Tooltip
        contentStyle={{ background: '#1a2235', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }}
        itemStyle={{ color: '#c4b5fd' }}
        cursor={{ fill: 'rgba(99,102,241,0.1)' }}
      />
      <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={40} />
    </BarChart>
  </ResponsiveContainer>
);

export const TaskPieChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={200}>
    <PieChart>
      <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="count">
        {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
      </Pie>
      <Tooltip contentStyle={{ background: '#1a2235', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff' }} />
      <Legend wrapperStyle={{ color: '#9ca3af', fontSize: '12px' }} />
    </PieChart>
  </ResponsiveContainer>
);
