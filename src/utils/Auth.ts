import axios from "axios";
import { SERVER_URL } from "../consts";

const LS_TOKEN_KEY = 'tokenX';

const REFRESH_TOKEN_TIME_IN_MINUTES = 10;

const getAuthTokens = (): { accessToken: string; refreshToken: string; } => {
    const tokenObj = { accessToken: "", refreshToken: "" };
    try {
        const token = localStorage.getItem(LS_TOKEN_KEY) || "";
        const parsedTokenObj = JSON.parse(token);
        tokenObj.accessToken = parsedTokenObj.accessToken;
        tokenObj.refreshToken = parsedTokenObj.refreshToken;
    } catch (e) {}
    return tokenObj;
}

const storeAuthTokens = (tokenObj: {
    accessToken: string;
    refreshToken: string;
}): void => {
    localStorage.setItem(LS_TOKEN_KEY, JSON.stringify(tokenObj));
}

const removeAuthTokens = (): void => {
    localStorage.removeItem(LS_TOKEN_KEY);
}

const refreshAuthTokens = async (): Promise<1|0> => {
    console.log('Refreshing tokens!');
    const { accessToken, refreshToken } = getAuthTokens();
    if (accessToken && refreshToken) {
        try {
            const response = await axios.post(`${SERVER_URL}/login/refresh`, { accessToken, refreshToken });
            if (response.status >= 400) {
                throw new Error("Error in refreshing tokens!");
            }
            if (response.data.accessToken && response.data.refreshToken) {
                storeAuthTokens(response.data);
                return 1;
            }
        } catch (e) {
            removeAuthTokens();
            window.location.href = "/";
        }
    }
    return 0;
}

const autoTokenRefresher = (() => {
    let interval: NodeJS.Timeout;    
    const handler = {
        run: () => {
            handler.stop();
            console.log("starting auto token refresher!");
            refreshAuthTokens();
            interval = setInterval(async () => {
                console.log('Going to refresh tokens!');
                const state = await refreshAuthTokens();
                if (state === 0) {
                    clearInterval(interval);
                }
            }, 1000 * 60 * REFRESH_TOKEN_TIME_IN_MINUTES);
            window.addEventListener("unload", () => {
                handler.stop(); // An attempt to prevent memory leak!
            });
        },
        stop: () => {
            console.log("stopping auto token refresher!");
            clearInterval(interval);
        }
    };
    return handler;
})();


export { getAuthTokens, refreshAuthTokens, autoTokenRefresher, storeAuthTokens, removeAuthTokens };
