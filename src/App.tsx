import { useState, useEffect } from "react";
import axios, { AxiosResponse } from "axios";
import globalContext from "./contexts/globalContext";
import { GenericObject } from "./types/types";
import {
  autoTokenRefresher,
  getAuthTokens,
  refreshAuthTokens,
} from "./utils/Auth";
import { SERVER_URL } from "./consts";
import Menu from "./components/menu/menuRouter";
import Login from "./components/login/login";

const App = () => {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(
    !!getAuthTokens().accessToken
  );

  const updateUserLoggedInState = (state: boolean) => {
    if (state) {
      autoTokenRefresher.run();
    } else {
      autoTokenRefresher.stop();
    }
    setIsUserLoggedIn(state);
  };

  const request = (
    path: string,
    headers: GenericObject = {},
    options: { avoidAuthHeaders: boolean } = { avoidAuthHeaders: false }
  ) => {
    const headersObj = { ...headers };
    const authTokens = getAuthTokens();
    headersObj["Content-Type"] = "application/json";
    if (!options.avoidAuthHeaders) {
      headersObj["Authorization"] = `Bearer ${authTokens.accessToken}`;
    }
    const AuthURL = SERVER_URL;
    const responseProcessor = async (
      response: Promise<AxiosResponse<any, any>>
    ): Promise<{
      status?: number;
      data: any;
      isError?: boolean;
      error?: any;
    }> => {
      try {
        const mainResponse = await response;
        if (mainResponse.status >= 400) {
          if (mainResponse.status === 401) {
            const state = await refreshAuthTokens();
            if (state === 0) {
              updateUserLoggedInState(false);
            }
          }
          return {
            status: mainResponse.status,
            data: mainResponse.data,
            isError: true,
          };
        }
        return { data: mainResponse.data };
      } catch (e) {
        return { data: null, isError: true, error: e };
      }
    };
    const get = () => {
      return responseProcessor(
        axios.get(`${AuthURL}/${path}`, {
          headers: headersObj,
        })
      );
    };
    const post = async (body: GenericObject) => {
      return responseProcessor(
        axios.post(`${AuthURL}/${path}`, body, { headers: headersObj })
      );
    };
    const deleteMethod = (queryParams?: string) => {
      return responseProcessor(
        axios.delete(`${AuthURL}/${path}?${queryParams || ""}`, {
          headers: headersObj,
        })
      );
    };
    return { get, post, delete: deleteMethod };
  };

  useEffect(() => {
    if (isUserLoggedIn) {
      autoTokenRefresher.run();
    }
  }, []);

  return (
    <div id="outer-container">
      <globalContext.Provider
        value={{
          request,
          isLoggedIn: isUserLoggedIn,
          updateLoggedInState: updateUserLoggedInState,
        }}
      >
        {isUserLoggedIn ? <Menu /> : <Login />}
      </globalContext.Provider>
    </div>
  );
};

export default App;
