import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Swipeable, RectButton } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";

const SwipeableItem = ({ item, onDelete, refreshEvent }) => {
  const navigation = useNavigation();

  const renderRightActions = () => (
    <RectButton
      onPress={() => onDelete(item.id)}
      style={{
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "red",
        width: 80,
      }}
    >
      <Text style={{ color: "white", fontWeight: "bold" }}>Delete</Text>
    </RectButton>
  );

  return (
    <Swipeable renderRightActions={renderRightActions}>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("CanDetailsScreen", {
            can: item,
            onGoBack: () => {
              refreshEvent();
            },
          })
        }
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
        {item.sugarFree && <Text>Sugar Free</Text>}
        <Text>
          Created: {new Date(item.creationDate).toLocaleDateString("en-GB")}
        </Text>
      </TouchableOpacity>
    </Swipeable>
  );
};

export default SwipeableItem;
