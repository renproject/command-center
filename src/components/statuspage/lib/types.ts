export interface DarknodeData {
    network: string;
    multiAddress: string;
    ethereumAddress: string;
    darknodeRegistryAddress: string;
    rewardVaultAddress: string;
    publicKey: string;
    peers: number;
    infura: string;
    ethereumNetwork: string;
    tokens: {
        DGX: string;
        TUSD: string;
        REN: string;
        OMG: string;
        ZRX: string;
    };
}
