import firestore from '@react-native-firebase/firestore';
import {pushRemoteNotification} from '../services/notification';
import {addActivity} from './activity';
import {getUser} from './user';

export async function getConversationFromDoc(doc) {
  if (!doc?.exists) return null;
  const conversation = doc.data();
  conversation.id = doc.id;
  conversation.participants = await Promise.all(
    conversation.participants.map(async p => await getUser(p)),
  );
  return conversation;
}

export async function getAllConversations(uid, limit = 25, startAfter) {
  let queryRef = firestore()
    .collection('conversations')
    .orderBy('lastMessageAt', 'desc')
    .where('participants', 'array-contains', uid);

  if (startAfter) queryRef = queryRef.startAfter(startAfter.lastMessageAt);
  const querySnap = await queryRef.limit(limit).get();
  return await Promise.all(
    querySnap.docs.map(async doc => {
      return await getConversationFromDoc(doc);
    }),
  );
}

export async function getConversation(id) {
  const doc = await firestore().collection('conversations').doc(id).get();
  return await getConversationFromDoc(doc);
}

export async function addConversation(owner, participants, title) {
  const docSnap = await firestore()
    .collection('conversations')
    .add({
      owner,
      participants: participants.concat(owner),
      title,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
  const conversation = (await docSnap.get()).data();
  conversation.id = docSnap.id;
  return conversation;
}

export async function updateTitleConversation(id, title) {
  await firestore().collection('conversations').doc(id).update({title});
}

export async function removeConversation(id) {
  await firestore().collection('conversations').doc(id).delete();
}

export async function addMessage(conversation, owner, content) {
  const docSnap = await firestore()
    .collection('conversations')
    .doc(conversation.id)
    .collection('messages')
    .add({
      owner,
      content,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });
  await firestore().collection('conversations').doc(conversation.id).update({
    lastMessageAt: firestore.FieldValue.serverTimestamp(),
  });

  for (const p of conversation.participants) {
    if (p.uid !== owner) {
      const target = await getUser(p.uid);
      if (target.isOnline) {
        await addActivity(
          owner,
          target.uid,
          'A new message',
          {type: 'conversation', id: conversation.id},
          true,
        );
      } else {
        const activity = await addActivity(
          owner,
          target.uid,
          'A new message',
          {type: 'conversation', id: conversation.id},
          false,
        );
        await pushRemoteNotification(target.tokens, 'A new message', {
          activity,
        });
      }
    }
  }
}

export async function revokeMessage(conversation, message) {
  await firestore()
    .collection('conversations')
    .doc(conversation.id)
    .collection('messages')
    .doc(message.id)
    .update({
      content: 'Has been revoked',
      revoked: true,
    });
}
