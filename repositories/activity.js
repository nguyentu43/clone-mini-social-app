import firestore from '@react-native-firebase/firestore';
import {getUser} from './user';

export async function getAllActivities(uid, limit = 25, startAfter) {
  let queryRef = firestore()
    .collection('activities')
    .orderBy('createdAt', 'desc')
    .where('target', '==', uid);

  if (startAfter) queryRef = queryRef.startAfter(startAfter.createdAt);

  const querySnap = await queryRef.limit(limit).get();

  return await Promise.all(
    querySnap.docs.map(async doc => {
      const activity = doc.data();
      activity.id = doc.id;
      activity.source = await getUser(activity.source);
      return activity;
    }),
  );
}

export async function setReadActivity(id) {
  await firestore().collection('activities').doc(id).update({hasRead: true});
}

export async function addActivity(source, target, message, data, local = true) {
  const docRef = await firestore().collection('activities').add({
    source,
    target,
    hasRead: false,
    data,
    message,
    local,
    createdAt: firestore.FieldValue.serverTimestamp(),
  });
  return {
    ...(await docRef.get()).data(),
    id: docRef.id,
  };
}

export async function removeActivity(id) {
  await firestore().collection('activities').doc(id).delete();
}

export async function setReadActivitiesConversation(conversationId, targetUid) {
  const querySnap = await firestore()
    .collection('activities')
    .where('target', '==', targetUid)
    .where('data.type', '==', 'conversation')
    .where('data.id', '==', conversationId)
    .get();

  for (const {id} of querySnap.docs) {
    await setReadActivity(id);
  }
}
