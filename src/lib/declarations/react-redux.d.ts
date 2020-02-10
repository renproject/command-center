import * as redux from "react-redux";
import { ComponentType } from "react";

declare module "react-redux" {

    type FixedInferableComponentEnhancerWithProps<TInjectedProps, TNeedsProps> =
        <C extends ComponentType<Matching<ConnectedActions<TInjectedProps>, GetProps<C>>>>(
            component: C
        ) => ConnectedComponentClass<C, Omit<GetProps<C>, keyof Shared<TInjectedProps, GetProps<C>>> & TNeedsProps>;

    type ConnectedActions<OUTER> =
        OUTER extends { actions: infer ACTIONS } ? {
            actions: {
                [KEY in keyof ACTIONS]:
            /**/ACTIONS[KEY] extends (...args: infer Args) => (d: any, getState?: any) => Promise<infer X> ?
            /**//**/(...args: Args) => Promise<X> :
            /**//**/ACTIONS[KEY];
            };
        } : never;

    export type ConnectedReturnType<X> = X extends (...args: any[]) => any ? ConnectedActions<ReturnType<X>> : X;

    export interface Connect {
        // tslint:disable:no-unnecessary-generics
        (): InferableComponentEnhancer<DispatchProp>;

        <TStateProps = {}, no_dispatch = {}, TOwnProps = {}, State = {}>(
            mapStateToProps: MapStateToPropsParam<TStateProps, TOwnProps, State>
        ): FixedInferableComponentEnhancerWithProps<TStateProps & DispatchProp, TOwnProps>;

        <no_state = {}, TDispatchProps = {}, TOwnProps = {}>(
            mapStateToProps: null | undefined,
            mapDispatchToProps: MapDispatchToPropsNonObject<TDispatchProps, TOwnProps>
        ): FixedInferableComponentEnhancerWithProps<TDispatchProps, TOwnProps>;

        <no_state = {}, TDispatchProps = {}, TOwnProps = {}>(
            mapStateToProps: null | undefined,
            mapDispatchToProps: TDispatchProps,
        ): FixedInferableComponentEnhancerWithProps<
            ResolveThunks<TDispatchProps>,
            TOwnProps
        >;

        <TStateProps = {}, TDispatchProps = {}, TOwnProps = {}, State = {}>(
            mapStateToProps: MapStateToPropsParam<TStateProps, TOwnProps, State>,
            mapDispatchToProps: MapDispatchToPropsNonObject<TDispatchProps, TOwnProps>
        ): FixedInferableComponentEnhancerWithProps<TStateProps & TDispatchProps, TOwnProps>;

        <TStateProps = {}, TDispatchProps = {}, TOwnProps = {}, State = {}>(
            mapStateToProps: MapStateToPropsParam<TStateProps, TOwnProps, State>,
            mapDispatchToProps: TDispatchProps,
        ): FixedInferableComponentEnhancerWithProps<
            TStateProps & ResolveThunks<TDispatchProps>,
            TOwnProps
        >;

        <TStateProps = {}, no_dispatch = {}, TOwnProps = {}, TMergedProps = {}, State = {}>(
            mapStateToProps: MapStateToPropsParam<TStateProps, TOwnProps, State>,
            mapDispatchToProps: null | undefined,
            mergeProps: MergeProps<TStateProps, undefined, TOwnProps, TMergedProps>,
        ): FixedInferableComponentEnhancerWithProps<TMergedProps, TOwnProps>;

        <no_state = {}, TDispatchProps = {}, TOwnProps = {}, TMergedProps = {}>(
            mapStateToProps: null | undefined,
            mapDispatchToProps: MapDispatchToPropsParam<TDispatchProps, TOwnProps>,
            mergeProps: MergeProps<undefined, TDispatchProps, TOwnProps, TMergedProps>,
        ): FixedInferableComponentEnhancerWithProps<TMergedProps, TOwnProps>;

        <no_state = {}, no_dispatch = {}, TOwnProps = {}, TMergedProps = {}>(
            mapStateToProps: null | undefined,
            mapDispatchToProps: null | undefined,
            mergeProps: MergeProps<undefined, undefined, TOwnProps, TMergedProps>,
        ): FixedInferableComponentEnhancerWithProps<TMergedProps, TOwnProps>;

        <TStateProps = {}, TDispatchProps = {}, TOwnProps = {}, TMergedProps = {}, State = {}>(
            mapStateToProps: MapStateToPropsParam<TStateProps, TOwnProps, State>,
            mapDispatchToProps: MapDispatchToPropsParam<TDispatchProps, TOwnProps>,
            mergeProps: MergeProps<TStateProps, TDispatchProps, TOwnProps, TMergedProps>,
            options?: Options<State, TStateProps, TOwnProps, TMergedProps>
        ): FixedInferableComponentEnhancerWithProps<TMergedProps, TOwnProps>;

        <TStateProps = {}, no_dispatch = {}, TOwnProps = {}, State = {}>(
            mapStateToProps: MapStateToPropsParam<TStateProps, TOwnProps, State>,
            mapDispatchToProps: null | undefined,
            mergeProps: null | undefined,
            options: Options<State, TStateProps, TOwnProps>
        ): FixedInferableComponentEnhancerWithProps<DispatchProp & TStateProps, TOwnProps>;

        <TStateProps = {}, TDispatchProps = {}, TOwnProps = {}>(
            mapStateToProps: null | undefined,
            mapDispatchToProps: MapDispatchToPropsNonObject<TDispatchProps, TOwnProps>,
            mergeProps: null | undefined,
            options: Options<{}, TStateProps, TOwnProps>
        ): FixedInferableComponentEnhancerWithProps<TDispatchProps, TOwnProps>;

        <TStateProps = {}, TDispatchProps = {}, TOwnProps = {}>(
            mapStateToProps: null | undefined,
            mapDispatchToProps: TDispatchProps,
            mergeProps: null | undefined,
            options: Options<{}, TStateProps, TOwnProps>
        ): FixedInferableComponentEnhancerWithProps<
            ResolveThunks<TDispatchProps>,
            TOwnProps
        >;

        <TStateProps = {}, TDispatchProps = {}, TOwnProps = {}, State = {}>(
            mapStateToProps: MapStateToPropsParam<TStateProps, TOwnProps, State>,
            mapDispatchToProps: MapDispatchToPropsNonObject<TDispatchProps, TOwnProps>,
            mergeProps: null | undefined,
            options: Options<State, TStateProps, TOwnProps>
        ): FixedInferableComponentEnhancerWithProps<TStateProps & TDispatchProps, TOwnProps>;

        <TStateProps = {}, TDispatchProps = {}, TOwnProps = {}, State = {}>(
            mapStateToProps: MapStateToPropsParam<TStateProps, TOwnProps, State>,
            mapDispatchToProps: TDispatchProps,
            mergeProps: null | undefined,
            options: Options<State, TStateProps, TOwnProps>
        ): FixedInferableComponentEnhancerWithProps<
            TStateProps & ResolveThunks<TDispatchProps>,
            TOwnProps
        >;
        // tslint:enable:no-unnecessary-generics
    }
}