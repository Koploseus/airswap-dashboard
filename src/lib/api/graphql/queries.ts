import { gql } from 'graphql-request';

export const DAILY_VOLUME_QUERY = gql`
  query GetDailyData($fromTimestamp: Int!) {
    dailies(
      where: { date_gte: $fromTimestamp }
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
  query GetBigSwaps($timestamp24h: Int!, $timestamp7d: Int!, $timestamp30d: Int!, $minAmount: String!) {
    last24h: swapERC20S(
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
      senderAmount
      senderToken
      signerAmount
      signerToken
      signerAmountUSD
      feeAmount
      feeAmountUSD
    }
    last7d: swapERC20S(
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
      senderToken
      signerToken
      feeAmountUSD
    }
    last30d: swapERC20S(
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
      senderToken
      signerToken
      feeAmountUSD
    }
  }
`;

export const SERVERS_QUERY = gql`
  query GetServers {
    servers(first: 100) {
      id
      url
      protocols
      tokens
    }
  }
`;