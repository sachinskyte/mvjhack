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

export const downloadFromIPFS = async (cid: string): Promise<string> => {
  // Clean CID - remove ALL whitespace (spaces, tabs, newlines, etc.)
  const cleanCid = cid.replace(/\s+/g, '').trim();
  
  if (!cleanCid) {
    throw new Error('Invalid CID: empty after cleaning');
  }
  
  console.log('Clean CID:', cleanCid);
  
  // Try multiple gateways for reliability (using most reliable ones)
  const gateways = [
    `https://${cleanCid}.ipfs.dweb.link`,  // Subdomain gateway - most reliable
    `https://dweb.link/ipfs/${cleanCid}`,
    `https://ipfs.filebase.io/ipfs/${cleanCid}`,
    `https://gateway.pinata.cloud/ipfs/${cleanCid}`,
    `https://cloudflare-ipfs.com/ipfs/${cleanCid}`,
  ];

  let lastError: Error | null = null;

  for (let i = 0; i < gateways.length; i++) {
    const url = gateways[i];
    try {
      console.log(`Trying gateway ${i + 1}/${gateways.length}:`, url);
      
      // Use fetch with blob for better memory handling
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': '*/*',
          'Cache-Control': 'no-cache',
        },
      });

      if (!response.ok) {
        const errorMsg = `HTTP ${response.status}: ${response.statusText}`;
        console.warn(`Gateway ${i + 1} failed -`, errorMsg);
        lastError = new Error(errorMsg);
        
        // If rate limited (429), wait a bit before trying next
        if (response.status === 429) {
          console.log('Rate limited, waiting 2 seconds...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        continue;
      }

      // Get as blob first, then convert to base64
      const blob = await response.blob();
      console.log('✓ Downloaded blob size:', blob.size, 'bytes');
      
      if (blob.size === 0) {
        throw new Error('Downloaded file is empty (0 bytes)');
      }
      
      // Convert blob to base64 using FileReader
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          // Remove data URL prefix if present
          const base64Data = base64String.split(',')[1] || base64String;
          resolve(base64Data);
        };
        reader.onerror = () => reject(new Error('FileReader error'));
        reader.readAsDataURL(blob);
      });
      
      console.log('✓ Conversion to base64 successful');
      return base64;
    } catch (error) {
      console.warn(`Gateway ${i + 1} error:`, (error as Error).message);
      lastError = error as Error;
      // Small delay before trying next gateway
      if (i < gateways.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      continue;
    }
  }

  throw lastError || new Error('All IPFS gateways failed');
};