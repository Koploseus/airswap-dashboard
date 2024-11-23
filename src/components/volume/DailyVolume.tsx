import { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  CartesianGrid 
} from 'recharts';
import { DailyData } from '@/components/revenue/types';
import { formatUSD } from '@/lib/utils/format';

const timeRanges = [
  { label: '1M', days: 30 },
  { label: '6M', days: 180 },
  { label: '1Y', days: 365 },
  { label: '4Y', days: 1460 }
] as const;

type TimeFrameType = typeof timeRanges[number]['label'];

export function DailyVolume({ dailyData }: { dailyData: DailyData[] }) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeFrameType>('1M');
  const [totalVolume, setTotalVolume] = useState(0);
  const [averageDailyVolume, setAverageDailyVolume] = useState(0);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const now = Math.floor(Date.now() / 1000);
    const selectedRange = timeRanges.find(range => range.label === selectedTimeframe)!;
    const cutoffDate = now - (selectedRange.days * 24 * 60 * 60);
    
    const filteredData = dailyData
      .filter(day => day.date >= cutoffDate)
      .map(day => ({
        date: new Date(day.date * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        volume: parseFloat(day.volume || '0')
      }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const total = filteredData.reduce((sum, day) => sum + day.volume, 0);
    setTotalVolume(total);
    setAverageDailyVolume(total / filteredData.length);
    setChartData(filteredData.reverse()); // Reverse to show oldest to newest
  }, [dailyData, selectedTimeframe]);

  return (
    <div className="bg-white rounded-lg">
      <div className="px-4 py-3 border-b flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Daily Volume</h2>
          <div className="mt-1 text-sm text-gray-500">
            Total Volume: {formatUSD(totalVolume)}
            <span className="mx-2">•</span>
            Daily Average: {formatUSD(averageDailyVolume)}
          </div>
        </div>
        <div className="flex space-x-2">
          {timeRanges.map((range) => (
            <button
              key={range.label}
              onClick={() => setSelectedTimeframe(range.label)}
              className={`px-3 py-1 rounded ${
                selectedTimeframe === range.label 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>
      <div className="p-4 h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false}
              stroke="#E5E7EB"
            />
            <XAxis 
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
              interval="preserveStart"
            />
            <YAxis 
              tickFormatter={(value) => `$${value.toLocaleString()}`}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
            />
            <Tooltip 
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Volume']}
              labelFormatter={(label) => label}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                padding: '8px'
              }}
            />
            <Bar 
              dataKey="volume"
              fill="#3B82F6"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}