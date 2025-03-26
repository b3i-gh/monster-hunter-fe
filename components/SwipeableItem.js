import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Swipeable, RectButton } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import {
  colors,
  typography,
  spacing,
  commonStyles,
  screenStyles,
} from "../styles/theme";

const SwipeableItem = ({ item, onDelete, refreshEvent }) => {
  const navigation = useNavigation();
  const styles = screenStyles.swipeableItem;

  const renderRightActions = () => (
    <RectButton onPress={() => onDelete(item.id)} style={styles.deleteButton}>
      <Text style={styles.deleteButtonText}>Delete</Text>
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
        style={[styles.container, styles.leftBorder(item.sugarFree)]}
      >
        <Text style={styles.title}>{item.name}</Text>
        <View style={styles.contentRow}>
          <View style={styles.contentContainer}>
            <Text style={styles.detailText}>Volume: {item.cc} cc</Text>
            <Text style={styles.detailText}>Language: {item.lang}</Text>
            <Text style={styles.dateText}>
              Created: {new Date(item.creationDate).toLocaleDateString("en-GB")}
            </Text>
            {item.sugarFree && (
              <View style={styles.sugarFreeBadge}>
                <Text style={styles.sugarFreeText}>Sugar Free</Text>
              </View>
            )}
          </View>
          {item.photos && item.photos.length > 0 && (
            <View style={styles.thumbnailContainer}>
              <Image
                source={{ uri: item.photos[0].uri }}
                style={styles.thumbnail}
              />
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
};

export default SwipeableItem;
