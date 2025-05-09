import { useState, useEffect } from 'react';
import { SwapData } from './type';
import { formatUSD } from '@/lib/utils/format';
import { formatTimeAgo } from '@/lib/utils/date';
import { BIGGEST_SWAPS_QUERY, fetchAllData } from '@/app/api/graphql/queries';

const PERIODS = [
  { label: '24h' },
  { label: '7d' },
  { label: '30d' },
];

type PeriodLabel = '24h' | '7d' | '30d';

interface TokenMeta {
  address: string;
  symbol: string;
  name: string;
  logoURI?: string;
}

interface BiggestSwapsProps {
  swaps: {
    '24h': SwapData[];
    '7d': SwapData[];
    '30d': SwapData[];
  };
  selectedTimeframe: PeriodLabel;
  onTimeframeChange: (timeframe: PeriodLabel) => void;
}

// Fallback for known tokens in case metadata doesn't load
const FALLBACK_TOKENS: Record<string, { symbol: string, name: string }> = {
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': { symbol: 'WETH', name: 'Wrapped Ether' },
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': { symbol: 'USDC', name: 'USD Coin' },
  '0xdac17f958d2ee523a2206206994597c13d831ec7': { symbol: 'USDT', name: 'Tether USD' },
  '0x6b175474e89094c44da98b954eedeac495271d0f': { symbol: 'DAI', name: 'Dai Stablecoin' },
  '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599': { symbol: 'WBTC', name: 'Wrapped Bitcoin' },
};

export function BiggestSwaps({ swaps, selectedTimeframe, onTimeframeChange }: BiggestSwapsProps) {
  const [tokenMetaMap, setTokenMetaMap] = useState<Record<string, TokenMeta>>({});
  const [isMetadataLoaded, setIsMetadataLoaded] = useState(false);

  // Load token metadata from local file
  useEffect(() => {
    console.log('Fetching token metadata for BiggestSwaps...');
    fetch('/tokenMetadata.json')
      .then(res => {
        console.log('Token metadata response status:', res.status);
        return res.json();
      })
      .then(data => {
        console.log('Token metadata loaded for BiggestSwaps, token count:', Object.keys(data).length);
        if (data) {
          setTokenMetaMap(data);
          setIsMetadataLoaded(true);
        }
      })
      .catch(err => {
        console.error('Error loading token metadata for BiggestSwaps:', err);
        setIsMetadataLoaded(true); // Continue with fallback even if loading fails
      });
  }, []);

  // Helper function to format token addresses with metadata
  const renderToken = (address: string) => {
    if (!address) return "Unknown";
    
    const lowerAddress = address.toLowerCase();
    const meta = tokenMetaMap[lowerAddress];
    
    if (meta) {
      return (
        <span className="flex items-center gap-1">
          {meta.logoURI ? (
            <img src={meta.logoURI} alt={meta.symbol} className="w-4 h-4 rounded-full" />
          ) : (
            <span className="w-4 h-4 flex items-center justify-center rounded-full bg-gray-200 text-gray-500">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <circle cx="8" cy="8" r="8" />
              </svg>
            </span>
          )}
          <span>{meta.symbol}</span>
        </span>
      );
    }
    
    // Fallback to hardcoded known tokens
    if (FALLBACK_TOKENS[lowerAddress]) {
      return FALLBACK_TOKENS[lowerAddress].symbol;
    }
    
    // If no metadata is available, show the shortened address
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const getSwapsForTimeframe = () => {
    const timeframeSwaps = swaps?.[selectedTimeframe] || [];
    // Sort by amount in case we got more than 10 items
    return timeframeSwaps
      .sort((a, b) => parseFloat(b.senderAmountUSD) - parseFloat(a.senderAmountUSD))
      .slice(0, 10);
  };

  return (
    <section className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h2 className="text-xl font-bold">Top 10 Biggest Swaps ($50,000+)</h2>
        <div className="flex gap-2">
          {PERIODS.map(({ label }) => (
            <button
              key={label}
              className={`px-3 py-1 rounded font-medium border transition-colors text-sm ${selectedTimeframe === label ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'}`}
              onClick={() => onTimeframeChange(label as PeriodLabel)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="overflow-x-auto p-4">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Time</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Transaction</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Pair</th>
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
                <td className="px-4 py-3 text-sm">
                  {swap.senderToken && swap.signerToken ? (
                    <span className="whitespace-nowrap flex items-center gap-1">
                      {renderToken(swap.senderToken)} <span className="text-gray-500">→</span> {renderToken(swap.signerToken)}
                    </span>
                  ) : "Unknown Pair"}
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
    </section>
  );
}