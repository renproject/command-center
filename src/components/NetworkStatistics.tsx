import * as React from "react";

import BigNumber from "bignumber.js";

import { connect } from "react-redux";
import { Dispatch } from "redux";
import { bindActionCreators } from "redux";

import { clearPopup, ClearPopupAction, setPopup, SetPopupAction } from "@Actions/popup/popupActions";
import { ApplicationData } from "@Reducers/types";

interface StoreProps {
    darknodeCount: BigNumber | null;
    orderCount: BigNumber | null;
}

interface NetworkStatisticsProps extends StoreProps {
    actions: {
        clearPopup: ClearPopupAction;
        setPopup: SetPopupAction;
    };
}

/**
 * NetworkStatistics displays stats about the entire network, including the
 * number of active darknodes, the total volume and token rankings
 */
class NetworkStatistics extends React.Component<NetworkStatisticsProps> {
    public constructor(props: NetworkStatisticsProps, context: object) {
        super(props, context);
    }

    public render(): JSX.Element {
        const { darknodeCount, orderCount } = this.props;
        const darknodeCountRender = darknodeCount ? darknodeCount.toFixed() : "-";
        const orderCountRender = orderCount ? orderCount.toFixed() : "-";

        return (
            <div className="section networkStatistics">
                <div className="container">
                    <h2 className="networkStatistics--title">Network statistics</h2>
                    <div className="networkStatistics--content">
                        <div className="networkStatistics--content--column">
                            <span className="networkStatistics--content--title">Active darknodes</span>
                            <p className="networkStatistics--content--value">{darknodeCountRender}</p>
                        </div>

                        <div className="networkStatistics--content--column">
                            <span className="networkStatistics--content--title">Volume</span>
                            <p className="networkStatistics--content--value">-</p>
                        </div>

                        <div className="networkStatistics--content--column">
                            <span className="networkStatistics--content--title">Top token pairs</span>
                            <p className="networkStatistics--content--value">-</p>
                        </div>

                        <div className="networkStatistics--content--column">
                            <span className="networkStatistics--content--title">Number of orders</span>
                            <p className="networkStatistics--content--value">{orderCountRender}</p>
                        </div>
                    </div>

                    <div className="networkStatistics--footnotes">
                        <p>1 Blanditiis laboriosam a optio et aut sed ut aliquam. Tempore aut numquam quis. Est voluptatem nihil sint dignissimos quam. Consequatur qui quia laborum. Maxime doloribus libero a ex fugit voluptate repudiandae accusamus. Aperiam incidunt ut perspiciatis similique.</p>

                        <p>2 Autem porro velit molestiae numquam quo facilis non repellendus. Id asperiores quisquam aut. Minima voluptas quo et velit.</p>

                        <p>3 Omnis alias ipsum enim aut aut accusamus culpa. Est molestias natus beatae dignissimos et assumenda quia sunt. Laboriosam rerum quis ea sed sequi. Rerum iure quidem enim sapiente. Et quos porro veniam ut. Cum dolore delectus aut dicta quasi dolorem voluptatum.</p>
                    </div>
                </div>
            </div>
        );
    }
}


function mapStateToProps(state: ApplicationData): StoreProps {
    return {
        darknodeCount: state.statistics.darknodeCount,
        orderCount: state.statistics.orderCount,
    };
}

function mapDispatchToProps(dispatch: Dispatch): { actions: NetworkStatisticsProps["actions"] } {
    return {
        actions: bindActionCreators({
            clearPopup,
            setPopup,
        }, dispatch)
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(NetworkStatistics);
