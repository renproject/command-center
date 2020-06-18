import { gql } from "apollo-boost";

export interface PeriodData {
  id: string; // "HOUR441028";
  type: string; // "HOUR";
  date: number; // 1587700800;

  // total

  totalTxCountBTC: string;
  totalLockedBTC: string;
  totalVolumeBTC: string;

  totalTxCountZEC: string;
  totalLockedZEC: string;
  totalVolumeZEC: string;

  totalTxCountBCH: string;
  totalLockedBCH: string;
  totalVolumeBCH: string;

  // period

  periodTxCountBTC: string;
  periodLockedBTC: string;
  periodVolumeBTC: string;

  periodTxCountZEC: string;
  periodLockedZEC: string;
  periodVolumeZEC: string;

  periodTxCountBCH: string;
  periodLockedBCH: string;
  periodVolumeBCH: string;

  __typename: string; // "PeriodData";
}

export interface Integrator {
  "__typename": "Integrator";
  id: string; // "0x3973b2acdfac17171315e49ef19a0758b8b6f104";
  date: number; // 0;
  contractAddress: string; // "0x3973b2acdfac17171315e49ef19a0758b8b6f104";
  txCountBTC: string; // "12";
  lockedBTC: string; // "49469981";
  volumeBTC: string; // "49469981";
  txCountZEC: string; // "0";
  lockedZEC: string; // "0";
  volumeZEC: string; // "0";
  txCountBCH: string; // "0";
  lockedBCH: string; // "0";
  volumeBCH: string; // "0";
  integrator24H: Integrator;
}

export const QUERY_INTEGRATORS = gql`
query getIntegrators($offset: Int, $count: Int) {
    integrators(orderBy: volumeBTC, orderDirection: desc, first: $count, skip: $offset, where: { date: 0 }) {
    id
    date
    contractAddress
    txCountBTC
    lockedBTC
    volumeBTC
    txCountZEC
    lockedZEC
    volumeZEC
    txCountBCH
    lockedBCH
    volumeBCH
    integrator24H {
      id
      date
      contractAddress
      txCountBTC
      lockedBTC
      volumeBTC
      txCountZEC
      lockedZEC
      volumeZEC
      txCountBCH
      lockedBCH
      volumeBCH
    }
  }
}
`;
