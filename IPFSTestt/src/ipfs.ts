// src/ipfs.ts
// FINAL PINATA UPLOAD/DOWNLOAD — FULLY COMPATIBLE WITH EXPO + TS

const PINATA_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJhN2Y4MGQ3Ny1kMTgwLTQxODYtYTdmNC00NGNlYjZkZmJlYTYiLCJlbWFpbCI6InByYWFqd2FsLjA1QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiI5ODdjY2ZiZDcyMjNkOTEzNTY0NiIsInNjb3BlZEtleVNlY3JldCI6IjU1ZDAyOTZhNTAwYzAxY2RjMTE3ZjNjODVmNjRiODEzNjYwZTAwZjZjOTZjYWM5YmNkYzllYmNlZTFmYmIwYTciLCJleHAiOjE3OTQ1NzU3OTF9.tsq_jFQs9dwtw6kUmG2ID6EDtyGPtI-BL137u4xBKxk';

interface PinataResponse {
  IpfsHash?: string;
  PinSize?: number;
  Timestamp?: string;
  error?: {
    reason?: string;
    details?: string;
  };
}

export const uploadToIPFS = async (
  base64String: string,
  filename: string = 'document.pdf'
): Promise<string> => {
  try {
    const formData = new FormData();

    const filePayload: any = {
      uri: `data:application/octet-stream;base64,${base64String}`,
      name: filename,
      type: 'application/octet-stream',
    };

    formData.append('file', filePayload);
    formData.append('pinataMetadata', JSON.stringify({ name: filename }));

    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: formData,
    });

    const json = (await response.json()) as PinataResponse;

    if (response.ok && json.IpfsHash) {
      console.log('Pinata Upload Success → CID:', json.IpfsHash);
      return json.IpfsHash;
    } else {
      const errorMsg = json.error?.reason || json.error?.details || 'Upload failed';
      console.error('Pinata Error:', json);
      throw new Error(errorMsg);
    }
  } catch (error) {
    console.error('Pinata Upload Failed:', error);
    throw error;
  }
};

export const downloadFromIPFS = async (cid: string): Promise<ArrayBuffer> => {
  try {
    const url = `https://gateway.pinata.cloud/ipfs/${cid}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`File not found: ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    console.log('Download Success → Size:', arrayBuffer.byteLength, 'bytes');
    return arrayBuffer;
  } catch (error) {
    console.error('Download Failed:', error);
    throw error;
  }
};