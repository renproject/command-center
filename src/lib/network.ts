import { NetworkData } from "renex-sdk-ts";

export const networkData: NetworkData = window.NETWORK;

export const INFURA_URL = `${networkData.infura}/${window.INFURA_KEY}`;
