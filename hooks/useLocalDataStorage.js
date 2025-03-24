import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import Can from "../components/Can";

export const useLocalDataStorage = () => {
  const [localData, setLocalData] = useState([]);

  const loadLocalData = async () => {
    try {
      const asyncStorageData = await AsyncStorage.getItem("@localCanList");
      const loadedList = [];
      if (asyncStorageData) {
        const parsedData = JSON.parse(asyncStorageData);
        parsedData.forEach((c) => {
          const can = new Can(
            c.id,
            c.name,
            c.cc,
            c.lang,
            c.sugarFree,
            c.creationDate,
            c.deleted,
            c.syncDate,
            c.photos || []
          );
          loadedList.push(can);
        });
        setLocalData(loadedList);
        return loadedList;
      } else {
        return [];
      }
    } catch (e) {
      console.error("Failed to load the local data", e);
      return [];
    }
  };

  const saveLocalData = async (cans) => {
    try {
      if (cans) {
        // Ensure each can has a photos array
        const cansWithPhotos = cans.map((can) => ({
          ...can,
          photos: can.photos || [],
        }));
        setLocalData(cansWithPhotos);
        await AsyncStorage.setItem(
          "@localCanList",
          JSON.stringify(cansWithPhotos)
        );
      }
    } catch (e) {
      console.error("Failed to save the local data", e);
    }
  };

  const addLocalCan = async (can) => {
    try {
      const existingData = await loadLocalData();
      const updateData = [...existingData, can];
      await saveLocalData(updateData);
    } catch (e) {
      console.error("Failed to add the item in the local storage: ", e);
    }
  };

  const deleteLocalCan = async (deletedCan) => {
    try {
      const updatedData = localData.map((c) =>
        c.id === deletedCan.id
          ? {
              ...c,
              deleted: true,
              syncDate: new Date()
                .toLocaleString("sv-SE", {
                  timeZone: "Europe/Rome",
                  hour12: false,
                })
                .replace(" ", "T"),
            }
          : c
      );
      await saveLocalData(updatedData);
    } catch (e) {
      console.error(
        "Failed to set to deleted the item in the local storage ",
        e
      );
    }
  };

  return {
    loadLocalData,
    saveLocalData,
    addLocalCan,
    deleteLocalCan,
    localData,
  };
};
