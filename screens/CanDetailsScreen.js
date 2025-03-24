import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Text,
  SafeAreaView,
  Modal,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useSyncrhonizer } from "../hooks/useSyncrhonizer";

export const CanDetailsScreen = ({ route, navigation }) => {
  const { can, onGoBack } = route.params;
  const { addPhotoToCan, deletePhotoFromCan, getLatestCanData } =
    useSyncrhonizer();
  const [photos, setPhotos] = useState(can.photos || []);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setPhotos(can.photos || []);
  }, [can]);

  useEffect(() => {
    return () => {
      if (onGoBack) {
        onGoBack();
      }
    };
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please grant camera roll permissions to add photos"
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
    });

    if (!result.canceled) {
      setIsLoading(true);
      const newPhoto = {
        id: Date.now().toString(),
        uri: result.assets[0].uri,
        syncDate: null,
      };
      try {
        await addPhotoToCan(can, newPhoto);
        const updatedCan = await getLatestCanData(can.id);
        if (updatedCan) {
          setPhotos(updatedCan.photos);
        }
      } catch (error) {
        Alert.alert("Error", "Failed to add the photo");
        console.error("Failed to add photo:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const deletePhoto = (photoId) => {
    Alert.alert("Delete Photo", "Are you sure you want to delete this photo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setIsLoading(true);
          try {
            await deletePhotoFromCan(can, photoId);
            const updatedPhotos = photos.filter(
              (photo) => photo.id !== photoId
            );
            setPhotos(updatedPhotos);
          } catch (error) {
            Alert.alert("Error", "Failed to delete the photo");
            console.error("Failed to delete photo:", error);
          } finally {
            setIsLoading(false);
          }
        },
      },
    ]);
  };

  const enlargePhoto = (photo) => {
    setSelectedPhoto(photo);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: 40 }}>
      <View style={styles.container}>
        {/* Can Details Section */}
        <View style={styles.detailsContainer}>
          <Text style={styles.canName}>{can.name}</Text>
          <Text style={styles.detailText}>Volume: {can.cc} cc</Text>
          <Text style={styles.detailText}>Language: {can.lang}</Text>
          {can.sugarFree && <Text style={styles.detailText}>Sugar Free</Text>}
          <Text style={styles.detailText}>
            Created: {new Date(can.creationDate).toLocaleDateString("en-GB")}
          </Text>
          <Text style={styles.detailText}>
            Synced: {new Date(can.syncDate).toLocaleDateString("en-GB")}
          </Text>
        </View>

        {/* Photos Section */}
        <View style={styles.photosSection}>
          <Text style={styles.sectionTitle}>Photos</Text>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0000ff" />
            </View>
          ) : (
            <FlatList
              data={photos}
              numColumns={2}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.photoContainer}
                  onPress={() => enlargePhoto(item)}
                  onLongPress={() => deletePhoto(item.id)}
                >
                  <Image source={{ uri: item.uri }} style={styles.photo} />
                </TouchableOpacity>
              )}
            />
          )}
        </View>

        {/* Add Photo Button */}
        <TouchableOpacity
          style={[styles.addButton, isLoading && styles.disabledButton]}
          onPress={pickImage}
          disabled={isLoading}
        >
          <Text style={styles.addButtonText}>Add Photo</Text>
        </TouchableOpacity>

        {/* Photo Modal */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          >
            {selectedPhoto && (
              <Image
                source={{ uri: selectedPhoto.uri }}
                style={styles.enlargedPhoto}
                resizeMode="contain"
              />
            )}
          </TouchableOpacity>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  detailsContainer: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  canName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  detailText: {
    fontSize: 16,
    marginBottom: 5,
  },
  photosSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  photoContainer: {
    flex: 1,
    margin: 5,
  },
  photo: {
    width: "100%",
    height: 150,
    borderRadius: 8,
  },
  addButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#cccccc",
  },
  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  enlargedPhoto: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default CanDetailsScreen;
