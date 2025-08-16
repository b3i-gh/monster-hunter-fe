import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import SwipeableItem from "../components/SwipeableItem.js";
import { useLocalDataStorage } from "../hooks/useLocalDataStorage.js";
import { colors, screenStyles, canListActionRow } from "../styles/theme";
import { exportBackup, importBackup } from "../utils/backup";
import { Ionicons } from "@expo/vector-icons"; // Add this import for icons

export const EnergyDrinkListScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const { loadLocalData, addCan, deleteCan, saveLocalData } =
    useLocalDataStorage();
  const [canCollection, setCanCollection] = useState([]);
  const navigation = useNavigation();
  const styles = screenStyles.canList;
  const [displayedCans, setDisplayedCans] = useState([]);
  const [filter, setFilter] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchCans = async () => {
      refreshEvent();
    };
    fetchCans();
  }, []);

  useEffect(() => {
    const renderCanList = async () => {
      const filteredCans = applyFilter();
      setDisplayedCans(filteredCans);
    };
    renderCanList();
  }, [filter, canCollection]);

  const applyFilter = () => {
    let filteredCans = canCollection;
    if (canCollection) {
      filteredCans = canCollection.filter(
        (can) =>
          !can.deleted && can.name.toLowerCase().includes(filter.toLowerCase())
      );
      filteredCans.sort((a, b) => a.name.localeCompare(b.name));
    }
    return filteredCans;
  };

  const refreshEvent = async () => {
    setRefreshing(true);
    const refreshCanList = async () => {
      try {
        setCanCollection(await loadLocalData());
      } catch (error) {
        console.error("Failed to fetch the items: ", error.message);
      } finally {
        setRefreshing(false);
      }
    };
    refreshCanList();
  };

  const clearFilter = () => {
    setFilter("");
  };

  const addCanEvent = async () => {
    navigation.navigate("AddCanScreen", {
      onCanAdded: async (newCanData) => {
        await addCan(newCanData);
        await refreshEvent();
      },
    });
  };

  const deleteCanEvent = async (can) => {
    const confirmDelete = await new Promise((resolve) => {
      Alert.alert(
        "Confirm Delete",
        "Are you sure you want to delete this item?",
        [
          { text: "Cancel", onPress: () => resolve(false), style: "cancel" },
          {
            text: "Delete",
            onPress: () => resolve(true),
            style: "destructive",
          },
        ]
      );
    });
    if (!confirmDelete) return;
    try {
      setRefreshing(true);
      await deleteCan(can);
      setCanCollection(await loadLocalData());
    } catch (error) {
      console.error("Failed to delete can: ", error);
    }
    setRefreshing(false);
  };

  const handleExportBackup = async () => {
    setIsProcessing(true);
    try {
      await exportBackup();
    } catch (e) {
      alert("Errore durante l'export: " + e.message);
    }
    setIsProcessing(false);
  };

  const handleImportBackup = async () => {
    setIsProcessing(true);
    try {
      await importBackup();
      await refreshEvent();
    } catch (e) {
      alert("Errore durante l'import: " + e.message);
    }
    setIsProcessing(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Title */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "flex-start",
          }}
        >
          <Text style={styles.title}>
            Monster Hunter <Text style={styles.version}>v2.0.0</Text>
          </Text>
        </View>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Filter by name"
            placeholderTextColor={colors.text.secondary}
            value={filter}
            onChangeText={setFilter}
          />
          {filter.length > 0 && (
            <TouchableOpacity onPress={clearFilter} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>X</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.countText}>({displayedCans.length})</Text>
        {refreshing ? (
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={styles.loadingIndicator}
          />
        ) : (
          <FlatList
            style={styles.listContainer}
            data={displayedCans}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <SwipeableItem
                item={item}
                onDelete={() => deleteCanEvent(item)}
                refreshEvent={refreshEvent}
              />
            )}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={refreshEvent}
              />
            }
          />
        )}
        {/* Action Buttons Row */}
        <View style={canListActionRow}>
          <TouchableOpacity onPress={addCanEvent} style={[styles.actionButton]}>
            <Ionicons name="add-circle-outline" size={20} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleExportBackup}
            style={[styles.actionButton]}
          >
            <Ionicons name="cloud-upload-outline" size={20} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleImportBackup}
            style={[styles.actionButton]}
          >
            <Ionicons name="cloud-download-outline" size={20} />
          </TouchableOpacity>
        </View>
        {isProcessing && (
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={{ marginVertical: 16 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default EnergyDrinkListScreen;
