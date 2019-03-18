import React, {useReducer} from 'react';
import {WRITING_VALUE} from "./page/OnsketMoteFormSporsmal";
import {NyDialogMeldingData} from "../api/dataTypes";
import {postDialog} from "../api/api";
import {initialState as initialFlowState,
    reducer as flowReducer,
    ActionTypes as FlowActionTypes
} from './flowReducer';
import {initialState as initialFetchState,
    reducer as fetchReducer,
    ActionTypes as FetchActionTypes,
    Action as FetchAction
} from './fetchReducer';
import SporsmalView from "./SporsmalView";
import {parseDialogId} from "../util/parse";
import Lenke from "nav-frontend-lenker";


function dataFetcher(dispatch: (value: FetchAction) => void, value: string, dialogId?: string) {
    dispatch({type: FetchActionTypes.LOADING});
    const data: NyDialogMeldingData = {dialogId: dialogId, tekst: value, overskrift: 'Mitt første møte med NAV'};
    return postDialog(data)
        .then(res => dispatch({type: FetchActionTypes.OK, value: res.id}))
        .catch((reason) => {
            dispatch({type: FetchActionTypes.FAILURE});
            return Promise.reject(reason)
        })
}

function SporsmalManager() {
    const dialogIdParam = parseDialogId();

    const [flowState, flowDispatch] = useReducer(flowReducer, initialFlowState);
    const [fetchState, fetchDispatch] = useReducer(fetchReducer, {...initialFetchState, dialogId: dialogIdParam});

    const onSubmit = (value: string) => {
            if (flowState.step === 0 && value === WRITING_VALUE){
                flowDispatch({type: FlowActionTypes.SET, value: 3})
            }
            else if(value.length === 0){
                flowDispatch({type: FlowActionTypes.NEXT});
            }
            else {
                dataFetcher(fetchDispatch, value, fetchState.dialogId)
                    .then(() => flowDispatch({type: FlowActionTypes.NEXT}))
            }
        };


    const dialogIdLink = fetchState.dialogId ? `/${fetchState.dialogId}` : '';
    const href = `aktivitetsplan/dialog${dialogIdLink}`;

    return <>
            <SporsmalView step={flowState.step}
                         onSubmit={onSubmit}
                         loading={fetchState.loading}/>
            <Lenke href={href}>
                Avbryt
            </Lenke>
        </>


}

export default SporsmalManager;