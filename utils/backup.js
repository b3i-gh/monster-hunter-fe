import * as FileSystem from "expo-file-system";
import JSZip from "jszip";
import * as Sharing from "expo-sharing";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";

export async function exportBackup() {
  try {
    // 1. Get local data
    const jsonData = await AsyncStorage.getItem("@localCanList");
    if (!jsonData) throw new Error("No data to backup");

    // 2. Parse cans and collect all photo files by can
    const cans = JSON.parse(jsonData);
    const photoDir = `${FileSystem.documentDirectory}can_photos/`;
    const zip = JSZip();
    zip.file("backup.json", jsonData);

    // DEBUG: Count photos
    let totalPhotos = 0;

    for (const can of cans) {
      if (can.photos && Array.isArray(can.photos)) {
        for (const photo of can.photos) {
          if (photo.uri && photo.uri.startsWith(photoDir)) {
            const fileInfo = await FileSystem.getInfoAsync(photo.uri);
            if (fileInfo.exists) {
              const filename = photo.uri.replace(photoDir, "");
              const canPhotoDir = `photos/${can.id}/`;
              const fileData = await FileSystem.readAsStringAsync(photo.uri, {
                encoding: FileSystem.EncodingType.Base64,
              });
              zip.file(`${canPhotoDir}${filename}`, fileData, { base64: true });
              totalPhotos++;
              console.log(
                `Added photo for can ${can.name} (${can.id}): ${filename}`
              );
            } else {
              console.warn(`Photo file not found: ${photo.uri}`);
            }
          } else {
            console.warn(
              `Photo URI not in app directory or missing: ${photo.uri}`
            );
          }
        }
      }
    }

    console.log(`Total photos added to zip: ${totalPhotos}`);

    // 3. Generate zip file
    const zipData = await zip.generateAsync({ type: "base64" });
    const zipPath = `${FileSystem.documentDirectory}backup.zip`;
    await FileSystem.writeAsStringAsync(zipPath, zipData, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // 4. Share or download
    await Sharing.shareAsync(zipPath);

    return zipPath;
  } catch (e) {
    throw new Error("Backup failed: " + e.message);
  }
}

export async function importBackup() {
  try {
    // 1. Pick zip file
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/zip",
    });
    if (result.type !== "success") return;

    const zipUri = result.uri;
    const zipData = await FileSystem.readAsStringAsync(zipUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // 2. Unzip
    const zip = await JSZip.loadAsync(zipData, { base64: true });
    const jsonFile = zip.file("backup.json");
    if (!jsonFile) throw new Error("No backup.json found in zip");

    // 3. Clear current data
    await AsyncStorage.removeItem("@localCanList");

    // 4. Restore JSON data
    const jsonData = await jsonFile.async("string");
    await AsyncStorage.setItem("@localCanList", jsonData);

    // 5. Restore photos for each can
    const cans = JSON.parse(jsonData);
    const photoDir = `${FileSystem.documentDirectory}can_photos/`;
    await FileSystem.makeDirectoryAsync(photoDir, { intermediates: true });

    for (const can of cans) {
      const canPhotoDir = `photos/${can.id}/`;
      const canPhotoFiles = zip
        .folder(canPhotoDir)
        .filter((relativePath, file) => !file.dir);
      for (const file of canPhotoFiles) {
        const fileData = await zip.file(file.name).async("base64");
        const filename = file.name.split("/").pop();
        const destPath = photoDir + filename;
        await FileSystem.writeAsStringAsync(destPath, fileData, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }
    }
  } catch (e) {
    throw new Error("Restore failed: " + e.message);
  }
}
