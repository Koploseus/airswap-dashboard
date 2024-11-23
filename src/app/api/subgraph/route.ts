import { NextRequest, NextResponse } from 'next/server';

const API_KEY = process.env.NEXT_PUBLIC_GRAPH_API_KEY;
const SUBGRAPH_URL = `https://gateway.thegraph.com/api/${API_KEY}/subgraphs/id/7ruo9nxQ3LUqnKkbLgmETDQ27j6A2DFx5L5eV6MS2TAz`;

export async function POST(req: NextRequest) {
  try {
    const { query, variables } = await req.json();

    const response = await fetch(SUBGRAPH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Subgraph query error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}