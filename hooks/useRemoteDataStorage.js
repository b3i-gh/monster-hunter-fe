import { useState } from "react";
import Can from "../components/Can";
import * as FileSystem from "expo-file-system";

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
        for (const c of loadedData) {
          // Download photos for each can
          const photos = await fetchCanPhotos(c.id);
          const fetchedCan = new Can(
            c.id,
            c.name,
            c.cc,
            c.lang,
            c.sugarFree,
            c.creationDate,
            c.deleted,
            c.syncDate,
            photos
          );
          fetchedCanList.push(fetchedCan);
        }
        setRemoteCanList(fetchedCanList);
        return fetchedCanList;
      }
    } catch (e) {
      console.error("Failed to load the remote data: ", e);
    }
  };

  const fetchCanPhotos = async (canId) => {
    try {
      const response = await fetch(`${apiUrl}/${canId}/photos`);
      const photos = await response.json();

      // Download and cache each photo
      const photosWithLocalUri = await Promise.all(
        photos.map(async (photo) => {
          const localUri = `${FileSystem.cacheDirectory}photos/${photo.filename}`;
          const photoUrl = `${apiUrl}/${canId}/photos/${photo.id}`;

          // Check if photo exists locally
          const fileInfo = await FileSystem.getInfoAsync(localUri);
          if (!fileInfo.exists) {
            // Create directory if it doesn't exist
            await FileSystem.makeDirectoryAsync(
              `${FileSystem.cacheDirectory}photos`,
              { intermediates: true }
            );
            // Download the photo
            await FileSystem.downloadAsync(photoUrl, localUri);
          }

          return {
            ...photo,
            localUri,
            uri: photoUrl,
          };
        })
      );

      return photosWithLocalUri;
    } catch (error) {
      console.error("Failed to fetch photos:", error);
      return [];
    }
  };

  const uploadPhoto = async (canId, photoUri) => {
    try {
      console.log("Starting photo upload for can:", canId);
      console.log("Photo URI:", photoUri);

      const formData = new FormData();
      // Get the filename from the URI
      const filename = photoUri.split("/").pop();

      formData.append("file", {
        uri: photoUri,
        type: "image/jpeg",
        name: filename || "photo.jpg",
      });

      console.log("FormData structure:", {
        uri: photoUri,
        type: "image/jpeg",
        name: filename || "photo.jpg",
      });

      const response = await fetch(`${apiUrl}/${canId}/photos`, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Response status:", response.status);
      const responseText = await response.text();
      console.log("Response text:", responseText);

      if (!response.ok) {
        throw new Error(
          `Failed to upload photo: ${response.status} ${responseText}`
        );
      }

      const photoData = JSON.parse(responseText);
      return photoData;
    } catch (error) {
      console.error("Failed to upload photo:", error);
      console.error("Error stack:", error.stack);
      throw error;
    }
  };

  const deletePhoto = async (canId, photoId) => {
    try {
      console.log("Deleting photo from server:", { canId, photoId });
      const response = await fetch(`${apiUrl}/${canId}/photos/${photoId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to delete photo: ${response.status} ${errorText}`
        );
      }

      console.log("Photo deleted successfully from server");
    } catch (e) {
      console.error("Failed to delete the remote photo:", e);
      throw e;
    }
  };

  const pingAPI = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(apiUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      return response.ok;
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
          photos: can.photos,
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
        can.syncDate,
        can.photos
      );
      setRemoteCanList([...remoteCanList, savedCan]);
    } catch (error) {
      console.error("Failed to save the remote data: ", error);
    }
  };

  const deleteRemoteCan = async (can) => {
    try {
      console.log("Logically deleting can:", can.id);

      // Create a new syncDate that's later than the current one
      const newSyncDate = new Date()
        .toLocaleString("sv-SE", {
          timeZone: "Europe/Rome",
          hour12: false,
        })
        .replace(" ", "T");

      // Create the request body with all required fields
      const requestBody = {
        id: can.id,
        name: can.name,
        cc: can.cc,
        lang: can.lang,
        sugarFree: can.sugarFree,
        creationDate: can.creationDate,
        deleted: true,
        syncDate: newSyncDate,
        photos: can.photos.map((photo) => ({
          id: photo.id,
          filename: photo.filename,
          createdAt: photo.createdAt,
          syncDate: photo.syncDate,
        })),
      };

      console.log("Request body:", JSON.stringify(requestBody, null, 2));

      const response = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("Response status:", response.status);
      const responseText = await response.text();
      console.log("Response text:", responseText);

      if (!response.ok) {
        throw new Error(
          `Failed to delete can: ${response.status} ${responseText}`
        );
      }

      console.log("Can marked as deleted on server:", can.id);
    } catch (e) {
      console.error("Failed to delete the remote data:", e);
      throw e;
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
    uploadPhoto,
    deletePhoto,
  };
};
