export const queryBlockStateResponse = {
    jsonrpc: "2.0",
    id: 1,
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
                ],
            },
            v: {
                BCH: {
                    burnFee: "10",
                    dustAmount: "546",
                    fees: {
                        epochs: [],
                        nodes: [],
                        unassigned: "0",
                    },
                    gasCap: "2",
                    gasLimit: "400",
                    gasPrice: "2",
                    latestHeight: "1447830",
                    minimumAmount: "547",
                    mintFee: "20",
                    minted: [],
                    shards: [
                        {
                            pubKey: "AjKTi8mz_QlIindwTRAvdptsic0z3kty0wn4O_G34m9Q",
                            queue: [],
                            shard: "zGbiznfn3tR3EYbnaTe28LUd1gVlhOVvMNK6qvmYub4",
                            state: {
                                outpoint: {
                                    hash: "",
                                    index: "0",
                                },
                                pubKeyScript: "",
                                value: "0",
                            },
                        },
                    ],
                },
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
                                amount: "100000000", // 14184320
                                epoch: "1",
                                numNodes: "10", // 13
                            },
                            {
                                amount: "50000000", // 27005361
                                epoch: "2",
                                numNodes: "10", // 13
                            },
                            {
                                amount: "25000000",
                                epoch: "3",
                                numNodes: "10",
                            },
                        ],
                        nodes: [
                            {
                                node: "Dnc1du8wE8dX1grSGzFszTkGC8wAAAAAAAAAAAAAAAA",
                                lastEpochClaimed: "2",
                            },
                            {
                                node: "UyR7eXjDqVnArP0aCj4qD/A0w3MAAAAAAAAAAAAAAAA",
                                lastEpochClaimed: "1",
                            },
                            {
                                node: "R22tRItPlzKCZ5xmhDUNIw/CenwAAAAAAAAAAAAAAAA",
                                lastEpochClaimed: "2",
                            },
                        ],
                        unassigned: "0",
                    },
                    gasCap: "2",
                    gasLimit: "400",
                    gasPrice: "2",
                    latestHeight: "1976142",
                    minimumAmount: "547",
                    mintFee: "20",
                    minted: [
                        {
                            amount: "1000000",
                            chain: "Binance Smart Chain",
                        },
                        {
                            amount: "1000000",
                            chain: "Ethereum",
                        },
                        {
                            amount: "720000",
                            chain: "Solana",
                        },
                    ],
                    shards: [
                        {
                            pubKey: "AjKTi8mz_QlIindwTRAvdptsic0z3kty0wn4O_G34m9Q",
                            queue: [],
                            shard: "zGbiznfn3tR3EYbnaTe28LUd1gVlhOVvMNK6qvmYub4",
                            state: {
                                outpoint: {
                                    hash: "vXqqfST0-D-mdRpogGQ-3r_y-dgOjfSvlIti-wdVmdA",
                                    index: "0",
                                },
                                pubKeyScript:
                                    "dqkUJAugnjIJ_j_mJBGTbg2O6Tr557qIrA",
                                value: "3090494",
                            },
                        },
                    ],
                },
                DGB: {
                    burnFee: "10",
                    dustAmount: "546",
                    fees: {
                        epochs: [],
                        nodes: [],
                        unassigned: "0",
                    },
                    gasCap: "200",
                    gasLimit: "400",
                    gasPrice: "200",
                    latestHeight: "1731194",
                    minimumAmount: "547",
                    mintFee: "20",
                    minted: [],
                    shards: [
                        {
                            pubKey: "AjKTi8mz_QlIindwTRAvdptsic0z3kty0wn4O_G34m9Q",
                            queue: [],
                            shard: "zGbiznfn3tR3EYbnaTe28LUd1gVlhOVvMNK6qvmYub4",
                            state: {
                                outpoint: {
                                    hash: "",
                                    index: "0",
                                },
                                pubKeyScript: "",
                                value: "0",
                            },
                        },
                    ],
                },
                DOGE: {
                    burnFee: "10",
                    dustAmount: "100000000",
                    fees: {
                        epochs: [
                            {
                                amount: "0",
                                epoch: "0",
                                numNodes: "0",
                            },
                            {
                                amount: 4206.9 * 10 ** 8,
                                epoch: "1",
                                numNodes: "10",
                            },
                            {
                                amount: 1235 * 10 ** 8, // 1.235 DOGE
                                epoch: "2",
                                numNodes: "10",
                            },
                            {
                                amount: 690 * 10 ** 8, // 0.69 DOGE
                                epoch: "3",
                                numNodes: "10",
                            },
                        ],
                        nodes: [],
                        unassigned: "0",
                    },
                    gasCap: "800000",
                    gasLimit: "400",
                    gasPrice: "800000",
                    latestHeight: "3192437",
                    minimumAmount: "100000001",
                    mintFee: "20",
                    minted: [],
                    shards: [
                        {
                            pubKey: "AjKTi8mz_QlIindwTRAvdptsic0z3kty0wn4O_G34m9Q",
                            queue: [],
                            shard: "zGbiznfn3tR3EYbnaTe28LUd1gVlhOVvMNK6qvmYub4",
                            state: {
                                outpoint: {
                                    hash: "",
                                    index: "0",
                                },
                                pubKeyScript: "",
                                value: "0",
                            },
                        },
                    ],
                },
                FIL: {
                    burnFee: "10",
                    dustAmount: "0",
                    fees: {
                        epochs: [
                            {
                                amount: "0",
                                epoch: "0",
                                numNodes: "0",
                            },
                        ],
                        nodes: [],
                        unassigned: "0",
                    },
                    gasCap: "201650",
                    gasLimit: "2200000",
                    gasPrice: "199542",
                    latestHeight: "237148",
                    minimumAmount: "1",
                    mintFee: "20",
                    minted: [],
                    shards: [
                        {
                            pubKey: "AjKTi8mz_QlIindwTRAvdptsic0z3kty0wn4O_G34m9Q",
                            queue: [],
                            shard: "zGbiznfn3tR3EYbnaTe28LUd1gVlhOVvMNK6qvmYub4",
                            state: {
                                gnonces: [],
                                nonce: "1751",
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
                        ],
                        nodes: [],
                        unassigned: "0",
                    },
                    gasCap: "2",
                    gasLimit: "150000",
                    gasPrice: "2",
                    latestHeight: "3920391",
                    minimumAmount: "1",
                    mintFee: "20",
                    minted: [],
                    shards: [
                        {
                            pubKey: "AjKTi8mz_QlIindwTRAvdptsic0z3kty0wn4O_G34m9Q",
                            queue: [],
                            shard: "zGbiznfn3tR3EYbnaTe28LUd1gVlhOVvMNK6qvmYub4",
                            state: {
                                gnonces: [],
                                nonce: "6241",
                            },
                        },
                    ],
                },
                System: {
                    epoch: {
                        hash: "DH379e0CMqJeafGJjU9yDAT0geI3VddI_xciO-wSQtQ",
                        numNodes: "10",
                        number: "3",
                        timestamp: "1590971276",
                    },
                    nodes: [
                        {
                            enteredAt: "1",
                            id: "Dnc1du8wE8dX1grSGzFszTkGC8wAAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "FRJJzYPusCVGe5pjOJPG3YCvM9EAAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "OVs9hdv8agALbT28Z6EzYegJuFsAAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "UyR7eXjDqVnArP0aCj4qD/A0w3MAAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "Vh2JYEd_pDLKZ0It4iTc2yeZPYIAAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "XDgIUhnj8YHdPjiUXniR_rIaOusAAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "jPCdB8ieIcH3jM674-FRPJCFx88AAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "lJiuNXOniALrqMJGt5i_2nyv7-0AAAAAAAAAAAAAAAA",
                        },
                        {
                            enteredAt: "1",
                            id: "li963gPP4ANqdvHQ8rfC9hxLl7gAAAAAAAAAAAAAAAA",
                        },
                        // {
                        //     enteredAt: "1",
                        //     id: "oNig-tMtnRPeOY00OzxAQHmpMS4AAAAAAAAAAAAAAAA",
                        // },
                        // {
                        //     enteredAt: "1",
                        //     id: "ptiBAJHFqEI7PlTVrA8bXaZgDAYAAAAAAAAAAAAAAAA",
                        // },
                        {
                            enteredAt: "1",
                            id: "R22tRItPlzKCZ5xmhDUNIw/CenwAAAAAAAAAAAAAAAA",
                        },
                        // {
                        //     enteredAt: "1",
                        //     id: "4HeZWmxBhkMpB-L-V7zYycImzs0AAAAAAAAAAAAAAAA",
                        // },
                    ],
                    shards: {
                        primary: [
                            {
                                pubKey: "AjKTi8mz_QlIindwTRAvdptsic0z3kty0wn4O_G34m9Q",
                                shard: "zGbiznfn3tR3EYbnaTe28LUd1gVlhOVvMNK6qvmYub4",
                            },
                        ],
                        secondary: [],
                        tertiary: [],
                    },
                },
                ZEC: {
                    burnFee: "10",
                    dustAmount: "546",
                    fees: {
                        epochs: [],
                        nodes: [],
                        unassigned: "0",
                    },
                    gasCap: "200",
                    gasLimit: "400",
                    gasPrice: "200",
                    latestHeight: "1417916",
                    minimumAmount: "547",
                    mintFee: "20",
                    minted: [],
                    shards: [
                        {
                            pubKey: "AjKTi8mz_QlIindwTRAvdptsic0z3kty0wn4O_G34m9Q",
                            queue: [],
                            shard: "zGbiznfn3tR3EYbnaTe28LUd1gVlhOVvMNK6qvmYub4",
                            state: {
                                outpoint: {
                                    hash: "",
                                    index: "0",
                                },
                                pubKeyScript: "",
                                value: "0",
                            },
                        },
                    ],
                },
            },
        },
    },
};
