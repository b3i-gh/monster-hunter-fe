import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import {
  colors,
  typography,
  spacing,
  commonStyles,
  screenStyles,
} from "../styles/theme";

export const AddCanScreen = ({ navigation, route }) => {
  const [inputName, setInputName] = useState("");
  const [inputCC, setInputCC] = useState("");
  const [inputLang, setInputLang] = useState("IT");
  const [inputSugarFree, setInputSugarFree] = useState(false);

  const addCanFormSubmit = async () => {
    if (!inputName || !inputCC || !inputLang) {
      Alert.alert("Validation Error", "All fields are mandatory.");
      return;
    }

    const newCanData = {
      name: inputName,
      cc: inputCC,
      lang: inputLang,
      sugarFree: inputSugarFree,
    };

    try {
      await route.params.onCanAdded(newCanData);
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to add the can");
      console.error("Failed to add can:", error);
    }
  };

  const CustomCheckbox = ({ value, onValueChange }) => (
    <TouchableOpacity
      onPress={() => onValueChange(!value)}
      style={[
        screenStyles.addCan.checkbox,
        value
          ? screenStyles.addCan.checkboxChecked
          : screenStyles.addCan.checkboxUnchecked,
      ]}
    >
      {value && <Text style={screenStyles.addCan.checkboxCheckmark}>✓</Text>}
    </TouchableOpacity>
  );

  const styles = screenStyles.addCan;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.label}>Name:</Text>
        <TextInput
          style={styles.input}
          value={inputName}
          onChangeText={setInputName}
          placeholder="Enter name"
          placeholderTextColor={colors.text.secondary}
        />
        <Text style={styles.label}>Volume (cc):</Text>
        <TextInput
          style={styles.input}
          value={inputCC}
          onChangeText={setInputCC}
          placeholder="Enter volume"
          placeholderTextColor={colors.text.secondary}
          keyboardType="numeric"
        />
        <Text style={styles.label}>Language:</Text>
        <View style={styles.input}>
          <Picker
            selectedValue={inputLang}
            onValueChange={(itemValue) => setInputLang(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="IT" value="IT" />
            <Picker.Item label="EN" value="EN" />
            <Picker.Item label="DE" value="DE" />
            <Picker.Item label="FR" value="FR" />
            <Picker.Item label="ES" value="ES" />
            <Picker.Item label="SI" value="SI" />
            <Picker.Item label="PL" value="PL" />
            <Picker.Item label="NL" value="NL" />
          </Picker>
        </View>

        <View style={styles.checkboxContainer}>
          <CustomCheckbox
            value={inputSugarFree}
            onValueChange={setInputSugarFree}
          />
          <Text style={styles.checkboxText}>Sugar Free</Text>
        </View>
        <Button
          title="Add Can"
          onPress={addCanFormSubmit}
          color={colors.primary}
        />
      </View>
    </SafeAreaView>
  );
};

export default AddCanScreen;
