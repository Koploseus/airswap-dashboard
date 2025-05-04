import { secureRequest } from '@/lib/utils';
import { gql } from 'graphql-request';

export const DAILY_VOLUME_QUERY = gql`
  query GetDailyData($timestamp: Int!, $skip: Int!) {
    dailies(
      first: 1000,
      skip: $skip,
      where: { date_gte: $timestamp }
      orderBy: date
      orderDirection: desc
    ) {
      date
      fees
      volume
    }
  }
`;

export const BIGGEST_SWAPS_QUERY = gql`
  query GetBigSwaps($timestamp24h: Int!, $timestamp7d: Int!, $timestamp30d: Int!, $minAmount: String!, $skip: Int!) {
    last24h: swapERC20S(
      first: 50,
      skip: $skip,
      where: { 
        blockTimestamp_gt: $timestamp24h,
        senderAmountUSD_gt: $minAmount
      },
      orderBy: senderAmountUSD,
      orderDirection: desc
    ) {
      id
      blockTimestamp
      transactionHash
      senderAmountUSD
      feeAmountUSD
    }
    last7d: swapERC20S(
      first: 50,
      skip: $skip,
      where: { 
        blockTimestamp_gt: $timestamp7d,
        senderAmountUSD_gt: $minAmount
      },
      orderBy: senderAmountUSD,
      orderDirection: desc
    ) {
      id
      blockTimestamp
      transactionHash
      senderAmountUSD
      feeAmountUSD
    }
    last30d: swapERC20S(
      first: 50,
      skip: $skip,
      where: { 
        blockTimestamp_gt: $timestamp30d,
        senderAmountUSD_gt: $minAmount
      },
      orderBy: senderAmountUSD,
      orderDirection: desc
    ) {
      id
      blockTimestamp
      transactionHash
      senderAmountUSD
      feeAmountUSD
    }
  }
`;

export const SERVERS_QUERY = gql`
  query GetServers {
    servers(first: 50) {
      id
      url
      protocols
      tokens
    }
  }
`;

export const TOKEN_ANALYTICS_SWAPS_QUERY = gql`
  query GetRecentSwaps($timestamp: Int!, $skip: Int!) {
    swapERC20S(
      first: 1000,
      skip: $skip,
      where: { blockTimestamp_gt: $timestamp }
      orderBy: senderAmountUSD
      orderDirection: desc
    ) {
      id
      senderToken
      signerToken
      senderAmountUSD
      signerAmountUSD
      blockTimestamp
      transactionHash
      from
      to
    }
  }
`;

// Helper function to fetch all data using pagination
export async function fetchAllData<T>(
  query: string,
  variables: Record<string, any>,
  dataKey: string
): Promise<T[]> {
  let allData: T[] = [];
  let skip = 0;
  let hasMore = true;

  while (hasMore) {
    const response = await secureRequest<Record<string, T[]>>(
      query,
      { ...variables, skip }
    );

    if (!response.data || !response.data[dataKey]) {
      throw new Error('Invalid response data');
    }

    const newData = response.data[dataKey];
    allData = [...allData, ...newData];

    // If we got less than 1000 items, we've reached the end
    hasMore = newData.length === 1000;
    skip += 1000;
  }

  return allData;
}