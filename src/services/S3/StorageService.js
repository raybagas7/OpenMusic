const AWS = require('aws-sdk');
const { Pool } = require('pg');
const NotFoundError = require('../../exceptions/NotFoundError');
const config = require('../../utils/config');

class StorageService {
  constructor() {
    this._S3 = new AWS.S3();
    this._pool = new Pool();
  }

  writeFile(file, meta) {
    const parameter = {
      Bucket: config.s3.bucketName,
      Key: +new Date() + meta.filename,
      Body: file._data,
      ContentType: meta.headers['content-type'],
    };

    return new Promise((resolve, reject) => {
      this._S3.upload(parameter, (error, data) => {
        if (error) {
          return reject(error);
        }

        return resolve(data.Location);
      });
    });
  }

  async addCoverToAlbum(albumId, albumCoverUrl) {
    const query = {
      text: 'UPDATE albums SET cover = $1 WHERE id = $2',
      values: [albumCoverUrl, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Album tidak ditemukan');
    }
  }
}

module.exports = StorageService;
