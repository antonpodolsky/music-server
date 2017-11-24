import {Router} from 'express';
import * as request from 'request';
import * as parser from 'xml2json-light';

const router = Router();

export default router;

router.get('/artists', (req, res) => request({
  url: 'http://localhost:52199/MCWS/v1/Library/Values?Field=Artist',
  method: 'GET'
}, (error, response, body) => {
  if (!error && response.statusCode === 200) {
    const artists = parser.xml2json(body);

    res.set('Content-Type', 'application/json');
    res.send(artists.Response.Item);
  }
}));
