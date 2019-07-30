import { Currency } from "@renproject/react-components";
import { Map } from "immutable";

import { OldToken, Token } from "./ethereum/tokens";

export type TokenPrices = Map<Token | OldToken, Map<Currency, number>>;
