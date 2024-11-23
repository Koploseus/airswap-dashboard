import { SwapData } from './type';
import { formatUSD } from '@/lib/utils/format';
import { formatTimeAgo } from '@/lib/utils/date';

interface BiggestSwapsProps {
  swaps: {
    '24h': SwapData[];
    '7d': SwapData[];
    '30d': SwapData[];
  };
  selectedTimeframe: '24h' | '7d' | '30d';
  onTimeframeChange: (timeframe: '24h' | '7d' | '30d') => void;
}

export function BiggestSwaps({ swaps, selectedTimeframe, onTimeframeChange }: BiggestSwapsProps) {
  const getSwapsForTimeframe = () => swaps?.[selectedTimeframe] || [];

  return (
    <div className="bg-white rounded-lg">
      <div className="px-4 py-3 border-b flex justify-between items-center">
        <h2 className="text-xl font-bold">Top 10 Biggest Swaps ($50,000+)</h2>
        <div className="flex space-x-2">
          {(['24h', '7d', '30d'] as const).map((timeframe) => (
            <button
              key={timeframe}
              onClick={() => onTimeframeChange(timeframe)}
              className={`px-3 py-1 rounded ${
                selectedTimeframe === timeframe ? 'bg-blue-600 text-white' : 'bg-gray-100'
              }`}
            >
              {timeframe}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Time</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Transaction</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Amount (USD)</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Fee</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {getSwapsForTimeframe().map((swap) => (
              <tr key={swap.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">
                  {formatTimeAgo(swap.blockTimestamp)}
                </td>
                <td className="px-4 py-3 text-sm">
                  <a 
                    href={`https://etherscan.io/tx/${swap.transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 font-mono"
                  >
                    {`${swap.transactionHash.slice(0, 6)}...${swap.transactionHash.slice(-4)}`}
                  </a>
                </td>
                <td className="px-4 py-3 text-sm text-right text-green-600">
                  {formatUSD(parseFloat(swap.senderAmountUSD))}
                </td>
                <td className="px-4 py-3 text-sm text-right">
                  {formatUSD(parseFloat(swap.feeAmountUSD))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}