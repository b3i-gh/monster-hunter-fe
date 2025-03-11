import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  SafeAreaView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

const AddCanScreen = ({ navigation, route }) => {
  const APIURL = route.params.APIURL;
  const [name, setName] = useState("");
  const [cc, setCc] = useState("");
  const [lang, setLang] = useState("IT");

  const addCan = async () => {
    if (!name || !cc || !lang) {
      Alert.alert("Validation Error", "All fields are mandatory.");
      return;
    }
    try {
      await fetch(APIURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          cc: parseInt(cc),
          lang,
          creationDate: new Date().toISOString().split("T")[0],
        }),
      });
      route.params.onCanAdded();
      navigation.goBack();
    } catch (error) {
      console.error("Failed to add can: ", error);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, paddingTop: 40 }}>
      <View style={styles.container}>
        <Text style={styles.label}>Name:</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter name"
        />
        <Text style={styles.label}>Volume (cc):</Text>
        <TextInput
          style={styles.input}
          value={cc}
          onChangeText={setCc}
          placeholder="Enter volume"
          keyboardType="numeric"
        />
        <Text style={styles.label}>Language:</Text>
        <Picker
          selectedValue={lang}
          // style={styles.input}
          onValueChange={(itemValue) => setLang(itemValue)}
        >
          <Picker.Item label="IT" value="IT" />
          <Picker.Item label="EN" value="EN" />
          <Picker.Item label="DE" value="DE" />
          <Picker.Item label="FR" value="FR" />
          <Picker.Item label="ES" value="ES" />
          <Picker.Item label="SI" value="SI" />
          <Picker.Item label="PL" value="PL" />
        </Picker>
        <Button title="Add Can" onPress={addCan} />
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
});

export default AddCanScreen;
