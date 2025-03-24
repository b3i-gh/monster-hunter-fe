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
    uploadPhoto,
    deletePhoto,
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
      false,
      null,
      []
    );
    await addLocalCan(newCan);
  };

  const deleteCan = async (can) => {
    try {
      console.log("Deleting can and its photos:", can.id);

      // If API is reachable, delete all photos first
      if (await pingAPI()) {
        console.log("API reachable, deleting all photos for can:", can.id);
        // Delete each photo from the server
        for (const photo of can.photos) {
          try {
            await deletePhoto(can.id, photo.id);
            console.log("Photo deleted from server:", photo.id);
          } catch (photoError) {
            console.error("Failed to delete photo:", photoError);
          }
        }
      }

      // Delete the can locally
      await deleteLocalCan(can);

      // If API is reachable, delete the can from server
      if (await pingAPI()) {
        await deleteRemoteCan(can);
        console.log("Can deleted from server:", can.id);

        // Update local data with fresh data from server
        const freshData = await loadRemoteData();
        await saveLocalData(freshData);
      } else {
        console.log("API not reachable, can deletion will sync later");
      }
    } catch (error) {
      console.error("Failed to delete can:", error);
      console.error("Error details:", {
        canId: can.id,
        stack: error.stack,
      });
      throw error;
    }
  };

  const synchronize = async () => {
    const apiReachable = await pingAPI();
    setReachableApi(apiReachable);
    console.log("API Reachable:", apiReachable);

    // Load local data
    const localData = await loadLocalData();
    let syncData = localData;
    console.log("Local data loaded, cans count:", localData.length);

    // Update inserted and deleted cans on the remote db
    const updateModifiedData = async () => {
      if (apiReachable) {
        try {
          for (const can of localData) {
            if (can.deleted) {
              console.log("Deleting can:", can.id);
              await deleteRemoteCan(can);
            } else if (can.syncDate === null) {
              console.log(
                "Syncing can:",
                can.id,
                "Photos count:",
                can.photos?.length
              );
              // Handle photos for modified cans
              const photos = can.photos || [];
              for (const photo of photos) {
                if (!photo.syncDate) {
                  try {
                    console.log("Uploading photo for can:", can.id);
                    // Upload new photos that haven't been synced
                    const photoData = await uploadPhoto(can.id, photo.uri);
                    console.log("Photo uploaded successfully:", photoData);
                    photo.syncDate = new Date()
                      .toLocaleString("sv-SE", {
                        timeZone: "Europe/Rome",
                        hour12: false,
                      })
                      .replace(" ", "T");
                    Object.assign(photo, photoData);
                  } catch (photoError) {
                    console.error("Failed to upload photo:", photoError);
                    console.error("Photo details:", {
                      canId: can.id,
                      photoId: photo.id,
                    });
                  }
                }
              }

              // Update can's sync date and save to remote
              can.syncDate = new Date()
                .toLocaleString("sv-SE", {
                  timeZone: "Europe/Rome",
                  hour12: false,
                })
                .replace(" ", "T");
              await addRemoteCan(can);
              console.log("Can updated on remote:", can.id);
            }
          }
        } catch (e) {
          console.error(
            "An error occurred during the synchronization of local and remote data: ",
            e,
            "\nStack:",
            e.stack
          );
        }
        // Get fresh data from remote after all updates
        console.log("Fetching updated data from remote");
        syncData = await loadRemoteData();
      }
    };

    await updateModifiedData();
    // Make sure this is the last operation
    await saveLocalData(syncData);
    console.log("Sync complete, saved to local storage");

    return syncData;
  };

  const addPhotoToCan = async (can, newPhoto) => {
    try {
      console.log("Adding photo to can:", can.id);
      const existingData = await loadLocalData();
      const updatedData = existingData.map((c) => {
        if (c.id === can.id) {
          c.addPhoto(newPhoto);
          return c;
        }
        return c;
      });
      await saveLocalData(updatedData);
      console.log("Photo added to local storage");

      // If API is reachable, upload the photo immediately
      if (await pingAPI()) {
        console.log("API reachable, uploading photo");
        const photoData = await uploadPhoto(can.id, newPhoto.uri);
        console.log("Photo uploaded successfully:", photoData);

        // Update the photo with server data, including the new ID
        const updatedDataWithServerId = existingData.map((c) => {
          if (c.id === can.id) {
            const updatedPhotos = c.photos.map((p) => {
              if (p.id === newPhoto.id) {
                // Create a new photo object with the server's ID and data
                return {
                  ...p,
                  id: photoData.id, // Use the server's UUID
                  ...photoData,
                  syncDate: new Date()
                    .toLocaleString("sv-SE", {
                      timeZone: "Europe/Rome",
                      hour12: false,
                    })
                    .replace(" ", "T"),
                };
              }
              return p;
            });
            return { ...c, photos: updatedPhotos };
          }
          return c;
        });
        await saveLocalData(updatedDataWithServerId);
        console.log(
          "Updated photo metadata saved locally with server ID:",
          photoData.id
        );
      } else {
        console.log("API not reachable, photo will sync later");
      }
    } catch (error) {
      console.error("Failed to add photo:", error);
      console.error("Error details:", {
        canId: can.id,
        photoId: newPhoto.id,
        stack: error.stack,
      });
      throw error;
    }
  };

  const deletePhotoFromCan = async (can, photoId) => {
    try {
      console.log("Deleting photo:", photoId, "from can:", can.id);

      // Load existing data first
      const existingData = await loadLocalData();

      // Find the can and photo in the existing data
      const existingCan = existingData.find((c) => c.id === can.id);
      if (!existingCan) {
        console.error("Can not found:", can.id);
        return;
      }

      const photoToDelete = existingCan.photos.find((p) => p.id === photoId);
      if (!photoToDelete) {
        console.error("Photo not found:", photoId);
        return;
      }

      // Delete locally
      const updatedData = existingData.map((c) => {
        if (c.id === can.id) {
          c.removePhoto(photoId);
          return c;
        }
        return c;
      });
      await saveLocalData(updatedData);
      console.log("Photo removed from local storage");

      // If API is reachable, delete the photo from server immediately
      if (await pingAPI()) {
        console.log("API reachable, deleting photo from server");

        // Use the server ID if available, otherwise use the local ID
        const serverId = photoToDelete.id;
        console.log("Deleting photo from server with ID:", serverId);
        await deletePhoto(can.id, serverId);
        console.log("Photo deleted from server");

        // Update local data with fresh data from server
        const freshData = await loadRemoteData();
        await saveLocalData(freshData);
      } else {
        console.log("API not reachable, photo deletion will sync later");
      }
    } catch (error) {
      console.error("Failed to delete photo:", error);
      console.error("Error details:", {
        canId: can.id,
        photoId: photoId,
        stack: error.stack,
      });
      throw error;
    }
  };

  const getLatestCanData = async (canId) => {
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
    addCan,
    deleteCan,
    synchronize,
    changeApiUrl,
    getCurrentApiUrl,
    reachableApi,
    addPhotoToCan,
    deletePhotoFromCan,
    getLatestCanData,
  };
};
