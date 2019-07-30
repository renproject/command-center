import { ComponentClass, createElement, FunctionComponent } from "react";
import { Container } from "unstated-next";

// Used temporarily while we migrated from redux/unstated to unstated-next.
export const connectContainer = <Props, State, ContainerValue, ContainerState>(
    container: Container<ContainerValue, ContainerState>,
    component: string | FunctionComponent<Props> | ComponentClass<Props, State>,
) =>
    (props: Props) => <container.Provider>{createElement(component, props)}</container.Provider>;
