import { sleep } from "@renproject/react-components";
import { extractError } from "./react/errors";

export const retryNTimes = async <T>(
    fnCall: () => Promise<T>,
    retries: number,
) => {
    let returnError;
    for (let i = 0; i < retries; i++) {
        try {
            return await fnCall();
        } catch (error) {
            if (/timeout of .* exceeded/.exec(String(error))) {
                returnError = error;
            } else {
                const errorMessage = extractError(error);
                if (errorMessage) {
                    error.message += ` (${errorMessage})`;
                }
                throw error;
            }
        }
        await sleep(100);
    }
    throw returnError;
};
