import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import client, { API_BASE_URL } from '../api/client';
import * as FileSystem from 'expo-file-system';
import { getUnsyncedUsers, markUserSynced } from '../db/sqlite';

async function uploadUser(user) {
  const form = new FormData();
  Object.entries({
    firstName:user.firstName, lastName:user.lastName, email:user.email,
    mobileNumber:user.mobileNumber, birthDay:user.birthDay, gender:user.gender,
    userName:user.userName, password:user.password
  }).forEach(([k,v]) => form.append(k, String(v)));

  if (user.photoUri) {
    const info = await FileSystem.getInfoAsync(user.photoUri);
    form.append('photo', {
      uri: user.photoUri,
      name: 'profile.jpg',
      type: 'image/jpeg',
      size: info.size
    });
  }

  const res = await client.post('/api/users', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data; 
}

export default function useSync() {
  useEffect(() => {
    const sub = NetInfo.addEventListener(async state => {
      if (state.isConnected) {
        getUnsyncedUsers(async (err, users) => {
          if (err) return;
          for (const u of users) {
            try {
              const created = await uploadUser(u);
              markUserSynced(u.id, created._id);
            } catch {}
          }
        });
      }
    });
    return () => sub && sub();
  }, []);
}
