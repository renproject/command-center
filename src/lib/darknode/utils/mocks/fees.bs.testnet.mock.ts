export const queryBlockStateResponse = {
    jsonrpc: "2.0",
    id: 1,
    result: {
        state: {
            t: {
                struct: [
                    {
                        BTC: {
                            struct: [
                                {
                                    latestHeight: "u256",
                                },
                                {
                                    gasCap: "u256",
                                },
                                {
                                    gasLimit: "u256",
                                },
                                {
                                    gasPrice: "u256",
                                },
                                {
                                    minimumAmount: "u256",
                                },
                                {
                                    dustAmount: "u256",
                                },
                                {
                                    mintFee: "u64",
                                },
                                {
                                    burnFee: "u64",
                                },
                                {
                                    shards: {
                                        list: {
                                            struct: [
                                                {
                                                    shard: "bytes32",
                                                },
                                                {
                                                    pubKey: "bytes",
                                                },
                                                {
                                                    queue: {
                                                        list: {
                                                            struct: [
                                                                {
                                                                    hash: "bytes32",
                                                                },
                                                            ],
                                                        },
                                                    },
                                                },
                                                {
                                                    state: {
                                                        struct: [
                                                            {
                                                                outpoint: {
                                                                    struct: [
                                                                        {
                                                                            hash: "bytes",
                                                                        },
                                                                        {
                                                                            index: "u32",
                                                                        },
                                                                    ],
                                                                },
                                                            },
                                                            {
                                                                value: "u256",
                                                            },
                                                            {
                                                                pubKeyScript:
                                                                    "bytes",
                                                            },
                                                        ],
                                                    },
                                                },
                                            ],
                                        },
                                    },
                                },
                                {
                                    minted: {
                                        list: {
                                            struct: [
                                                {
                                                    chain: "string",
                                                },
                                                {
                                                    amount: "u256",
                                                },
                                            ],
                                        },
                                    },
                                },
                                {
                                    fees: {
                                        struct: [
                                            {
                                                unassigned: "u256",
                                            },
                                            {
                                                epochs: {
                                                    list: {
                                                        struct: [
                                                            {
                                                                epoch: "u64",
                                                            },
                                                            {
                                                                amount: "u256",
                                                            },
                                                            {
                                                                numNodes: "u64",
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                            {
                                                nodes: {
                                                    list: {
                                                        struct: [
                                                            {
                                                                node: "bytes32",
                                                            },
                                                            {
                                                                lastEpochClaimed:
                                                                    "u64",
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        LUNA: {
                            struct: [
                                {
                                    latestHeight: "u256",
                                },
                                {
                                    gasCap: "u256",
                                },
                                {
                                    gasLimit: "u256",
                                },
                                {
                                    gasPrice: "u256",
                                },
                                {
                                    minimumAmount: "u256",
                                },
                                {
                                    dustAmount: "u256",
                                },
                                {
                                    mintFee: "u64",
                                },
                                {
                                    burnFee: "u64",
                                },
                                {
                                    shards: {
                                        list: {
                                            struct: [
                                                {
                                                    shard: "bytes32",
                                                },
                                                {
                                                    pubKey: "bytes",
                                                },
                                                {
                                                    queue: {
                                                        list: {
                                                            struct: [
                                                                {
                                                                    hash: "bytes32",
                                                                },
                                                            ],
                                                        },
                                                    },
                                                },
                                                {
                                                    state: {
                                                        struct: [
                                                            {
                                                                nonce: "u256",
                                                            },
                                                            {
                                                                gnonces: {
                                                                    list: {
                                                                        struct: [
                                                                            {
                                                                                address:
                                                                                    "string",
                                                                            },
                                                                            {
                                                                                nonce: "u256",
                                                                            },
                                                                        ],
                                                                    },
                                                                },
                                                            },
                                                        ],
                                                    },
                                                },
                                            ],
                                        },
                                    },
                                },
                                {
                                    minted: {
                                        list: {
                                            struct: [
                                                {
                                                    chain: "string",
                                                },
                                                {
                                                    amount: "u256",
                                                },
                                            ],
                                        },
                                    },
                                },
                                {
                                    fees: {
                                        struct: [
                                            {
                                                unassigned: "u256",
                                            },
                                            {
                                                epochs: {
                                                    list: {
                                                        struct: [
                                                            {
                                                                epoch: "u64",
                                                            },
                                                            {
                                                                amount: "u256",
                                                            },
                                                            {
                                                                numNodes: "u64",
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                            {
                                                nodes: {
                                                    list: {
                                                        struct: [
                                                            {
                                                                node: "bytes32",
                                                            },
                                                            {
                                                                lastEpochClaimed:
                                                                    "u64",
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        System: {
                            struct: [
                                {
                                    epoch: {
                                        struct: [
                                            {
                                                hash: "bytes32",
                                            },
                                            {
                                                number: "u64",
                                            },
                                            {
                                                numNodes: "u64",
                                            },
                                            {
                                                timestamp: "u64",
                                            },
                                        ],
                                    },
                                },
                                {
                                    nodes: {
                                        list: {
                                            struct: [
                                                {
                                                    id: "bytes32",
                                                },
                                                {
                                                    enteredAt: "u64",
                                                },
                                            ],
                                        },
                                    },
                                },
                                {
                                    shards: {
                                        struct: [
                                            {
                                                primary: {
                                                    list: {
                                                        struct: [
                                                            {
                                                                shard: "bytes32",
                                                            },
                                                            {
                                                                pubKey: "bytes",
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                            {
                                                secondary: {
                                                    list: {
                                                        struct: [
                                                            {
                                                                shard: "bytes32",
                                                            },
                                                            {
                                                                pubKey: "bytes",
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                            {
                                                tertiary: {
                                                    list: {
                                                        struct: [
                                                            {
                                                                shard: "bytes32",
                                                            },
                                                            {
                                                                pubKey: "bytes",
                                                            },
                                                        ],
                                                    },
                                                },
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
            v: {
                BTC: {
                    burnFee: "10",
                    dustAmount: "546",
                    fees: {
                        epochs: [
                            {
                                amount: "0",
                                epoch: "0",
                                numNodes: "0",
                            },
                            {
                                amount: "0",
                                epoch: "1",
                                numNodes: "0",
                            },
                            {
                                amount: "299920",
                                epoch: "2",
                                numNodes: "3",
                            },
                            {
                                amount: "0",
                                epoch: "3",
                                numNodes: "3",
                            },
                            {
                                amount: "0",
                                epoch: "4",
                                numNodes: "3",
                            },
                            {
                                amount: "0",
                                epoch: "5",
                                numNodes: "3",
                            },
                            {
                                amount: "0",
                                epoch: "6",
                                numNodes: "3",
                            },
                            {
                                amount: "0",
                                epoch: "7",
                                numNodes: "3",
                            },
                            {
                                amount: "1049912",
                                epoch: "8",
                                numNodes: "3",
                            },
                            {
                                amount: "0",
                                epoch: "9",
                                numNodes: "3",
                            },
                            {
                                amount: "296425",
                                epoch: "10",
                                numNodes: "3",
                            },
                            {
                                amount: "0",
                                epoch: "11",
                                numNodes: "3",
                            },
                            {
                                amount: "976711",
                                epoch: "12",
                                numNodes: "3",
                            },
                            {
                                amount: "0",
                                epoch: "13",
                                numNodes: "3",
                            },
                            {
                                amount: "727564",
                                epoch: "14",
                                numNodes: "3",
                            },
                            {
                                amount: "0",
                                epoch: "15",
                                numNodes: "3",
                            },
                            {
                                amount: "69997",
                                epoch: "16",
                                numNodes: "3",
                            },
                            {
                                amount: "0",
                                epoch: "17",
                                numNodes: "3",
                            },
                            {
                                amount: "679814",
                                epoch: "18",
                                numNodes: "3",
                            },
                            {
                                amount: "0",
                                epoch: "19",
                                numNodes: "3",
                            },
                            {
                                amount: "1275797",
                                epoch: "20",
                                numNodes: "3",
                            },
                            {
                                amount: "0",
                                epoch: "21",
                                numNodes: "3",
                            },
                            {
                                amount: "669357",
                                epoch: "22",
                                numNodes: "3",
                            },
                            {
                                amount: "0",
                                epoch: "23",
                                numNodes: "3",
                            },
                            {
                                amount: "296578",
                                epoch: "24",
                                numNodes: "3",
                            },
                        ],
                        nodes: [
                            {
                                lastEpochClaimed: "22",
                                node: "Ml3PgCFOELN4ZKCdRtEY8CqDpVgAAAAAAAAAAAAAAAA",
                            },
                            {
                                lastEpochClaimed: "8",
                                node: "YUjCTsksFBaaziqBmocgoLevTwgAAAAAAAAAAAAAAAA",
                            },
                            {
                                lastEpochClaimed: "12",
                                node: "aztjLkFZ_qJnV48hJ3a173SzKmwAAAAAAAAAAAAAAAA",
                            },
                            {
                                lastEpochClaimed: "20",
                                node: "hJmgVk-aoXJWw2RLmhVDGh_S9EwAAAAAAAAAAAAAAAA",
                            },
                            {
                                lastEpochClaimed: "2",
                                node: "ohVL2c9adJP1XPQPkc-R70YI02wAAAAAAAAAAAAAAAA",
                            },
                            {
                                lastEpochClaimed: "24",
                                node: "rJHHb_LFj86wBBZvNygblF1tzQEAAAAAAAAAAAAAAAA",
                            },
                        ],
                        unassigned: "857413",
                    },
                    gasCap: "40",
                    gasLimit: "400",
                    gasPrice: "40",
                    latestHeight: "543",
                    minimumAmount: "547",
                    mintFee: "20",
                    minted: [
                        {
                            amount: "3592544512",
                            chain: "Ethereum",
                        },
                    ],
                    shards: [
                        {
                            pubKey: "AtMXBmb2Y_jBYWHhgzHxftW4CsonjMcZaIe3aPkDRh39",
                            queue: [],
                            shard: "p5h2cQJ3dTScyYTnzHbdJx08SI9Hyw9OwgJs1MSN53k",
                            state: {
                                outpoint: {
                                    hash: "SASMRzyaaF5m9XJxEENhgJblW7rHd0J0U2Bd-Vpoc24",
                                    index: "1",
                                },
                                pubKeyScript:
                                    "dqkUagRXy9CVJOLlnD1iNT0PTpJRpaCIrA",
                                value: "3598224526",
                            },
                        },
                    ],
                },
                LUNA: {
                    burnFee: "10",
                    dustAmount: "0",
                    fees: {
                        epochs: [
                            {
                                amount: "0",
                                epoch: "0",
                                numNodes: "0",
                            },
                            {
                                amount: "0",
                                epoch: "1",
                                numNodes: "0",
                            },
                            {
                                amount: "0",
                                epoch: "2",
                                numNodes: "3",
                            },
                            {
                                amount: "0",
                                epoch: "3",
                                numNodes: "3",
                            },
                            {
                                amount: "0",
                                epoch: "4",
                                numNodes: "3",
                            },
                            {
                                amount: "0",
                                epoch: "5",
                                numNodes: "3",
                            },
                            {
                                amount: "0",
                                epoch: "6",
                                numNodes: "3",
                            },
                            {
                                amount: "0",
                                epoch: "7",
                                numNodes: "3",
                            },
                            {
                                amount: "0",
                                epoch: "8",
                                numNodes: "3",
                            },
                            {
                                amount: "0",
                                epoch: "9",
                                numNodes: "3",
                            },
                            {
                                amount: "0",
                                epoch: "10",
                                numNodes: "3",
                            },
                            {
                                amount: "0",
                                epoch: "11",
                                numNodes: "3",
                            },
                            {
                                amount: "0",
                                epoch: "12",
                                numNodes: "3",
                            },
                            {
                                amount: "0",
                                epoch: "13",
                                numNodes: "3",
                            },
                            {
                                amount: "0",
                                epoch: "14",
                                numNodes: "3",
                            },
                            {
                                amount: "0",
                                epoch: "15",
                                numNodes: "3",
                            },
                            {
                                amount: "0",
                                epoch: "16",
                                numNodes: "3",
                            },
                            {
                                amount: "0",
                                epoch: "17",
                                numNodes: "3",
                            },
                            {
                                amount: "0",
                                epoch: "18",
                                numNodes: "3",
                            },
                            {
                                amount: "0",
                                epoch: "19",
                                numNodes: "3",
                            },
                            {
                                amount: "0",
                                epoch: "20",
                                numNodes: "3",
                            },
                            {
                                amount: "0",
                                epoch: "21",
                                numNodes: "3",
                            },
                            {
                                amount: "0",
                                epoch: "22",
                                numNodes: "3",
                            },
                            {
                                amount: "0",
                                epoch: "23",
                                numNodes: "3",
                            },
                            {
                                amount: "0",
                                epoch: "24",
                                numNodes: "3",
                            },
                        ],
                        nodes: [],
                        unassigned: "0",
                    },
                    gasCap: "2",
                    gasLimit: "150000",
                    gasPrice: "2",
                    latestHeight: "3",
                    minimumAmount: "1",
                    mintFee: "20",
                    minted: [],
                    shards: [
                        {
                            pubKey: "AtMXBmb2Y_jBYWHhgzHxftW4CsonjMcZaIe3aPkDRh39",
                            queue: [],
                            shard: "p5h2cQJ3dTScyYTnzHbdJx08SI9Hyw9OwgJs1MSN53k",
                            state: {
                                gnonces: [],
                                nonce: "0",
                            },
                        },
                    ],
                },
                System: {
                    epoch: {
                        hash: "tDbRlguHgp6pwIoLjO3hTasG6XAOhr_XNLS0QdastRM",
                        numNodes: "3",
                        number: "25",
                        timestamp: "1641867852",
                    },
                    nodes: [
                        {
                            enteredAt: "24",
                            id: "rJHHb_LFj86wBBZvNygblF1tzQEAAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "24",
                            id: "vTJ8vospOdjQ-Qk9a9G7-FfupLAAAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "24",
                            id: "xgstfuXyQAud518wuGwYTZOQAiUAAAAAAAAAAAAAAAA",
                        },
                    ],
                    shards: {
                        primary: [
                            {
                                pubKey: "AtMXBmb2Y_jBYWHhgzHxftW4CsonjMcZaIe3aPkDRh39",
                                shard: "p5h2cQJ3dTScyYTnzHbdJx08SI9Hyw9OwgJs1MSN53k",
                            },
                        ],
                        secondary: [],
                        tertiary: [],
                    },
                },
            },
        },
    },
};
