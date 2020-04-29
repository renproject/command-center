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

export const PERIOD_HISTORY = gql`

# enum PeriodType {
#     HOUR
#     DAY
#     WEEK
#     MONTH
#     YEAR
# }

query GetPeriodData($type: PeriodType!) {
    periodDatas(where: {type: $type }, orderBy: date, orderDirection: desc, first: 31) {
        id
        type
        date

        #Total

        totalTxCountBTC
        totalLockedBTC
        totalVolumeBTC

        totalTxCountZEC
        totalLockedZEC
        totalVolumeZEC

        totalTxCountBCH
        totalLockedBCH
        totalVolumeBCH

        # Period

        periodTxCountBTC
        periodLockedBTC
        periodVolumeBTC

        periodTxCountZEC
        periodLockedZEC
        periodVolumeZEC

        periodTxCountBCH
        periodLockedBCH
        periodVolumeBCH
  }
}
`;
