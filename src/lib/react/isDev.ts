// import { NODE_ENV } from "./environmentVariables";

export const isDev = () => {
    // return NODE_ENV === "development";
    // tslint:disable-next-line: insecure-random
    return Math.random() > 0.5;
};
