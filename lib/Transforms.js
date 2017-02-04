'use babel';

import { Base64 } from 'js-base64';

export class Transforms {
}

Transforms._getTextToTransform = function(editor) {
  let range = editor.getSelectedBufferRange();
  if (range.isEmpty()) {
    editor.selectAll();
  }
  return editor.getSelectedText();
}

Transforms.jsonPrettyPrint = function(editor) {
  let json;
  let text = Transforms._getTextToTransform(editor);

  try {
    json = JSON.parse(text);
  } catch(e) {
    return false;
  }

  editor.insertText(JSON.stringify(json, null, 4));
  return true;
}

Transforms.URLDecode = function(editor) {
  let text = Transforms._getTextToTransform(editor);
  editor.insertText(unescape(text));
}

Transforms.URLEncode = function(editor) {
  let text = Transforms._getTextToTransform(editor);
  editor.insertText(escape(text));
}

Transforms.base64Decode = function(editor) {
  let text = Transforms._getTextToTransform(editor);
  editor.insertText(Base64.decode(text));
}

Transforms.base64Encode = function(editor) {
  let text = Transforms._getTextToTransform(editor);
  let base64 = Base64.encode(text);
  let insert = '';
  while (base64.length > 76) {
    insert += base64.substr(0, 76) + "\n";
    base64 = base64.substr(76);
  }

  if (base64 !== '') {
    insert += base64 + "\n";
  }

  editor.insertText(insert);
}

Transforms.splitQueryParams = function(editor) {
  let text = Transforms._getTextToTransform(editor);
  text = text.replace(/[?&]/g, "\n");
  editor.insertText(text);
}
