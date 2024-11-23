'use client';

import { useState, useEffect } from 'react';
import { request } from 'graphql-request';
import { SUBGRAPH_URL } from '@/lib/api/graphql/client';
import { DAILY_VOLUME_QUERY, BIGGEST_SWAPS_QUERY, SERVERS_QUERY } from '@/lib/api/graphql/queries';
import { DAORevenue } from '@/components/revenue/DAORevenue';
import { VolumeStats } from '@/components/volume/VolumeStats';
import { BiggestSwaps } from '@/components/swaps/BiggestSwaps';
import { MarketMakers } from '@/components/market-makers/MarketMakers';
import { SwapData } from '@/components/swaps/type';
import { ServerData } from '@/components/market-makers/types';
import { DailyData } from '@/components/revenue/types';
import { VolumeData } from '@/components/volume/type';

export default function Home() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'24h' | '7d' | '30d'>('24h');
  const [volumes, setVolumes] = useState<VolumeData | null>(null);
  const [biggestSwaps, setBiggestSwaps] = useState<{
    '24h': SwapData[];
    '7d': SwapData[];
    '30d': SwapData[];
  } | null>(null);
  const [servers, setServers] = useState<ServerData[]>([]);
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!process.env.NEXT_PUBLIC_GRAPH_API_KEY) {
        setError('API key not found');
        setLoading(false);
        return;
      }

      try {
        const now = Math.floor(Date.now() / 1000);
        const timestamp24h = now - (24 * 60 * 60);
        const timestamp7d = now - (7 * 24 * 60 * 60);
        const timestamp30d = now - (30 * 24 * 60 * 60);
        // Get data for 4 years to cover all possible timeframes
        const timestamp4y = now - (4 * 365 * 24 * 60 * 60);

        const [dailyResponse, bigSwapsResponse, serversResponse] = await Promise.all([
          request<{ dailies: DailyData[] }>(
            SUBGRAPH_URL,
            DAILY_VOLUME_QUERY,
            {
              fromTimestamp: timestamp4y // Use 4y timestamp to get all needed data
            }
          ),
          request<{
            last24h: SwapData[];
            last7d: SwapData[];
            last30d: SwapData[];
          }>(
            SUBGRAPH_URL,
            BIGGEST_SWAPS_QUERY,
            { 
              timestamp24h,
              timestamp7d,
              timestamp30d,
              minAmount: "50000"
            }
          ),
          request<{ servers: ServerData[] }>(
            SUBGRAPH_URL,
            SERVERS_QUERY
          ),
        ]);

        // Store the daily data
        setDailyData(dailyResponse.dailies);

        // Calculate volumes for the cards
        const calculateRollingVolume = (data: DailyData[], fromTimestamp: number) => {
          let totalVolume = 0;
          
          data.forEach(day => {
            const dayStart = day.date;
            const dayEnd = dayStart + (24 * 60 * 60);
            const dailyVolume = parseFloat(day.volume || '0');

            const overlapStart = Math.max(dayStart, fromTimestamp);
            const overlapEnd = Math.min(dayEnd, now);

            if (overlapEnd > overlapStart) {
              const overlapDuration = overlapEnd - overlapStart;
              const dayDuration = dayEnd - dayStart;
              const proportion = overlapDuration / dayDuration;
              
              totalVolume += dailyVolume * proportion;
            }
          });

          return totalVolume;
        };

        const volumes = {
          '24h': calculateRollingVolume(dailyResponse.dailies, timestamp24h),
          '7d': calculateRollingVolume(dailyResponse.dailies, timestamp7d),
          '30d': calculateRollingVolume(dailyResponse.dailies, timestamp30d)
        };

        setVolumes(volumes);
        setBiggestSwaps({
          '24h': bigSwapsResponse.last24h,
          '7d': bigSwapsResponse.last7d,
          '30d': bigSwapsResponse.last30d
        });
        setServers(serversResponse.servers);
        setLoading(false);

      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="p-4">Loading...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <main className="min-h-screen p-4 bg-gray-50">
      <div className="max-w-[1400px] mx-auto space-y-4">
        {volumes && <VolumeStats volumes={volumes} />}
        <DAORevenue dailyData={dailyData} />
        <MarketMakers servers={servers} />
        {biggestSwaps && (
          <BiggestSwaps 
            swaps={biggestSwaps}
            selectedTimeframe={selectedTimeframe}
            onTimeframeChange={setSelectedTimeframe}
          />
        )}
      </div>
    </main>
  );
}