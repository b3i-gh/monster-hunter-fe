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
import { useSyncrhonizer } from "../hooks/useSyncrhonizer.js";
import {
  colors,
  typography,
  spacing,
  commonStyles,
  screenStyles,
} from "../styles/theme";

export const EnergyDrinkListScreen = () => {
  const navigation = useNavigation();
  const styles = screenStyles.canList;
  const {
    deleteCan,
    synchronize,
    changeApiUrl,
    getCurrentApiUrl,
    reachableApi,
    addCan,
  } = useSyncrhonizer();
  const [canCollection, setCanCollection] = useState([]);
  const [displayedCans, setDisplayedCans] = useState([]);
  const [filter, setFilter] = useState("");
  const [tempApiUrl, setTempApiUrl] = useState("");
  const [currentApiUrl, setCurrentApiUrl] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const fetchCans = async () => {
      try {
        const cans = await synchronize();
        setCanCollection(cans);
        setCurrentApiUrl(getCurrentApiUrl());
      } catch (error) {
        console.error("Failed to fetch the items: ", error.message);
      }
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
    try {
      const cans = await synchronize();
      setCanCollection(cans);
    } catch (error) {
      console.error("Failed to refresh:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const clearFilter = () => {
    setFilter("");
  };

  const changeApiUrlEvent = () => {
    if (tempApiUrl) {
      Alert.alert("Change API URL", tempApiUrl, [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: () => {
            changeApiUrl(tempApiUrl);
            setCurrentApiUrl(tempApiUrl);
          },
        },
      ]);
    } else {
      Alert.alert("Change API URL", "Please enter a valid URL");
    }
  };

  const addCanEvent = () => {
    navigation.navigate("AddCanScreen", {
      onCanAdded: async (newCanData) => {
        await addCan(newCanData);
        refreshEvent();
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
      const up = await synchronize();
      setCanCollection(up);
    } catch (error) {
      console.error("Failed to delete can: ", error);
    }
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>
          Monster Hunter <Text style={styles.version}>v1.4.0</Text>
        </Text>
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

        {filter.toLowerCase() === "apiurl" ? (
          <View style={styles.apiSection}>
            <Text style={styles.apiUrl}>Current API URL:</Text>
            <Text style={styles.apiUrl}>{currentApiUrl}</Text>
            <TextInput
              placeholder="Insert new URL"
              placeholderTextColor={colors.text.secondary}
              style={styles.apiInput}
              value={tempApiUrl}
              onChangeText={setTempApiUrl}
            />
            <TouchableOpacity
              onPress={changeApiUrlEvent}
              style={styles.actionButton}
            >
              <Text style={styles.actionButtonText}>Change API URL</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.countText}>({displayedCans.length})</Text>
            {!reachableApi && <Text style={styles.offlineText}>Offline</Text>}
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
            <TouchableOpacity onPress={addCanEvent} style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Add New Item</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

export default EnergyDrinkListScreen;
