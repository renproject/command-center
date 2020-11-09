import React, { useState } from "react";
import { useHistory } from "react-router-dom";

import {
  darknodeIDBase58ToHex,
  darknodeIDHexToBase58,
} from "../../lib/darknode/darknodeID";
import { Ox } from "../../lib/ethereum/contractReads";
import { EncodedData } from "../../lib/general/encodedData";
import { classNames } from "../../lib/react/className";

const isDarknodeAddress = (search: string): string | undefined => {
  const regex = new RegExp(/^(0x)?[a-f0-9]{40}$/i);
  try {
    if (search.match(regex)) {
      return darknodeIDHexToBase58(search);
    }
    if (darknodeIDBase58ToHex(search).match(regex)) {
      return search;
    }
  } catch (error) {
    /* Ignore error */
  }
  return undefined;
};

const isTransaction = (search: string): string | undefined => {
  const regex = new RegExp(/^(0x)?[a-f0-9]{64}$/i);
  try {
    if (search.match(regex)) {
      return Ox(search);
    }
    if (
      new EncodedData(search, EncodedData.Encodings.BASE64).toHex().match(regex)
    ) {
      return new EncodedData(search, EncodedData.Encodings.BASE64).toHex();
    }
  } catch (error) {
    /* Ignore error */
  }
  return undefined;
};

const isBlock = (search: string): number | undefined => {
  const regex = new RegExp(/^\d+$/);
  return !!search.match(regex) ? parseInt(search, 10) : undefined;
};

interface Props {
  className?: string;
}

export const Search: React.FC<Props> = ({ className }) => {
  const [searchInput, setSearchInput] = useState("");
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleInput = (event: React.FormEvent<HTMLInputElement>): void => {
    setNotFound(false);
    const element = event.target as HTMLInputElement;
    setSearchInput(String(element.value));
  };

  const history = useHistory();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    setLoadingSearch(true);
    event.preventDefault();
    const search = searchInput;

    if (isDarknodeAddress(search)) {
      // setSearchInput("");
      history.push(`/darknode/${isDarknodeAddress(search)}`);
    } else if (isTransaction(search)) {
      // setSearchInput("");
      history.push(`/renvm/tx/${isTransaction(search)}`);
    } else if (isBlock(search)) {
      // setSearchInput("");
      history.push(`/renvm/${isBlock(search)}`);
    } else {
      setNotFound(true);
    }
    setLoadingSearch(false);
  };

  return (
    <div className={classNames("header--group--search", className)}>
      <form
        onSubmit={
          loadingSearch
            ? () => {
                /* disabled */
              }
            : handleSubmit
        }
      >
        <input
          disabled={loadingSearch}
          type="text"
          className={classNames(
            "header--search--input",
            "header--selected",
            notFound ? "header--search--404" : "",
          )}
          onChange={handleInput}
          value={searchInput}
          placeholder="Search darknodes / transactions"
        />
      </form>
    </div>
  );
};
