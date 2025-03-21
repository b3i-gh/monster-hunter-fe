import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

export const AddCanScreen = ({ navigation, route }) => {
  // const APIURL = route.params.APIURL;
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
      style={{
        width: 24,
        height: 24,
        borderWidth: 2,
        borderColor: "#4CAF50",
        borderRadius: 4,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: value ? "#4CAF50" : "white",
      }}
    >
      {value && <Text style={{ color: "white" }}>✓</Text>}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: 40 }}>
      <View style={styles.container}>
        <Text style={styles.label}>Name:</Text>
        <TextInput
          style={styles.input}
          value={inputName}
          onChangeText={setInputName}
          placeholder="Enter name"
        />
        <Text style={styles.label}>Volume (cc):</Text>
        <TextInput
          style={styles.input}
          value={inputCC}
          onChangeText={setInputCC}
          placeholder="Enter volume"
          keyboardType="numeric"
        />
        <Text style={styles.label}>Language:</Text>
        <Picker
          selectedValue={inputLang}
          // style={styles.input}
          onValueChange={(itemValue) => setInputLang(itemValue)}
        >
          <Picker.Item label="IT" value="IT" />
          <Picker.Item label="EN" value="EN" />
          <Picker.Item label="DE" value="DE" />
          <Picker.Item label="FR" value="FR" />
          <Picker.Item label="ES" value="ES" />
          <Picker.Item label="SI" value="SI" />
          <Picker.Item label="PL" value="PL" />
        </Picker>

        <View style={styles.checkboxContainer}>
          <CustomCheckbox
            value={inputSugarFree}
            onValueChange={setInputSugarFree}
          />
          <Text style={[styles.label, { marginLeft: 8 }]}>Sugar Free</Text>
        </View>
        <Button title="Add Can" onPress={addCanFormSubmit} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 20,
    paddingLeft: 10,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
});

export default AddCanScreen;
