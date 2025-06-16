const express = require('express');
const router = express.Router();
const albumController = require('../controllers/album.controller')


router.get('/albums/create', albumController.createAlbumForm);
router.post('/albums/create', albumController.createAlbum);


router.get('/albums', albumController.Albums);
router.get('/albums/:id', albumController.single_album);
router.post('/albums/:id', albumController.addImage);

router.get('/albums/:id/delete', albumController.DeleteAlbum);
router.get('/albums/:id/delete/:imageIndex', albumController.DeleteImage);




module.exports =router;