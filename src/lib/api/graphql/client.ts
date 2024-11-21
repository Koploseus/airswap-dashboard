import { request } from 'graphql-request';

export const API_KEY = process.env.NEXT_PUBLIC_GRAPH_API_KEY;
export const SUBGRAPH_URL = `https://gateway.thegraph.com/api/${API_KEY}/subgraphs/id/7ruo9nxQ3LUqnKkbLgmETDQ27j6A2DFx5L5eV6MS2TAz`;