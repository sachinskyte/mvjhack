// app/(tabs)/index.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  Button,
  TextInput,
  Alert,
  StyleSheet,
  ScrollView,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy'; // ← LEGACY = WORKING
import { uploadToIPFS, downloadFromIPFS } from '../../src/ipfs';

export default function HomeScreen() {
  const [cid, setCid] = useState<string>('');
  const [inputCid, setInputCid] = useState<string>('');

  const pickAndUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets) return;

      const file = result.assets[0];
      const fileUri = file.uri;

      // LEGACY API — FULLY SUPPORTED
      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const uploadedCid = await uploadToIPFS(base64, file.name);
      setCid(uploadedCid);
      Alert.alert('Uploaded!', `CID: ${uploadedCid}`);
    } catch (error: any) {
      Alert.alert('Upload Failed', error.message || 'Unknown error');
    }
  };

  const downloadFile = async () => {
    if (!inputCid.trim()) return Alert.alert('Error', 'Enter a CID');

    try {
      const arrayBuffer = await downloadFromIPFS(inputCid);
      Alert.alert('Downloaded!', `File size: ${arrayBuffer.byteLength} bytes`);
    } catch (error: any) {
      Alert.alert('Download Failed', error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Pandora's Vault IPFS</Text>

      <Button title="Pick File & Upload" onPress={pickAndUpload} />

      {cid ? (
        <View style={styles.cidBox}>
          <Text style={styles.cidLabel}>Your CID:</Text>
          <Text style={styles.cid}>{cid}</Text>
        </View>
      ) : null}

      <TextInput
        style={styles.input}
        placeholder="Paste CID to download"
        value={inputCid}
        onChangeText={setInputCid}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Button title="Download from CID" onPress={downloadFile} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
  cidBox: { margin: 20, padding: 15, backgroundColor: '#f0f0f0', borderRadius: 10 },
  cidLabel: { fontWeight: 'bold' },
  cid: { fontFamily: 'monospace', fontSize: 12, marginTop: 5 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, marginVertical: 15, borderRadius: 8 },
});