import { VolumeData } from '@/components/volume/type';
import { formatUSD } from '@/lib/utils/format';

export function VolumeStats({ volumes }: { volumes: VolumeData | null }) {
  if (!volumes) return null;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {(Object.entries(volumes) as [keyof VolumeData, number][]).map(([period, amount]) => (
        <div key={period} className="bg-white rounded-lg p-4">
          <h2 className="text-lg text-gray-600">{period} Volume</h2>
          <p className="text-2xl font-bold text-black">
            {formatUSD(amount)}
          </p>
        </div>
      ))}
    </div>
  );
}
