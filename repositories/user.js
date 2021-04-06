import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import {getUniqFileName} from '../utils/filename';
import RNFetchBlob from 'rn-fetch-blob';
import {addActivity} from './activity';
import {pushRemoteNotification} from '../services/notification';

export async function createUser({displayName, photoURL, uid, email}) {
  const docRef = firestore().collection('users').doc(uid);
  const doc = await docRef.get();
  if (!doc?.exists) {
    const photo = getUniqFileName('png');

    if (photoURL) {
      const fetchInfo = await RNFetchBlob.fetch('GET', photoURL);
      if (fetchInfo.info().status === 200) {
        await storage()
          .ref(uid)
          .child(photo)
          .putString(fetchInfo.base64(), 'base64');
      }
    } else {
      const data_string =
        'data:image/png;base64,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';
      await storage().ref(uid).child(photo).putString(data_string, 'data_url');
    }
    await docRef.set({
      displayName,
      photo,
      email,
      uid,
      isOnline: true,
      friends: [],
      lastLogin: firestore.FieldValue.serverTimestamp(),
    });
    return await getUser(uid);
  }
}

export async function updateUser({displayName, photo, uid, email}) {
  const docRef = firestore().collection('users').doc(uid);
  await docRef.set({displayName, photo, email});
  const photoURL = await storage().ref(uid).child(photo).getDownloadURL();
  const user = {displayName, photo, photoURL, email, uid};
  return user;
}

export async function searchUsers(keyword) {
  const querySnap = await firestore()
    .collection('users')
    .where('displayName', '>=', keyword)
    .where('displayName', '<=', keyword + '\uf8ff')
    .get();

  return await Promise.all(
    querySnap.docs.map(async doc => {
      const user = doc.data();
      user.uid = doc.id;
      user.photoURL = await storage()
        .ref(user.uid)
        .child(user.photo)
        .getDownloadURL();
      return user;
    }),
  );
}

export async function getUser(uid) {
  let user = null;
  if (user) return JSON.parse(user);
  const doc = await firestore().collection('users').doc(uid).get();
  if (!doc?.exists) return null;
  user = doc.data();
  user.uid = uid;
  user.photoURL = await storage().ref(uid).child(user.photo).getDownloadURL();
  return user;
}

export async function getAllUsers(uids) {
  const result = [];
  for (const uid of uids) {
    const user = await getUser(uid);
    result.push(user);
  }
  return result;
}

export async function requestAddFriend(uid, friendUid) {
  const target = await getUser(friendUid);
  if (target.isOnline) {
    await addActivity(
      uid,
      friendUid,
      'Request make friends',
      {type: 'add-friend'},
      true,
    );
  } else {
    const activity = await addActivity(
      uid,
      friendUid,
      'Request make friends',
      {type: 'add-friend'},
      false,
    );
    await pushRemoteNotification(target.tokens, 'Request make friends', {
      activity,
    });
  }
}

export async function addFriend(uid, friendUid) {
  await firestore()
    .collection('users')
    .doc(uid)
    .update({
      friends: firestore.FieldValue.arrayUnion(friendUid),
    });

  await firestore()
    .collection('users')
    .doc(friendUid)
    .update({
      friends: firestore.FieldValue.arrayUnion(uid),
    });
  await addActivity(uid, friendUid, 'Accepted make friends', {}, true);
  return true;
}

export async function unFriend(uid, friendUid) {
  await firestore()
    .collection('users')
    .doc(uid)
    .update({
      friends: firestore.FieldValue.arrayRemove(friendUid),
    });
  await firestore()
    .collection('users')
    .doc(friendUid)
    .update({
      friends: firestore.FieldValue.arrayRemove(uid),
    });
  return true;
}

export async function setUserStatus(uid, status) {
  if (status === 'online') {
    await firestore().collection('users').doc(uid).update({
      isOnline: true,
      lastLogin: firestore.FieldValue.serverTimestamp(),
    });
  } else {
    await firestore().collection('users').doc(uid).update({
      isOnline: false,
    });
  }
}

export async function updateFCMTokens(uid, token) {
  await firestore()
    .collection('users')
    .doc(uid)
    .update({
      tokens: firestore.FieldValue.arrayUnion(token),
    });
}
