import storage from '@react-native-firebase/storage';
import {getUniqFileName, getExt} from '../utils/filename';

export async function uploadFile(uid, uri, oldFile = '') {
  const ext = getExt(uri);
  const filename = getUniqFileName(ext);
  await storage().ref(uid).child(filename).putFile(uri);
  if (oldFile) await storage().ref(uid).child(oldFile).delete();
  return {
    filename,
    uri: await storage().ref(uid).child(filename).getDownloadURL(),
  };
}

export async function deleteFile(uid, filename) {
  try {
    await storage().ref(uid).child(filename).delete();
  } catch (e) {
    console.log('file not found');
    return false;
  }
  return true;
}

export async function getUrl(uid, filename) {
  try {
    return await storage().ref(uid).child(filename).getDownloadURL();
  } catch (e) {
    console.log('file not found');
    return false;
  }
}

export async function getAllPhotos(uid, pageToken = null) {
  const list = await storage().ref(uid).list({pageToken});
  const photos = await Promise.all(
    list.items.map(async item => ({
      uri: await storage().ref(item.fullPath).getDownloadURL(),
      filename: item.fullPath.replace(uid + '/', ''),
    })),
  );
  return {
    pageToken: list.nextPageToken,
    items: photos,
  };
}
