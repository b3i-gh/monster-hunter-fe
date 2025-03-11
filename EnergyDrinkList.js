import React, { useEffect, useState } from "react";
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
import {
  Swipeable,
  GestureHandlerRootView,
} from "react-native-gesture-handler";

const DEFAULT_API_URL = "http://192.168.1.52:8080/api/v1/cans";

const EnergyDrinkList = () => {
  const [fetchedCans, setFetchedCans] = useState([]);
  const [displayedCans, setDisplayedCans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("");
  const [APIURL, setAPIURL] = useState(DEFAULT_API_URL);
  const [newAPIURL, setNewAPIURL] = useState("");

  useEffect(() => {
    fetchCans();
  }, []);

  const changeAPIURL = () => {
    if (newAPIURL) {
      Alert.alert("Change API URL", newAPIURL, [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "OK",
          onPress: () => {
            setAPIURL(newAPIURL);
          },
        },
      ]);
    } else {
      Alert.alert("Change API URL", "Please enter a valid URL");
    }
  };

  const fetchCans = async (isRefreshing = false) => {
    if (isRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await fetch(APIURL);
      const data = await response.json();
      setFetchedCans(data);
      setDisplayedCans(data);
    } catch (error) {
      console.error("Failed to fetch cans: ", error);
      Alert.alert(error.message);
    } finally {
      if (isRefreshing) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  const onRefresh = () => {
    fetchCans(true);
    setFilter("");
  };

  useEffect(() => {
    const filteredCans = fetchedCans.filter((can) =>
      can.name.toLowerCase().includes(filter.toLowerCase())
    );
    setDisplayedCans(filteredCans);
  }, [filter, fetchedCans]);

  const clearFilter = () => {
    setFilter("");
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
    console.log("Delete can with id: ", id);
    try {
      await fetch(`${APIURL}/${id}`, {
        method: "DELETE",
      });
      setFetchedCans(fetchedCans.filter((can) => can.id !== id));
      setDisplayedCans(displayedCans.filter((can) => can.id !== id));
    } catch (error) {
      console.error("Failed to delete can: ", error);
    }
  };

  const renderRightActions = (id) => (
    <TouchableOpacity
      onPress={() => deleteCan(id)}
      style={{
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f66",
        width: 80,
      }}
    >
      <Text style={{ color: "white", fontWeight: "bold" }}>Delete</Text>
    </TouchableOpacity>
  );

  const renderItem = ({ item }) => (
    <Swipeable renderRightActions={() => renderRightActions(item.id)}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          padding: 5,
          margin: 5,
          backgroundColor: "#f0f0f0",
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "bold" }}>{item.name}</Text>
        <Text>Volume: {item.cc} cc</Text>
        <Text>Language: {item.lang}</Text>
        <Text>
          Created: {new Date(item.creationDate).toLocaleDateString("en-GB")}
        </Text>
      </View>
    </Swipeable>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1, paddingTop: 40 }}>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={{ fontSize: 40, fontWeight: "bold" }}>
            Monster Hunter <Text style={{ fontSize: 10 }}>v1.0.0</Text>
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
                value={newAPIURL}
                onChangeText={setNewAPIURL}
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
                  renderItem={renderItem}
                  showsVerticalScrollIndicator={false}
                  refreshControl={
                    <RefreshControl
                      refreshing={refreshing}
                      onRefresh={onRefresh}
                    />
                  }
                />
              )}
            </>
          )}
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

export default EnergyDrinkList;
