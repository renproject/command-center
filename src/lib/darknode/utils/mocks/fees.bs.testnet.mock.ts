export const queryBlockStateResponse = {
    jsonrpc: "2.0",
    id: 300,
    result: {
        state: {
            t: {
                struct: [
                    {
                        BCH: {
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
                                                                    hash:
                                                                        "bytes32",
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
                                                                            hash:
                                                                                "bytes",
                                                                        },
                                                                        {
                                                                            index:
                                                                                "u32",
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
                                            {
                                                chains: {
                                                    list: {
                                                        struct: [
                                                            {
                                                                chain: "string",
                                                            },
                                                            {
                                                                mintFee: "u64",
                                                            },
                                                            {
                                                                burnFee: "u64",
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
                                                                    hash:
                                                                        "bytes32",
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
                                                                            hash:
                                                                                "bytes",
                                                                        },
                                                                        {
                                                                            index:
                                                                                "u32",
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
                                            {
                                                chains: {
                                                    list: {
                                                        struct: [
                                                            {
                                                                chain: "string",
                                                            },
                                                            {
                                                                mintFee: "u64",
                                                            },
                                                            {
                                                                burnFee: "u64",
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
                        DGB: {
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
                                                                    hash:
                                                                        "bytes32",
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
                                                                            hash:
                                                                                "bytes",
                                                                        },
                                                                        {
                                                                            index:
                                                                                "u32",
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
                                            {
                                                chains: {
                                                    list: {
                                                        struct: [
                                                            {
                                                                chain: "string",
                                                            },
                                                            {
                                                                mintFee: "u64",
                                                            },
                                                            {
                                                                burnFee: "u64",
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
                        DOGE: {
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
                                                                    hash:
                                                                        "bytes32",
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
                                                                            hash:
                                                                                "bytes",
                                                                        },
                                                                        {
                                                                            index:
                                                                                "u32",
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
                                            {
                                                chains: {
                                                    list: {
                                                        struct: [
                                                            {
                                                                chain: "string",
                                                            },
                                                            {
                                                                mintFee: "u64",
                                                            },
                                                            {
                                                                burnFee: "u64",
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
                        FIL: {
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
                                                                    hash:
                                                                        "bytes32",
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
                                                                                nonce:
                                                                                    "u256",
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
                                            {
                                                chains: {
                                                    list: {
                                                        struct: [
                                                            {
                                                                chain: "string",
                                                            },
                                                            {
                                                                mintFee: "u64",
                                                            },
                                                            {
                                                                burnFee: "u64",
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
                                                                    hash:
                                                                        "bytes32",
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
                                                                                nonce:
                                                                                    "u256",
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
                                            {
                                                chains: {
                                                    list: {
                                                        struct: [
                                                            {
                                                                chain: "string",
                                                            },
                                                            {
                                                                mintFee: "u64",
                                                            },
                                                            {
                                                                burnFee: "u64",
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
                                                                shard:
                                                                    "bytes32",
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
                                                                shard:
                                                                    "bytes32",
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
                                                                shard:
                                                                    "bytes32",
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
                    {
                        ZEC: {
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
                                                                    hash:
                                                                        "bytes32",
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
                                                                            hash:
                                                                                "bytes",
                                                                        },
                                                                        {
                                                                            index:
                                                                                "u32",
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
                                            {
                                                chains: {
                                                    list: {
                                                        struct: [
                                                            {
                                                                chain: "string",
                                                            },
                                                            {
                                                                mintFee: "u64",
                                                            },
                                                            {
                                                                burnFee: "u64",
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
                BCH: {
                    dustAmount: "546",
                    fees: {
                        chains: [
                            {
                                burnFee: "15",
                                chain: "Avalanche",
                                mintFee: "15",
                            },
                            {
                                burnFee: "15",
                                chain: "BinanceSmartChain",
                                mintFee: "15",
                            },
                            {
                                burnFee: "15",
                                chain: "Ethereum",
                                mintFee: "25",
                            },
                            {
                                burnFee: "15",
                                chain: "Fantom",
                                mintFee: "15",
                            },
                            {
                                burnFee: "15",
                                chain: "Polygon",
                                mintFee: "15",
                            },
                            {
                                burnFee: "15",
                                chain: "Solana",
                                mintFee: "15",
                            },
                        ],
                        epochs: [
                            {
                                amount: "0",
                                epoch: "0",
                                numNodes: "0",
                            },
                            {
                                amount: "0",
                                epoch: "1",
                                numNodes: "28",
                            },
                            {
                                amount: "0",
                                epoch: "2",
                                numNodes: "28",
                            },
                            {
                                amount: "0",
                                epoch: "3",
                                numNodes: "29",
                            },
                            {
                                amount: "0",
                                epoch: "4",
                                numNodes: "29",
                            },
                        ],
                        nodes: [],
                        unassigned: "0",
                    },
                    gasCap: "2",
                    gasLimit: "400",
                    gasPrice: "2",
                    latestHeight: "1448279",
                    minimumAmount: "547",
                    minted: [
                        {
                            amount: "18583125",
                            chain: "BinanceSmartChain",
                        },
                        {
                            amount: "6035842",
                            chain: "Ethereum",
                        },
                        {
                            amount: "9636",
                            chain: "Fantom",
                        },
                        {
                            amount: "8990",
                            chain: "Polygon",
                        },
                    ],
                    shards: [
                        {
                            pubKey:
                                "Aw3WX32ykguyKZEuP0IT3RUOX5csm3PpvnFNhEVhrDVc",
                            queue: [],
                            shard:
                                "KGEl4KLm3CIPKerUiPtcZ73PGfvM1x9QJlekbBmW4KI",
                            state: {
                                outpoint: {
                                    hash:
                                        "sGhOJlZEAJwPsXsuFU6_9nEyz0hRNP8T8qeQQ-Qv04I",
                                    index: "0",
                                },
                                pubKeyScript:
                                    "dqkUyZiyqIrJZnbhTwdzkANBl5mmgjqIrA",
                                value: "76919592",
                            },
                        },
                    ],
                },
                BTC: {
                    dustAmount: "546",
                    fees: {
                        chains: [
                            {
                                burnFee: "15",
                                chain: "Avalanche",
                                mintFee: "15",
                            },
                            {
                                burnFee: "15",
                                chain: "BinanceSmartChain",
                                mintFee: "15",
                            },
                            {
                                burnFee: "15",
                                chain: "Ethereum",
                                mintFee: "25",
                            },
                            {
                                burnFee: "15",
                                chain: "Fantom",
                                mintFee: "15",
                            },
                            {
                                burnFee: "15",
                                chain: "Polygon",
                                mintFee: "15",
                            },
                            {
                                burnFee: "15",
                                chain: "Solana",
                                mintFee: "15",
                            },
                        ],
                        epochs: [
                            {
                                amount: "0",
                                epoch: "0",
                                numNodes: "0",
                            },
                            {
                                amount: "0",
                                epoch: "1",
                                numNodes: "28",
                            },
                            {
                                amount: "1460",
                                epoch: "2",
                                numNodes: "28",
                            },
                            {
                                amount: "0",
                                epoch: "3",
                                numNodes: "29",
                            },
                            {
                                amount: "0",
                                epoch: "4",
                                numNodes: "29",
                            },
                        ],
                        nodes: [],
                        unassigned: "19504",
                    },
                    gasCap: "2",
                    gasLimit: "400",
                    gasPrice: "2",
                    latestHeight: "2006036",
                    minimumAmount: "547",
                    minted: [
                        {
                            amount: "146",
                            chain: "Avalanche",
                        },
                        {
                            amount: "7270284",
                            chain: "BinanceSmartChain",
                        },
                        {
                            amount: "526004481",
                            chain: "Ethereum",
                        },
                        {
                            amount: "28301",
                            chain: "Fantom",
                        },
                        {
                            amount: "915736",
                            chain: "Polygon",
                        },
                        {
                            amount: "4663249",
                            chain: "Solana",
                        },
                    ],
                    shards: [
                        {
                            pubKey:
                                "Aw3WX32ykguyKZEuP0IT3RUOX5csm3PpvnFNhEVhrDVc",
                            queue: [],
                            shard:
                                "KGEl4KLm3CIPKerUiPtcZ73PGfvM1x9QJlekbBmW4KI",
                            state: {
                                outpoint: {
                                    hash:
                                        "2XuAmzldaxJuCCadKsb2re2UBC5TVRGSuJzYaWo-nfg",
                                    index: "0",
                                },
                                pubKeyScript:
                                    "dqkUyZiyqIrJZnbhTwdzkANBl5mmgjqIrA",
                                value: "839480025",
                            },
                        },
                    ],
                },
                DGB: {
                    dustAmount: "546",
                    fees: {
                        chains: [
                            {
                                burnFee: "15",
                                chain: "Avalanche",
                                mintFee: "15",
                            },
                            {
                                burnFee: "15",
                                chain: "BinanceSmartChain",
                                mintFee: "15",
                            },
                            {
                                burnFee: "15",
                                chain: "Ethereum",
                                mintFee: "25",
                            },
                            {
                                burnFee: "15",
                                chain: "Fantom",
                                mintFee: "15",
                            },
                            {
                                burnFee: "15",
                                chain: "Polygon",
                                mintFee: "15",
                            },
                            {
                                burnFee: "15",
                                chain: "Solana",
                                mintFee: "15",
                            },
                        ],
                        epochs: [
                            {
                                amount: "0",
                                epoch: "0",
                                numNodes: "0",
                            },
                            {
                                amount: "0",
                                epoch: "1",
                                numNodes: "28",
                            },
                            {
                                amount: "0",
                                epoch: "2",
                                numNodes: "28",
                            },
                            {
                                amount: "0",
                                epoch: "3",
                                numNodes: "29",
                            },
                            {
                                amount: "0",
                                epoch: "4",
                                numNodes: "29",
                            },
                        ],
                        nodes: [],
                        unassigned: "0",
                    },
                    gasCap: "200",
                    gasLimit: "400",
                    gasPrice: "200",
                    latestHeight: "0",
                    minimumAmount: "547",
                    minted: [
                        {
                            amount: "100006187",
                            chain: "BinanceSmartChain",
                        },
                    ],
                    shards: [
                        {
                            pubKey:
                                "Aw3WX32ykguyKZEuP0IT3RUOX5csm3PpvnFNhEVhrDVc",
                            queue: [],
                            shard:
                                "KGEl4KLm3CIPKerUiPtcZ73PGfvM1x9QJlekbBmW4KI",
                            state: {
                                outpoint: {
                                    hash:
                                        "CAMXN7OBkSnafGgHxBBe5mm-dcqjz1fwduqiexG_9Zo",
                                    index: "0",
                                },
                                pubKeyScript:
                                    "dqkUyZiyqIrJZnbhTwdzkANBl5mmgjqIrA",
                                value: "203114980",
                            },
                        },
                    ],
                },
                DOGE: {
                    dustAmount: "100000000",
                    fees: {
                        chains: [
                            {
                                burnFee: "15",
                                chain: "Avalanche",
                                mintFee: "15",
                            },
                            {
                                burnFee: "15",
                                chain: "BinanceSmartChain",
                                mintFee: "15",
                            },
                            {
                                burnFee: "15",
                                chain: "Ethereum",
                                mintFee: "25",
                            },
                            {
                                burnFee: "15",
                                chain: "Fantom",
                                mintFee: "15",
                            },
                            {
                                burnFee: "15",
                                chain: "Polygon",
                                mintFee: "15",
                            },
                            {
                                burnFee: "15",
                                chain: "Solana",
                                mintFee: "15",
                            },
                        ],
                        epochs: [
                            {
                                amount: "0",
                                epoch: "0",
                                numNodes: "0",
                            },
                            {
                                amount: "0",
                                epoch: "1",
                                numNodes: "28",
                            },
                            {
                                amount: "0",
                                epoch: "2",
                                numNodes: "28",
                            },
                            {
                                amount: "0",
                                epoch: "3",
                                numNodes: "29",
                            },
                            {
                                amount: "0",
                                epoch: "4",
                                numNodes: "29",
                            },
                        ],
                        nodes: [],
                        unassigned: "0",
                    },
                    gasCap: "800000",
                    gasLimit: "400",
                    gasPrice: "800000",
                    latestHeight: "3209741",
                    minimumAmount: "100000001",
                    minted: [
                        {
                            amount: "12422822660",
                            chain: "BinanceSmartChain",
                        },
                        {
                            amount: "17531473300",
                            chain: "Ethereum",
                        },
                        {
                            amount: "29018220",
                            chain: "Fantom",
                        },
                        {
                            amount: "9680000000",
                            chain: "Polygon",
                        },
                    ],
                    shards: [
                        {
                            pubKey:
                                "Aw3WX32ykguyKZEuP0IT3RUOX5csm3PpvnFNhEVhrDVc",
                            queue: [],
                            shard:
                                "KGEl4KLm3CIPKerUiPtcZ73PGfvM1x9QJlekbBmW4KI",
                            state: {
                                outpoint: {
                                    hash:
                                        "AWqKEu9bCzqrA67DOcm1Y5EvZqPnHb_oTMlBl0DOzUw",
                                    index: "0",
                                },
                                pubKeyScript:
                                    "dqkUyZiyqIrJZnbhTwdzkANBl5mmgjqIrA",
                                value: "93265681476",
                            },
                        },
                    ],
                },
                FIL: {
                    dustAmount: "0",
                    fees: {
                        chains: [
                            {
                                burnFee: "15",
                                chain: "Avalanche",
                                mintFee: "15",
                            },
                            {
                                burnFee: "15",
                                chain: "BinanceSmartChain",
                                mintFee: "15",
                            },
                            {
                                burnFee: "15",
                                chain: "Ethereum",
                                mintFee: "25",
                            },
                            {
                                burnFee: "15",
                                chain: "Fantom",
                                mintFee: "15",
                            },
                            {
                                burnFee: "15",
                                chain: "Polygon",
                                mintFee: "15",
                            },
                            {
                                burnFee: "15",
                                chain: "Solana",
                                mintFee: "15",
                            },
                        ],
                        epochs: [
                            {
                                amount: "0",
                                epoch: "0",
                                numNodes: "0",
                            },
                            {
                                amount: "0",
                                epoch: "1",
                                numNodes: "28",
                            },
                            {
                                amount: "0",
                                epoch: "2",
                                numNodes: "28",
                            },
                            {
                                amount: "0",
                                epoch: "3",
                                numNodes: "29",
                            },
                            {
                                amount: "0",
                                epoch: "4",
                                numNodes: "29",
                            },
                        ],
                        nodes: [],
                        unassigned: "0",
                    },
                    gasCap: "202634",
                    gasLimit: "2200000",
                    gasPrice: "200526",
                    latestHeight: "340824",
                    minimumAmount: "1",
                    minted: [
                        {
                            amount: "7867945885198697817",
                            chain: "BinanceSmartChain",
                        },
                        {
                            amount: "11323229098070889115805",
                            chain: "Ethereum",
                        },
                        {
                            amount: "17487599458354400000",
                            chain: "Fantom",
                        },
                    ],
                    shards: [
                        {
                            pubKey:
                                "Aw3WX32ykguyKZEuP0IT3RUOX5csm3PpvnFNhEVhrDVc",
                            queue: [],
                            shard:
                                "KGEl4KLm3CIPKerUiPtcZ73PGfvM1x9QJlekbBmW4KI",
                            state: {
                                gnonces: [
                                    {
                                        address:
                                            "f1g64yuzsb7eierhk7ib5hzvgxbxwkk36a6aoncji",
                                        nonce: "9",
                                    },
                                    {
                                        address:
                                            "f1ogvbcz37aa5lz6abfowbp7frkadrgkzuqyn6gya",
                                        nonce: "3",
                                    },
                                    {
                                        address:
                                            "f1riebr67zmyt3rmxl6yluicuqlxyq6fs2copuomq",
                                        nonce: "3",
                                    },
                                    {
                                        address:
                                            "f1st4ba52xdut5mnsdgrorbts4wamv3gpr3tlhuya",
                                        nonce: "1",
                                    },
                                    {
                                        address:
                                            "f1uduxnovxtvl7y3qs4wnihzrs6r7vedebly5smna",
                                        nonce: "1",
                                    },
                                    {
                                        address:
                                            "f1wmlwefy6zrhqwws2m2nja5ynesv5lrrh7g5gnci",
                                        nonce: "5",
                                    },
                                ],
                                nonce: "29",
                            },
                        },
                    ],
                },
                LUNA: {
                    dustAmount: "0",
                    fees: {
                        chains: [
                            {
                                burnFee: "15",
                                chain: "Avalanche",
                                mintFee: "15",
                            },
                            {
                                burnFee: "15",
                                chain: "BinanceSmartChain",
                                mintFee: "15",
                            },
                            {
                                burnFee: "15",
                                chain: "Ethereum",
                                mintFee: "25",
                            },
                            {
                                burnFee: "15",
                                chain: "Fantom",
                                mintFee: "15",
                            },
                            {
                                burnFee: "15",
                                chain: "Polygon",
                                mintFee: "15",
                            },
                            {
                                burnFee: "15",
                                chain: "Solana",
                                mintFee: "15",
                            },
                        ],
                        epochs: [
                            {
                                amount: "0",
                                epoch: "0",
                                numNodes: "0",
                            },
                            {
                                amount: "2098",
                                epoch: "1",
                                numNodes: "28",
                            },
                            {
                                amount: "1874",
                                epoch: "2",
                                numNodes: "28",
                            },
                            {
                                amount: "0",
                                epoch: "3",
                                numNodes: "29",
                            },
                            {
                                amount: "0",
                                epoch: "4",
                                numNodes: "29",
                            },
                        ],
                        nodes: [],
                        unassigned: "1198702",
                    },
                    gasCap: "2",
                    gasLimit: "150000",
                    gasPrice: "2",
                    latestHeight: "4556936",
                    minimumAmount: "1",
                    minted: [
                        {
                            amount: "1200000",
                            chain: "Avalanche",
                        },
                        {
                            amount: "6313290",
                            chain: "BinanceSmartChain",
                        },
                        {
                            amount: "2980209",
                            chain: "Ethereum",
                        },
                        {
                            amount: "1005098998",
                            chain: "Fantom",
                        },
                        {
                            amount: "2602498",
                            chain: "Polygon",
                        },
                        {
                            amount: "700000",
                            chain: "Solana",
                        },
                    ],
                    shards: [
                        {
                            pubKey:
                                "Aw3WX32ykguyKZEuP0IT3RUOX5csm3PpvnFNhEVhrDVc",
                            queue: [],
                            shard:
                                "KGEl4KLm3CIPKerUiPtcZ73PGfvM1x9QJlekbBmW4KI",
                            state: {
                                gnonces: [
                                    {
                                        address:
                                            "terra10fadhfnnd49y9wf45wxu90duwk5uztdvxsywv3",
                                        nonce: "4",
                                    },
                                    {
                                        address:
                                            "terra1jnhkudqg0svvvf6srh22nlph8pp0l7z8rccknh",
                                        nonce: "1",
                                    },
                                    {
                                        address:
                                            "terra1nhs982e90tuakg9wmr68h9uvtyfzdx54wj3t5s",
                                        nonce: "2",
                                    },
                                    {
                                        address:
                                            "terra1pdq3yllq65dz6hgdkrepjrd467lgx3gdz60vh4",
                                        nonce: "1",
                                    },
                                    {
                                        address:
                                            "terra1zm4synl405a0vnx6ey49h8v7l6z87kvkhdu35p",
                                        nonce: "1",
                                    },
                                ],
                                nonce: "4",
                            },
                        },
                    ],
                },
                System: {
                    epoch: {
                        hash: "eu1yzSLPhcaezkZ2QM9YGTypJKxuHAdJffSUyNhCA-U",
                        numNodes: "29",
                        number: "5",
                        timestamp: "1624405260",
                    },
                    nodes: [
                        {
                            enteredAt: "1",
                            id: "A4Ae-w7-KiXt5d06ADrogMApLk0AAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "E6_GXd6GMt7CfB_y18ANrdv4VnEAAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "FjJaemzR0yM0qeSPQuB0rlwtULsAAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "F5v8ySp_LD4Nxc0NhsQy130amNQAAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "GDyNbhISjFNHlkSZrrZJDtibKZ0AAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "IW3Zme8eDrVUOgty4Jqlc5hXt58AAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "IW3Zme8eDrVUOgty4Jqlc5hXt6kAAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "IW3Zme8eDrVUOgty4Jqlc5hXt6wAAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "IW3Zme8eDrVUOgty4Jqlc5hXt60AAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "IW3Zme8eDrVUOgty4Jqlc5hXt7EAAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "IW3Zme8eDrVUOgty4Jqlc5hXt7UAAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "IW3Zme8eDrVUOgty4Jqlc5hXt7YAAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "J7fZV3Wtra9OfodIPirFQIhG9KcAAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "J7fZV3Wtra9OfodIPirFQIhG9KkAAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "MWVxL0a9O3mnvxRzzOkcT4ziH2MAAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "MWVxL0a9O3mnvxRzzOkcT4ziH3oAAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "Pw6qQvCz1dJVoXGFwFZJXg3uClUAAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "RBXkx2ZEfxWr13HieiAcoYPTVhQAAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "3",
                            id: "SyTisHjbuHAGR3v1qdPuF9DGmzoAAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "V45fDFds68kdgmexvsF6Kmh_G_EAAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "XcjOWxs-0LWYZi5Zk3wwcKa1EcEAAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "eHmg2lMEItdGr0tbHObTT9SVxH0AAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "pcZEHL5OmrI6n1JOowfkyxf62BQAAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "sHc0AwOjpUGUjIBO8jd9HFLgQigAAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "s8H_JD5emy5bQ8tsk-MpN0zajB8AAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "3",
                            id: "xoFRPv_xsoti6yaZAoZT5zNkU7sAAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "1GWpyZYCwW05KeKzyAbLNlfjwr4AAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "6GqgN1mUVh_HdjTabX3Chy3t23MAAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "8xL7xhN6EM7ElhS09-j99g4h21cAAAAAAAAAAAAAAAA",
                        },
                    ],
                    shards: {
                        primary: [
                            {
                                pubKey:
                                    "Aw3WX32ykguyKZEuP0IT3RUOX5csm3PpvnFNhEVhrDVc",
                                shard:
                                    "KGEl4KLm3CIPKerUiPtcZ73PGfvM1x9QJlekbBmW4KI",
                            },
                        ],
                        secondary: [],
                        tertiary: [],
                    },
                },
                ZEC: {
                    dustAmount: "546",
                    fees: {
                        chains: [
                            {
                                burnFee: "15",
                                chain: "Avalanche",
                                mintFee: "15",
                            },
                            {
                                burnFee: "15",
                                chain: "BinanceSmartChain",
                                mintFee: "15",
                            },
                            {
                                burnFee: "15",
                                chain: "Ethereum",
                                mintFee: "25",
                            },
                            {
                                burnFee: "15",
                                chain: "Fantom",
                                mintFee: "15",
                            },
                            {
                                burnFee: "15",
                                chain: "Polygon",
                                mintFee: "15",
                            },
                            {
                                burnFee: "15",
                                chain: "Solana",
                                mintFee: "15",
                            },
                        ],
                        epochs: [
                            {
                                amount: "0",
                                epoch: "0",
                                numNodes: "0",
                            },
                            {
                                amount: "565",
                                epoch: "1",
                                numNodes: "28",
                            },
                            {
                                amount: "1338",
                                epoch: "2",
                                numNodes: "28",
                            },
                            {
                                amount: "0",
                                epoch: "3",
                                numNodes: "29",
                            },
                            {
                                amount: "0",
                                epoch: "4",
                                numNodes: "29",
                            },
                        ],
                        nodes: [],
                        unassigned: "24133002",
                    },
                    gasCap: "200",
                    gasLimit: "400",
                    gasPrice: "200",
                    latestHeight: "1459629",
                    minimumAmount: "547",
                    minted: [
                        {
                            amount: "20101680",
                            chain: "Avalanche",
                        },
                        {
                            amount: "302430531",
                            chain: "BinanceSmartChain",
                        },
                        {
                            amount: "683455472",
                            chain: "Ethereum",
                        },
                        {
                            amount: "5549246",
                            chain: "Fantom",
                        },
                        {
                            amount: "622045",
                            chain: "Polygon",
                        },
                        {
                            amount: "99790090",
                            chain: "Solana",
                        },
                    ],
                    shards: [
                        {
                            pubKey:
                                "Aw3WX32ykguyKZEuP0IT3RUOX5csm3PpvnFNhEVhrDVc",
                            queue: [],
                            shard:
                                "KGEl4KLm3CIPKerUiPtcZ73PGfvM1x9QJlekbBmW4KI",
                            state: {
                                outpoint: {
                                    hash:
                                        "sw7oEvIW_BZvSkJQbC9Tucv52iadOmErfoyLRRepQ4M",
                                    index: "1",
                                },
                                pubKeyScript:
                                    "dqkUyZiyqIrJZnbhTwdzkANBl5mmgjqIrA",
                                value: "1565876027",
                            },
                        },
                    ],
                },
            },
        },
    },
};
