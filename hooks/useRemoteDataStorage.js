import { useState } from "react";
import Can from "../components/Can";

const DEFAULT_API_URL = "http://192.168.1.52:8080/api/v1/cans";

export const useRemoteDataStorage = () => {
  const [apiUrl, setApiUrl] = useState(DEFAULT_API_URL);
  const [remoteCanList, setRemoteCanList] = useState([]);

  const loadRemoteData = async () => {
    try {
      const apiResponse = await fetch(apiUrl);
      const loadedData = await apiResponse.json();
      const fetchedCanList = [];
      if (loadedData) {
        loadedData.forEach((c) => {
          const fetchedCan = new Can(
            c.id,
            c.name,
            c.cc,
            c.lang,
            c.sugarFree,
            c.creationDate,
            c.deleted,
            c.syncDate
          );
          fetchedCanList.push(fetchedCan);
        });
        setRemoteCanList(fetchedCanList);
        return fetchedCanList;
      }
    } catch (e) {
      console.error("Failed to load the remote data: ", e);
    }
  };

  const pingAPI = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 seconds timeout

      const response = await fetch(apiUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.ok) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  };

  const addRemoteCan = async (can) => {
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: can.name,
          cc: can.cc,
          lang: can.lang,
          sugarFree: can.sugarFree,
          creationDate: can.creationDate,
          deleted: false,
          syncDate: can.syncDate,
        }),
      });

      const savedData = await response.json();
      const savedCan = new Can(
        savedData.id,
        can.name,
        can.cc,
        can.lang,
        can.sugarFree,
        can.creationDate,
        false,
        can.syncDate
      );
      setRemoteCanList([...remoteCanList, savedCan]);
    } catch (error) {
      console.error("Failed to save the remote data: ", error);
    }
  };

  const deleteRemoteCan = async (can) => {
    try {
      await fetch(apiUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: can.id,
          name: can.name,
          cc: can.cc,
          lang: can.lang,
          sugarFree: can.sugarFree,
          creationDate: can.creationDate,
          deleted: true,
          syncDate: can.syncDate,
        }),
      });
    } catch (e) {
      console.error("Failed to delete the remote data", e);
    }
  };

  const changeApiUrl = (url) => {
    setApiUrl(url);
  };

  const getCurrentApiUrl = () => {
    return apiUrl;
  };

  return {
    loadRemoteData,
    addRemoteCan,
    deleteRemoteCan,
    changeApiUrl,
    getCurrentApiUrl,
    pingAPI,
  };
};
