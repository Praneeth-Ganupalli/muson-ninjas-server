const streamifier = require('streamifier');
const cloudinary = require('cloudinary').v2;
const sharp = require('sharp');
cloudinary.config({
    cloud_name: 'dtkumvhbp',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});
exports.uploadImage = async (buffer, fileName) => {
    // await cloudinary.uploader
    //    .upload(
    //       req.file.buffer, {
    //            public_id: 'shoes',
    //        }
    //    )
    //    .catch((error) => {
    //       throw error;
    //    });
    //    const autoCropUrl = cloudinary.url('shoes', {
    //     crop: 'auto',
    //     gravity: 'center',
    //     width: 400,
    //     height: 400,
    //     fetch_format: 'auto',
    //     quality: 'auto'
    // });
    // console.log(autoCropUrl,"checking urlll");
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'playlists',
                public_id: fileName,
                overwrite: true
            },
            (error, result) => {
                if (result) {
                    resolve(result.secure_url);
                }
                else reject(error);
            },
        );
        sharp(buffer).resize(400, 400, {
            fit: sharp.fit.cover,
            position: sharp.strategy.entropy
        }).toBuffer((er, resizedBuffer) => {
            if (er) reject(er);
            if (resizedBuffer) {
                streamifier.createReadStream(resizedBuffer).pipe(uploadStream);
            }
        })

    });
}