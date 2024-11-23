
export const API_KEY = process.env.NEXT_PUBLIC_GRAPH_API_KEY;
export const SUBGRAPH_URL = `https://gateway.thegraph.com/api/${API_KEY}/subgraphs/id/7ruo9nxQ3LUqnKkbLgmETDQ27j6A2DFx5L5eV6MS2TAz`;

export async function request<T>(query: string, variables?: Record<string, any>): Promise<T> {
    const response = await fetch('/api/subgraph', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });
  
    if (!response.ok) {
      throw new Error('Failed to fetch data');
    }
  
    const { data, errors } = await response.json();
    if (errors) {
      throw new Error(errors[0].message);
    }
  
    return data;
  }
  