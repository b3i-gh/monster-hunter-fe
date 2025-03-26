import React, { useState, useEffect } from "react";
import {
  View,
  Image,
  FlatList,
  TouchableOpacity,
  Alert,
  Text,
  SafeAreaView,
  Modal,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useSyncrhonizer } from "../hooks/useSyncrhonizer";
import {
  colors,
  typography,
  spacing,
  commonStyles,
  screenStyles,
} from "../styles/theme";

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
      quality: 0.7,
      exif: false,
      base64: false,
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

  const styles = screenStyles.canDetails;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Can Details Section */}
        <View style={styles.detailsContainer}>
          <Text style={styles.canName}>{can.name}</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Volume:</Text>
            <Text style={styles.detailValue}>{can.cc} cc</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Language:</Text>
            <Text style={styles.detailValue}>{can.lang}</Text>
          </View>
          {can.sugarFree && (
            <View style={styles.sugarFreeBadge}>
              <Text style={styles.sugarFreeText}>Sugar Free</Text>
            </View>
          )}
          <View style={styles.dateContainer}>
            <Text style={styles.dateLabel}>
              Created: {new Date(can.creationDate).toLocaleDateString("en-GB")}
            </Text>
            <Text style={styles.dateLabel}>
              Synced: {new Date(can.syncDate).toLocaleDateString("en-GB")}
            </Text>
          </View>
        </View>

        {/* Photos Section */}
        <View style={styles.photosSection}>
          <Text style={styles.sectionTitle}>Photos</Text>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
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
              contentContainerStyle={styles.photoGrid}
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

export default CanDetailsScreen;
