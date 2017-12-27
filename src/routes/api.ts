import {Router} from 'express';
import * as request from 'request';
import * as parser from 'xml2json-light';

const router = Router();
export default router;

const MC_HOST = 'http://localhost:52199';

function image(id) {
  return `${MC_HOST}/MCWS/v1/Browse/Image?Version=2&ID=${id}&FallbackColor=130%2C130%2C130&UseStackedImages=1&Format=png&Width=200&Height=200&Square=1`;
}

function browse(what: 'Children' | 'Files', id) {
  return new Promise<string>((resolve, reject) => request({
    url: `${MC_HOST}/MCWS/v1/Browse/${what}?Version=2&ID=${id}&Action=Serialize`,
    method: 'GET'
  }, (error, response, body) => !error && response.statusCode === 200 ? resolve(body) : reject(error)));
}

function info(id) {
  return new Promise<string>((resolve, reject) => request({
    url: `${MC_HOST}/MCWS/v1/File/GetInfo?File=${id}`,
    method: 'GET'
  }, (error, response, body) => !error && response.statusCode === 200 ? resolve(body) : reject(error)));
}

function getArtists(): Promise<any[]> {
  return browse('Children', 1000).then(body => {
    const artists = parser.xml2json(body);
  
    return artists.Response.Item.map(artist => ({
      id: artist['_@ttribute'],
      name: artist.Name,
      image: image(artist['_@ttribute'])
    }));
  });
}

function getArtistAlbums(id) {
  return browse('Children', id).then(body => {
    const artist = parser.xml2json(body);
  
    const albums = (artist.Response.Item.length ? artist.Response.Item : [artist.Response.Item]).map(album => ({
      id: album['_@ttribute'],
      name: album.Name, 
      image: image(album['_@ttribute'])
    }));
  
    return albums;
  });
}

function getTrack(id) {
  return info(id).then(body => {
    const track = parser.xml2json(body);

    return track.MPL.Item.Field.reduce((res, field) => {
      res[field.Name.toLowerCase()] = field['_@ttribute'];

      return res;
    }, {});
  });
}

function getAlbumTracks(id) {
  return browse('Files', id).then(body => {
    const tracks = body.split(';').slice(3);

    return Promise.all(tracks.map(track => getTrack(track))).then(tracks => ({
      artist: tracks[0]['album artist'],
      name: tracks[0].album,
      tracks
    }));
  });
}

function getArtist(id) {
  return Promise.all([
    getArtists().then(artists => artists.find(artist => artist.id === id)),
    getArtistAlbums(id)
  ]).then(([artist, albums]) => ({...artist, albums}));
}

function send(res, data) {
  res.set('Content-Type', 'application/json');
  res.send(data);
}

router.get('/artists', (req, res) => getArtists().then(data => send(res, data)));
router.get('/artist/:id', (req, res) => getArtist(req.params.id).then(data => send(res, data)));
router.get('/album/:id', (req, res) => getAlbumTracks(req.params.id).then(data => send(res, data)));
