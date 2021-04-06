import 'react-native-get-random-values';
import {nanoid} from 'nanoid';

export function getExt(filename) {
  return filename.substr(filename.lastIndexOf('.'));
}

export function getUniqFileName(ext) {
  return nanoid() + '.' + ext;
}
