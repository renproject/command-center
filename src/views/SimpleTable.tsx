import styled from "styled-components";

export const SimpleTable = styled.div`
    width: 100%;

    font-weight: 300;
    font-size: 12px;
    line-height: 27px;

    letter-spacing: 1.5px;

    background: #001327;
    border-radius: 4px;
    padding: 8px 20px;

    text-transform: uppercase;
    padding-left: 20px;
    padding-right: 20px;
    border-radius: 4px;
    background: #001327;

    > div {
        display: flex;

        > :first-child {
            display: flex;
            align-items: center;
            font-weight: 500;

            margin-right: 10px;

            svg {
                width: 14px;
                margin-right: 10px;
                margin-bottom: 3px;
            }
        }

        &:not(:last-child) {
            border-bottom: 1px solid #ffffff20;
        }

        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0px 0;
    }
`;
