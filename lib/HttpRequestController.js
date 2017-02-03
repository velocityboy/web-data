'use babel';

import request from 'request';
import he from 'he';

export function HttpRequestController(contents) {
  let options = {
    url: contents.url,
    method: contents.method,
    qs: contents.queryParameters,
    headers: contents.headers,
    form: contents.formData,
  };

  return new Promise((resolve, reject) => {
    request(options, (error, response, body) => {
      resolve({
        error,
        response,
        body
      });
    });
  });
}
