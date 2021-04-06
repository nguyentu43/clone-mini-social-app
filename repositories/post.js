import firestore from '@react-native-firebase/firestore';
import {pushRemoteNotification} from '../services/notification';
import {addActivity} from './activity';
import {deleteFile, getUrl} from './storage';
import {getUser} from './user';

async function getUrlImages(uid, images) {
  const resolverImages = [];
  for (const image of images) {
    resolverImages.push({
      uri: await getUrl(uid, image),
      filename: image,
    });
  }
  return resolverImages;
}

export async function getPostFromDoc(doc) {
  if (!doc?.exists) return null;
  const post = doc.data();
  post.images = await getUrlImages(post.owner, post.images);
  post.id = doc.id;
  post.owner = await getUser(post.owner);
  post.comments = (
    await firestore()
      .collection('posts')
      .doc(post.id)
      .collection('comments')
      .get()
  ).size;
  return post;
}

async function getPostsFromSnap(querySnap) {
  if (!querySnap) return;
  const posts = [];
  for (const doc of querySnap.docs) {
    const post = await getPostFromDoc(doc);
    posts.push(post);
  }
  return posts;
}

export async function getPost(id) {
  const doc = await firestore().collection('posts').doc(id).get();
  return await getPostFromDoc(doc);
}

export async function getAllPostsByF(uidChunks, limit = 25, startAfters = []) {
  for (const [index, uidChunk] of Object.entries(uidChunks)) {
    let queryRef = firestore()
      .collection('posts')
      .orderBy('createdAt', 'desc')
      .where('owner', 'in', uidChunk);
    if (startAfters[index])
      queryRef = queryRef.startAfter(startAfters[index].createdAt);
    const querySnap = await queryRef.limit(limit).get();
    const posts = await getPostsFromSnap(querySnap);
    if (posts.length > 0) {
      return {
        posts,
        index,
      };
    }
  }

  return {
    posts: [],
    index: uidChunks.length - 1,
  };
}

export async function getAllPosts(uid, limit = 25, startAfter = null) {
  let queryRef = firestore()
    .collection('posts')
    .orderBy('createdAt', 'desc')
    .where('owner', '==', uid);
  if (startAfter) queryRef = queryRef.startAfter(startAfter.createdAt);
  const querySnap = await queryRef.limit(limit).get();
  return await getPostsFromSnap(querySnap);
}

export async function searchPosts(keyword) {
  const querySnap = await firestore()
    .collection('posts')
    .where('content', '>=', keyword)
    .where('content', '<=', keyword + '\uf8ff')
    .get();
  return await getPostsFromSnap(querySnap);
}

export async function createPost(post) {
  post.createdAt = firestore.FieldValue.serverTimestamp();
  post.likes = [];
  const docRef = await firestore().collection('posts').add(post);
  const savedPost = (await docRef.get()).data();
  savedPost.id = docRef.id;
  savedPost.images = await getUrlImages(savedPost.owner, savedPost.images);
  return savedPost;
}

export async function updatePost(post) {
  post.updatedAt = firestore.FieldValue.serverTimestamp();
  await firestore().collection('posts').doc(post.id).set(post);
  post.images = await getUrlImages(post.owner, post.images);
  return {...post};
}

export async function deletePost(post) {
  for (const {filename} in post.images) {
    await deleteFile(post.owner, filename);
  }
  await firestore().collection('posts').doc(post.id).delete();
  return true;
}

export async function toggleLikePost(post, uid) {
  if (post.likes.indexOf(uid) === -1) {
    await firestore()
      .collection('posts')
      .doc(post.id)
      .update({
        likes: firestore.FieldValue.arrayUnion(uid),
      });

    const target = await getUser(post.owner.uid);
    if (target.isOnline) {
      await addActivity(
        uid,
        target.uid,
        'Like your post',
        {type: 'post', id: post.id},
        true,
      );
    } else {
      const activity = await addActivity(
        uid,
        target.uid,
        'Like your post',
        {type: 'post', id: post.id},
        false,
      );
      await pushRemoteNotification(target.tokens, 'Like your post', {activity});
    }
  } else {
    //unlike
    await firestore()
      .collection('posts')
      .doc(post.id)
      .update({
        likes: firestore.FieldValue.arrayRemove(uid),
      });
  }

  return await getPost(post.id);
}

export async function getComments(post) {
  const querySnap = await firestore()
    .collection('posts')
    .doc(post.id)
    .collection('comments')
    .get();

  const comments = [];
  for (const doc of querySnap.docs) {
    const comment = doc.data();
    comment.id = doc.id;
    comment.owner = await getUser(comment.owner);
    comments.push(comment);
  }
  return comments;
}

export async function addComment(post, uid, content) {
  const docRef = await firestore()
    .collection('posts')
    .doc(post.id)
    .collection('comments')
    .add({
      owner: uid,
      content,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });

  const target = await getUser(post.owner.uid);
  if (target.isOnline) {
    await addActivity(
      uid,
      target.uid,
      'Leave a comment your post: ' + content,
      {type: 'post', id: post.id},
      true,
    );
  } else {
    const activity = await addActivity(
      uid,
      target.uid,
      'Leave a comment your post: ' + content,
      {type: 'post', id: post.id},
      false,
    );
    await pushRemoteNotification(
      target.tokens,
      'Leave a comment your post: ' + content,
      {
        activity,
      },
    );
  }
}

export async function updateComment(post, commentId, content) {
  await firestore()
    .collection('posts')
    .doc(post.id)
    .collection('comments')
    .doc(commentId)
    .update({
      content,
    });
}

export async function deleteComment(post, commentId) {
  await firestore()
    .collection('posts')
    .doc(post.id)
    .collection('comments')
    .doc(commentId)
    .delete();
  return true;
}
