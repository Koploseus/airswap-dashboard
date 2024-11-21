import { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { DailyData, TimeRange } from './types';
import { formatUSD } from '@/lib/utils/format';
import { formatDate } from '@/lib/utils/date';

const timeRanges: TimeRange[] = [
  { label: '1M', days: 30 },
  { label: '6M', days: 180 },
  { label: '1Y', days: 365 },
  { label: '4Y', days: 1460 }
];

export function DAORevenue({ dailyData }: { dailyData: DailyData[] }) {
  const [selectedRange, setSelectedRange] = useState<TimeRange>(timeRanges[0]);
  const [totalFees, setTotalFees] = useState<number>(0);
  const [averageDailyFees, setAverageDailyFees] = useState<number>(0);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const now = Math.floor(Date.now() / 1000);
    const cutoffDate = now - (selectedRange.days * 24 * 60 * 60);
    
    const filteredData = dailyData
      .filter(day => day.date >= cutoffDate)
      .map(day => ({
        date: new Date(day.date * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        fees: parseFloat(day.fees || '0'),
        volume: parseFloat(day.volume || '0')
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    setChartData(filteredData);

    const total = filteredData.reduce((sum, day) => sum + day.fees, 0);
    setTotalFees(total);
    setAverageDailyFees(total / (filteredData.length || 1));
  }, [dailyData, selectedRange]);

  return (
    <div className="bg-white rounded-lg">
      <div className="px-4 py-3 border-b flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">DAO Revenue</h2>
          <div className="mt-1 text-sm text-gray-500">
            Total Fees: {formatUSD(totalFees)}
            <span className="mx-2">•</span>
            Daily Average: {formatUSD(averageDailyFees)}
          </div>
        </div>
        <div className="flex space-x-2">
          {timeRanges.map((range) => (
            <button
              key={range.label}
              onClick={() => setSelectedRange(range)}
              className={`px-3 py-1 rounded ${
                selectedRange.label === range.label 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>
      <div className="p-4 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              interval="preserveStart"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip 
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Fees']}
              labelFormatter={(label) => label}
            />
            <Bar 
              dataKey="fees" 
              fill="#2563eb"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}