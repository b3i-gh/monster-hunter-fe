import { useRemoteDataStorage } from "../hooks/useRemoteDataStorage.js";
import { useLocalDataStorage } from "../hooks/useLocalDataStorage.js";
import { useState } from "react";
import Can from "../components/Can.js";

export const useSyncrhonizer = () => {
  const { loadLocalData, saveLocalData, addLocalCan, deleteLocalCan } =
    useLocalDataStorage();
  const {
    loadRemoteData,
    addRemoteCan,
    deleteRemoteCan,
    changeApiUrl,
    getCurrentApiUrl,
    pingAPI,
  } = useRemoteDataStorage();
  const [reachableApi, setReachableApi] = useState(false);

  const addCan = async (canData) => {
    const tempId =
      Date.now().toString(36) + Math.random().toString(36).substring(2);
    const newCan = new Can(
      tempId,
      canData.name,
      canData.cc,
      canData.lang,
      canData.sugarFree,
      new Date().toISOString().split("T")[0],
      false
    );
    await addLocalCan(newCan);
  };

  const deleteCan = async (can) => {
    deleteLocalCan(can);
    synchronize();
  };

  const synchronize = async () => {
    const apiReachable = await pingAPI();
    setReachableApi(apiReachable);

    // Load local data
    const localData = await loadLocalData();
    let syncData = localData;

    // Update inserted and deleted cans on the remote db
    const updateModifiedData = async () => {
      if (apiReachable) {
        try {
          for (const can of localData) {
            if (can.deleted) {
              await deleteRemoteCan(can);
            } else if (can.syncDate === null) {
              can.syncDate = new Date()
                .toLocaleString("sv-SE", {
                  timeZone: "Europe/Rome",
                  hour12: false,
                })
                .replace(" ", "T");
              await addRemoteCan(can);
            }
          }
        } catch (e) {
          console.error(
            "An error occured during the synchronization of local and remote data: ",
            e
          );
        }
        syncData = await loadRemoteData();
      }
    };

    await updateModifiedData();
    // Make sure this is the last operation
    await saveLocalData(syncData);

    console.log("Synchronization completed");
    return syncData;
  };

  return {
    addCan,
    deleteCan,
    synchronize,
    changeApiUrl,
    getCurrentApiUrl,
    reachableApi,
  };
};
