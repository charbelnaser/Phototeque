const Album = require('../models/Album');
const path = require('path');
const fs = require('fs');
const catchAsync = require('../helpers/catchAsync');

const Albums = catchAsync(async (req, res) => {
    const albums = await  Album.find();
    res.render('albums', {
        title : 'Mes albums' ,
        albums : albums,

    });
 
});

const single_album = catchAsync(async (req, res) => {
    try {
        console.log(req.params.id)
        const album = await Album.findById(req.params.id);
        res.render('album', {
            title : 'Album' ,
            album : album,
            errors: req.flash('error'),

        });
    } catch(err){
        console.log(err);
        // res.redirect('/404');
    }
   
 
});

const addImage = catchAsync(async (req, res) => {
    try {
        const idAlbum = req.params.id;
        if (!req?.files?.image) {
            req.flash('error', 'Aucun fichier mis en ligne');
            res.redirect(`/albums/${idAlbum}`);
            return
        }
        if (req.files.image.mimetype != 'image/jpeg' && req.files.image.mimetype != 'image/png'){
            req.flash('error', 'Fichiers JPG et PNG accepté uniquement');
            res.redirect(`/albums/${idAlbum}`);
            return

        }
        const image = req.files.image
        const imageName = image.name;

        const album = await Album.findById(idAlbum);
        const folderpath = path.join(__dirname, '../public/uploads', idAlbum);
        const localPath = path.join(folderpath, imageName);
        fs.mkdirSync(folderpath, {recursive:true})
        await image.mv(localPath);

        album.images.push(imageName);
        await album.save();

        res.redirect(`/albums/${idAlbum}`);
     
    } catch(err){
        console.log(err);
        // res.redirect('/404');
    }
   
 
});

const createAlbumForm = (req, res) => {

    res.render('new-album', {
        title : 'Nouvel Album' ,
        errors: req.flash('error'),
    });
 
};

const createAlbum = async (req, res) => {
    console.log(req.body)
    try
    {
        if (!req.body.albumTitle) {
            req.flash('error', 'Le titre de doit pas etre vide');
            res.redirect('/albums/create');
            return;

        }
        
        await Album.create({
                title:req.body.albumTitle,
                errors: req.flash('error'),
        });

        res.redirect('/albums');
    } catch(err) {
        req.flash('error', "Error lors de la création de l'album");
        res.redirect('/albums/create');
    }
  
 
};

const DeleteImage = async (req, res) => {
    const idAlbum = req.params.id;
    const imageindex = req.params.imageIndex;
    const album = await Album.findById(idAlbum);
    const image = album.images[imageindex];
    if (!image){
        res.redirect(`/albums/${idAlbum}`);
        return;
     
    }
    album.images.splice(imageindex, 1)
    await album.save();
    imagePath = path.join(__dirname, '../public/uploads', idAlbum, image);
    fs.unlinkSync(imagePath);
    res.redirect(`/albums/${idAlbum}`);
};

const DeleteAlbum = async (req, res) => {
    const idAlbum = req.params.id;
    await Album.findByIdAndDelete(idAlbum);
    const albumPath = path.join(__dirname, '../public/uploads', idAlbum);
    await fs.promises.rm(albumPath, { recursive: true, force: true });
    res.redirect(`/albums`);
};

module.exports = {
    createAlbumForm,
    createAlbum,
    Albums,
    single_album,
    addImage,
    DeleteImage,
    DeleteAlbum,
}