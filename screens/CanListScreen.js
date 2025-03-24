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

export const EnergyDrinkListScreen = () => {
  const navigation = useNavigation();
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

  // the list of displayed cans is re-rendered every time some action is performed (addCan, deleteCan, refreshList) or the filter is changed
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
    <SafeAreaView style={{ flex: 1, paddingTop: 40 }}>
      <View style={{ flex: 1, alignItems: "center" }}>
        <Text style={{ fontSize: 40, fontWeight: "bold" }}>
          Monster Hunter <Text style={{ fontSize: 10 }}>v1.3.0</Text>
        </Text>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            borderColor: "gray",
            borderWidth: 1,
            margin: 10,
            paddingLeft: 10,
            width: "80%",
          }}
        >
          <TextInput
            style={{ flex: 1, height: 40 }}
            placeholder="Filter by name"
            value={filter}
            onChangeText={setFilter}
          />
          {filter.length > 0 && (
            <TouchableOpacity onPress={clearFilter} style={{ padding: 10 }}>
              <Text style={{ color: "blue" }}>X</Text>
            </TouchableOpacity>
          )}
        </View>

        {filter.toLowerCase() === "apiurl" ? (
          <View
            style={{
              marginTop: 40,
              width: "80%",
              flex: 1,
              alignItems: "center",
            }}
          >
            <Text>Current API URL:</Text>
            <Text>{currentApiUrl}</Text>
            <TextInput
              placeholder="Insert new URL"
              style={{
                flexDirection: "row",
                borderColor: "gray",
                borderWidth: 1,
                margin: 10,
                paddingLeft: 10,
                width: "100%",
              }}
              value={tempApiUrl}
              onChangeText={setTempApiUrl}
            ></TextInput>
            <TouchableOpacity
              onPress={() => changeApiUrlEvent()}
              style={{
                backgroundColor: "#4CAF50",
                padding: 10,
                borderRadius: 15,
                marginVertical: 10,
                width: "80%",
                alignItems: "center",
                elevation: 3,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
              }}
            >
              <Text
                style={{ color: "white", fontSize: 18, fontWeight: "bold" }}
              >
                Change API URL
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text>({displayedCans.length})</Text>
            {!reachableApi && <Text style={{ color: "red" }}>Offline</Text>}
            {refreshing ? (
              <ActivityIndicator size="large" color="#0000ff" />
            ) : (
              <FlatList
                style={{ width: "100%" }}
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
            <TouchableOpacity
              onPress={addCanEvent}
              style={{
                backgroundColor: "#4CAF50",
                padding: 15,
                borderRadius: 15,
                marginVertical: 10,
                width: "80%",
                alignItems: "center",
                elevation: 3,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
              }}
            >
              <Text
                style={{ color: "white", fontSize: 18, fontWeight: "bold" }}
              >
                Add New Item
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

export default EnergyDrinkListScreen;
