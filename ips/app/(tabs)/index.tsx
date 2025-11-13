// app/(tabs)/index.tsx
import * as Clipboard from 'expo-clipboard';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy'; // ← LEGACY = WORKING
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { downloadFromIPFS, uploadToIPFS } from '../../src/ipfs';

export default function HomeScreen() {
  const [cid, setCid] = useState<string>('');
  const [inputCid, setInputCid] = useState<string>('');
  const [downloadedData, setDownloadedData] = useState<string>('');
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [textInput, setTextInput] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);

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

  const copyCid = async () => {
    if (cid) {
      await Clipboard.setStringAsync(cid);
      Alert.alert('Copied!', 'CID copied to clipboard');
    }
  };

  const uploadText = async () => {
    if (!textInput.trim()) {
      return Alert.alert('Error', 'Please enter some text or key to upload');
    }

    try {
      setIsUploading(true);
      
      // Convert text to base64
      const base64 = btoa(unescape(encodeURIComponent(textInput)));
      
      const uploadedCid = await uploadToIPFS(base64, 'text_data.txt');
      setCid(uploadedCid);
      setTextInput(''); // Clear input after upload
      Alert.alert('✅ Text Uploaded!', `CID: ${uploadedCid}\n\nYou can now use this CID to retrieve your text.`);
    } catch (error: any) {
      Alert.alert('Upload Failed', error.message || 'Unknown error');
    } finally {
      setIsUploading(false);
    }
  };

  const downloadFile = async () => {
    const cleanedCid = inputCid.replace(/\s+/g, '').trim();
    
    if (!cleanedCid) {
      return Alert.alert('Error', 'Please enter a valid CID');
    }

    try {
      setIsDownloading(true);
      setDownloadedData('');
      
      console.log('Starting download for CID:', cleanedCid);
      
      // Download directly as base64
      const base64Data = await downloadFromIPFS(cleanedCid);
      console.log('Downloaded base64 length:', base64Data.length);
      
      if (!base64Data || base64Data.length === 0) {
        throw new Error('Downloaded file is empty');
      }
      
      // First, try to decode as text
      let decodedText = '';
      let isValidText = false;
      
      try {
        // Decode base64 to text
        const binaryString = atob(base64Data);
        decodedText = decodeURIComponent(escape(binaryString));
        
        // Check if it's valid text (not binary garbage)
        const sample = decodedText.substring(0, 500);
        const isPrintable = /^[\x20-\x7E\s\n\r\t]*$/.test(sample) || 
                           /[\u0080-\uFFFF]/.test(sample); // Allow Unicode
        
        // Consider it text if mostly printable and reasonable size
        if (isPrintable && decodedText.length < 1000000) { // < 1MB treated as text
          isValidText = true;
          console.log('Content detected as text, displaying on screen');
        }
      } catch (decodeError) {
        console.log('Cannot decode as text, treating as binary file');
      }
      
      if (isValidText && decodedText) {
        // TEXT/KEY MODE: Display on screen without saving
        setDownloadedData(decodedText);
        
        const sizeBytes = new Blob([decodedText]).size;
        Alert.alert(
          '✅ Text Retrieved!', 
          `CID: ${cleanedCid.substring(0, 30)}...\n\nSize: ${sizeBytes} bytes\n\nText displayed below (not saved to device).`
        );
      } else {
        // BINARY FILE MODE: Save to device storage
        const timestamp = Date.now();
        const fileName = `ipfs_${cleanedCid.substring(0, 12)}_${timestamp}`;
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;
        
        console.log('Binary file detected, saving to device storage:', fileUri);
        
        // Write file to device permanent storage
        await FileSystem.writeAsStringAsync(fileUri, base64Data, {
          encoding: FileSystem.EncodingType.Base64,
        });
        
        console.log('File saved successfully to device memory');
        
        // Verify file was saved
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        if (!fileInfo.exists) {
          throw new Error('File was not saved properly');
        }
        
        console.log('File verified, size on disk:', fileInfo.size, 'bytes');
        
        const sizeKB = (fileInfo.size / 1024).toFixed(2);
        setDownloadedData(
          `✅ Binary file downloaded successfully\n\n` +
          `CID: ${cleanedCid}\n` +
          `Size: ${fileInfo.size} bytes (${sizeKB} KB)\n\n` +
          `Location: ${fileUri}\n\n` +
          `The file is saved permanently in device storage.`
        );
        Alert.alert(
          '✅ Downloaded Successfully!', 
          `Binary file saved\n\nSize: ${sizeKB} KB\nLocation: Device Storage`
        );
      }
    } catch (error: any) {
      console.error('Download error:', error);
      const errorMsg = error.message || 'Unknown error occurred';
      Alert.alert(
        '❌ Download Failed', 
        `Error: ${errorMsg}\n\nPlease check:\n• CID is correct\n• Internet connection\n• File exists on IPFS`
      );
      setDownloadedData(`Error: ${errorMsg}`);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Pandora's Vault IPFS</Text>

      <Button title="📁 Pick File & Upload" onPress={pickAndUpload} />

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>Upload Text or Key</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Enter text, key, or any data to upload to IPFS..."
        value={textInput}
        onChangeText={setTextInput}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
      />
      <Button 
        title={isUploading ? "Uploading..." : "📝 Upload Text"} 
        onPress={uploadText}
        disabled={isUploading || !textInput.trim()}
      />

      {cid ? (
        <View style={styles.cidBox}>
          <Text style={styles.cidLabel}>Your CID:</Text>
          <Text style={styles.cid}>{cid}</Text>
          <TouchableOpacity style={styles.copyButton} onPress={copyCid}>
            <Text style={styles.copyButtonText}>📋 Copy CID</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.divider} />

      <Text style={styles.sectionTitle}>Download from IPFS</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Paste CID to download"
        value={inputCid}
        onChangeText={setInputCid}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Button 
        title={isDownloading ? "Downloading..." : "Download from CID"} 
        onPress={downloadFile}
        disabled={isDownloading}
      />

      {isDownloading && (
        <ActivityIndicator size="large" color="#0a7ea4" style={styles.loader} />
      )}

      {downloadedData ? (
        <View style={styles.dataBox}>
          <Text style={styles.dataLabel}>Downloaded Data:</Text>
          <ScrollView style={styles.dataScroll} nestedScrollEnabled>
            <Text style={styles.dataText}>{downloadedData}</Text>
          </ScrollView>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
  cidBox: { margin: 20, padding: 15, backgroundColor: '#f0f0f0', borderRadius: 10 },
  cidLabel: { fontWeight: 'bold' },
  cid: { fontFamily: 'monospace', fontSize: 12, marginTop: 5 },
  copyButton: {
    marginTop: 10,
    backgroundColor: '#0a7ea4',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  copyButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  divider: { height: 1, backgroundColor: '#ddd', marginVertical: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, marginVertical: 15, borderRadius: 8 },
  textArea: { 
    minHeight: 100, 
    maxHeight: 150,
  },
  loader: { marginTop: 20 },
  dataBox: { 
    marginTop: 20, 
    padding: 15, 
    backgroundColor: '#e8f4f8', 
    borderRadius: 10,
    maxHeight: 300,
  },
  dataLabel: { fontWeight: 'bold', marginBottom: 10, fontSize: 16 },
  dataScroll: { maxHeight: 250 },
  dataText: { 
    fontFamily: 'monospace', 
    fontSize: 12, 
    lineHeight: 18,
  },
});