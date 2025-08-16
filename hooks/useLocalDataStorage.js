import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import Can from "../components/Can";
import * as FileSystem from "expo-file-system";

export const useLocalDataStorage = () => {
  const [localData, setLocalData] = useState([]);

  const loadLocalData = async () => {
    AsyncStorage.setItem("@localCanList", null);
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
      false,
      []
    );
    try {
      const existingData = await loadLocalData();
      const updateData = [...existingData, newCan];
      await saveLocalData(updateData);
    } catch (e) {
      console.error("Failed to add the item in the local storage: ", e);
    }
  };

  const deleteCan = async (deletedCan) => {
    try {
      // Remove all photos related to the can
      if (deletedCan.photos && Array.isArray(deletedCan.photos)) {
        for (const photo of deletedCan.photos) {
          if (photo.uri) {
            try {
              await FileSystem.deleteAsync(photo.uri, { idempotent: true });
            } catch (err) {
              console.warn("Failed to delete photo file:", photo.uri, err);
            }
          }
        }
      }
      // Remove the can from local storage
      const existingData = await loadLocalData();
      const updatedData = existingData.filter((c) => c.id !== deletedCan.id);
      await saveLocalData(updatedData);
    } catch (e) {
      console.error(
        "Failed to delete the can and its photos from local storage",
        e
      );
    }
  };

  const addPhotoToCan = async (can, newPhoto) => {
    try {
      const existingData = await loadLocalData();
      console.log("Existing data:", existingData);
      console.log("Adding new photo to can:", can.id, newPhoto);
      const updatedData = existingData.map((c) => {
        if (c.id === can.id) {
          c.addPhoto(newPhoto);
          return c;
        }
        return c;
      });
      await saveLocalData(updatedData);
    } catch (error) {
      console.error("Failed to add photo:", error);
      throw error;
    }
  };

  const deletePhotoFromCan = async (can, photoId) => {
    try {
      const existingData = await loadLocalData();
      const updatedData = existingData.map((c) => {
        if (c.id === can.id) {
          c.removePhoto(photoId);
          return c;
        }
        return c;
      });
      await saveLocalData(updatedData);
    } catch (error) {
      console.error("Failed to delete photo:", error);
      throw error;
    }
  };

  const getSelectedCanData = async (canId) => {
    try {
      const localData = await loadLocalData();
      const can = localData.find((c) => c.id === canId);
      if (!can) {
        console.error("Can not found:", canId);
        return null;
      }
      return can;
    } catch (error) {
      console.error("Failed to get latest can data:", error);
      throw error;
    }
  };

  return {
    loadLocalData,
    saveLocalData,
    addCan,
    deleteCan,
    addPhotoToCan,
    deletePhotoFromCan,
    getSelectedCanData,
  };
};
