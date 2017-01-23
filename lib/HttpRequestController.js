'use babel';

import request from 'request';

export function HttpRequestController(editor, contents) {
  let options = {
    url: contents.url,
    qs: contents.queryParameters,
    headers: contents.headers
  };

  request(options, (error, response, body) => {
    editor.moveToBottom();
    editor.insertText("\n--------------------------------------------------------------------------------\n");
    if (error !== null) {
      addError(editor, error);
    } else {
      addResponse(editor, response);
      addBody(editor, body);
    }
  });
}

function addError(editor, error) {
  editor.insertText("Could not send request -- " + error + "\n");
}

function addResponse(editor, response) {
  editor.insertText("Request finished with status " + response.statusCode + "\n");
  editor.insertText("=== Response Headers ===\n");
  for (var key in response.headers) {
    editor.insertText(key + ": " + response.headers[key] + "\n");
  }
}

function addBody(editor, body) {
  editor.insertText("=== Response Body ===\n");
  editor.insertText(body);
}
