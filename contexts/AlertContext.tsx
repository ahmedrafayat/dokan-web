import React, {Dispatch, useContext, useReducer} from "react";
import {AlertContainer} from "../components/AlertContainer";

const EMPTY: AlertContext = {
    state: {
        show: false,
        alert: {
            type: null,
            message: "",
        },
    },
    alertDispatch: () => console.error("Dispatch was uninitialized")
}

type AlertContent = {
    type: "success" | "danger" | "warning" | null,
    message: string
}

type AlertState = {
    show: boolean
    alert: AlertContent
}

type AlertProviderProps = {
    children: React.ReactNode
}

type ActionTypes = {
    type: "show",
    content: AlertContent
} | {
    type: "close"
}

type AlertContext = {
    state: AlertState,
    alertDispatch: Dispatch<ActionTypes>
}

const AlertContext = React.createContext<AlertContext>(EMPTY);

export const useAlertContext = () => {
    return useContext(AlertContext);
}

const alertReducer = (state: AlertState, action: ActionTypes): AlertState => {
    switch (action.type) {
        case "show":
            return {show: true, alert: {type: action.content.type, message: action.content.message}};
        case "close":
            return EMPTY.state
        default:
            return EMPTY.state
    }
}

export const AlertContextProvider = (props: AlertProviderProps) => {
    const [state, dispatch] = useReducer(alertReducer, EMPTY.state)

    return (
        <AlertContext.Provider value={{state: state, alertDispatch: dispatch}}>
            <AlertContainer/>
            {props.children}
        </AlertContext.Provider>
    )
}

