
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useWallet } from '../hooks/useWallet';
import { usePrices } from '../hooks/usePrices';

const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#64748B'];

interface ChartData {
  name: string;
  value: number;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-700 p-2 border border-slate-600 rounded-md shadow-lg">
        <p className="label text-white">{`${payload[0].name} : $${payload[0].value.toFixed(2)}`}</p>
      </div>
    );
  }
  return null;
};

const PortfolioChart: React.FC = () => {
  const { state } = useWallet();
  const { getPrice } = usePrices();

  const data: ChartData[] = state.wallets
    .map(wallet => ({
      name: wallet.coinId,
      value: wallet.balance * getPrice(wallet.coinId)
    }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);

  if(data.length === 0) {
    return (
        <div className="flex items-center justify-center h-full text-slate-500">
            No assets to display in chart.
        </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius="80%"
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => <span className="text-slate-300">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default PortfolioChart;
