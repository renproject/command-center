import  { queryBlockStateResponse } from './fees.bs.mock';

type Numeric = number | string;

type FeeEpoch = {
  amount: Numeric,
  epoch: Numeric,
  numNodes: Numeric
}

type FeeData = {
  nodes: Array<any>
  epochs: Array<FeeEpoch>
  unassigned: Numeric
}

export const getFeesForAsset = (symbol: string, response = queryBlockStateResponse) => {
  return response.result.state.v[symbol].fees as FeeData;
}

