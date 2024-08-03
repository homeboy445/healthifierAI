import { createContext } from "react";
import { GenericObject } from "../types/types";


type requestResponseType = Promise<{ status?: number; data: any; isError?: boolean; error?: any }>;

interface GlobalContextType {
    request: (path: string, headers?: GenericObject, options?: { avoidAuthHeaders: boolean }) => {
        get: () => requestResponseType;
        post: (body: GenericObject) => requestResponseType;
    },
    isLoggedIn: boolean;
    updateLoggedInState: (state: boolean) => void;
};

const globalContext = createContext<GlobalContextType>({
    request: () => {
        return {
            get: async () => { return { data: null } },
            post: async () => { return { data: null } }
        };
    },
    isLoggedIn: false,
    updateLoggedInState: () => {}
});

export default globalContext;
