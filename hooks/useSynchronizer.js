const deletePhotoFromCan = async (can, photoId) => {
  try {
    console.log("Deleting photo:", photoId, "from can:", can.id);
    const existingData = await loadLocalData();
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
      await deletePhoto(can.id, photoId);
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
