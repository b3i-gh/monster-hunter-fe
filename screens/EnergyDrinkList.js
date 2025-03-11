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
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import useFetchCans from "../hooks/useFetchCans";
import SwipeableItem from "../components/SwipeableItem";

const DEFAULT_API_URL = "http://192.168.1.52:8080/api/v1/cans";

const EnergyDrinkList = () => {
  const [APIURL, setAPIURL] = useState(DEFAULT_API_URL);
  const {fetchedCans, loading, refreshing, fetchCans} = useFetchCans(APIURL);
  const [displayedCans, setDisplayedCans] = useState([]);
  const [filter, setFilter] = useState("");
  const navigation = useNavigation();
  const [tempAPIURL, setTempAPIURL] = useState("");

  useEffect(() => {
    const filteredCans = fetchedCans.filter((can) =>
      can.name.toLowerCase().includes(filter.toLowerCase())
    );
    setDisplayedCans(filteredCans);
  }, [filter, fetchedCans]);

  const clearFilter = () => {
    setFilter("");
  };

  const addCan = () => {
    navigation.navigate("AddCan", {
      onCanAdded: fetchCans,
      APIURL: APIURL,
    });
  };

  const changeAPIURL = () => {
    if (tempAPIURL) {
      Alert.alert("Change API URL", tempAPIURL, [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: () => {
            setAPIURL(tempAPIURL);
          },
        },
      ]);
    } else {
      Alert.alert("Change API URL", "Please enter a valid URL");
    }
  };

  const deleteCan = async (id) => {
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
      await fetch(`${APIURL}/${id}`, {
        method: "DELETE",
      });
      await fetchCans();
    } catch (error) {
      console.error("Failed to delete can: ", error);
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, paddingTop: 40 }}>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={{ fontSize: 40, fontWeight: "bold" }}>
            Monster Hunter <Text style={{ fontSize: 10 }}>v1.1.0</Text>
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
            <>
              <Text style={{ marginTop: 100 }}>Current API URL: {APIURL}</Text>
              <TextInput
                placeholder="Insert new URL"
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  borderColor: "gray",
                  borderWidth: 1,
                  margin: 10,
                  paddingLeft: 10,
                  width: "80%",
                }}
                value={tempAPIURL}
                onChangeText={setTempAPIURL}
              ></TextInput>
              <TouchableOpacity
                onPress={() => changeAPIURL()}
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
            </>
          ) : (
            <>
              <Text>({displayedCans.length})</Text>

              {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
              ) : (
                <FlatList
                  style={{ width: "100%" }}
                  data={displayedCans}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <SwipeableItem item={item} onDelete={deleteCan} />
                  )}
                  showsVerticalScrollIndicator={false}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={fetchCans}
                    />
                  }
                />
              )}
              <TouchableOpacity
                onPress={addCan}
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
    </GestureHandlerRootView>
  );
};

export default EnergyDrinkList;
