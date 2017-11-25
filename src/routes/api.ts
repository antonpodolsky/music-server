import {Router} from 'express';
import * as request from 'request';
import * as parser from 'xml2json-light';

const router = Router();
export default router;

const MC_HOST = 'http://localhost:52199';

function image(id) {
  return `${MC_HOST}/MCWS/v1/Browse/Image?Version=2&ID=${id}&FallbackColor=130%2C130%2C130&UseStackedImages=1&Format=png`;
}

function fetch(what: 'Children' | 'Files', id) {
  return new Promise<string>((resolve, reject) => request({
    url: `${MC_HOST}/MCWS/v1/Browse/${what}?Version=2&ID=${id}&Action=Serialize`,
    method: 'GET'
  }, (error, response, body) => !error && response.statusCode === 200 ? resolve(body) : reject(error)));
}

function send(res, data) {
  res.set('Content-Type', 'application/json');
  res.send(data);
}

router.get('/artists', (req, res) => fetch('Children', 1000).then(body => {
  const artists = parser.xml2json(body);

  return artists.Response.Item.map(artist => ({
    id: artist['_@ttribute'],
    name: artist.Name,
    image: image(artist['_@ttribute'])
  }));
}).then(data => send(res, data)));

router.get('/artist/:id', (req, res) => fetch('Children', req.params.id).then(body => {
  const artist = parser.xml2json(body);

  const albums = (artist.Response.Item.length ? artist.Response.Item : [artist.Response.Item]).map(album => ({
    id: album['_@ttribute'],
    name: album.Name, 
    image: image(album['_@ttribute'])
  }));

  return {albums};
}).then(data => send(res, data)));

router.get('/album/:id', (req, res) => fetch('Files', req.params.id).then(body => {
  const tracks = body.split(';').slice(3).map(track => ({
    id: track, name: track
  }));

  return ({tracks});
}).then(data => send(res, data)));
