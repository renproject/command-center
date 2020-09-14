import { useApolloClient } from "@apollo/react-hooks";
import { useState } from "react";
import { createContainer } from "unstated-next";

import { useTaskSchedule } from "../hooks/useTaskSchedule";
import { queryRenVM, RenVM } from "../lib/graphQL/queries/renVM";
import { catchBackgroundException } from "../lib/react/errors";

const useGraphContainer = () => {
  const client = useApolloClient();

  const [renVM, setRenVM] = useState<RenVM | null>(null);

  const updater = async () => {
    try {
      const newRenVM = await queryRenVM(client);
      setRenVM(newRenVM);
      return { timeout: 60, result: newRenVM };
    } catch (error) {
      catchBackgroundException(error, "Error in graphStore: updater");
      return { timeout: 15, result: renVM };
    }
  };
  const [fetchRenVM] = useTaskSchedule(updater);

  return {
    renVM,
    fetchRenVM,
  };
};

export const GraphContainer = createContainer(useGraphContainer);
