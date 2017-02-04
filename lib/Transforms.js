'use babel';

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
