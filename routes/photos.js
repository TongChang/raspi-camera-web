const express = require('express');
const router = express.Router();

const fs = require('fs');
const path = require('path');
// see: http://qiita.com/n0bisuke/items/dd28122d006c95c58f9c
require('date-utils');
// see: http://tkybpp.hatenablog.com/entry/2016/04/25/163246
const execSync = require('child_process').execSync;

const PHOTO_DIR = './public/photos/';

/**
 * get photos list.
 */
router.get('/', function(req, res, next) {
  let files = getFileList(PHOTO_DIR);
  let fileStats = [];
  files.forEach(file => {
    let stats = getFileStat(PHOTO_DIR, file);
    fileStats.push(stats);
  });
  let sortFileStats = sortOfBirthDesc(fileStats);

//  res.render('photos', { files: sortFileStats || [] });
  res.render('photos', { files: fileStats || [] });
});

/**
 * take a photo of now time.
 */
router.get('/take/', (req, res, next) => {
  // take a picture
  let date = new Date();
  let name = date.toFormat("YYYYMMDDHH24MISS");
  takeAPic(PHOTO_DIR, name);
  res.redirect('/photos/');
});

const sortOfBirthDesc = fileStats => {
  if (!fileStats || fileStats.length == 0) {
    return [];
  }

  fileStats.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
};

/**
 * get file names of dir.
 */
const getFileList = dir => {
  if (!dir) {
    console.log('dir is blank.');
    return [];
  }
  if (!fs.statSync(dir).isDirectory) {
    console.log(`dir '${dir}' is not dir.`, dir);
    return [];
  }
  return fs.readdirSync(dir);
};

/**
 * get file status.
 * response :
 *   {
 *     name : "file name",
 *     timestamp : "file create timestamp",
 *     size : "file size"
 *   }
 */
const getFileStat = (dir, name) => {
  if (!dir || !name) {
    console.log(`dir '${dir}' or name '${name}' is blank.`);
    return {};
  }

  let fullpath = path.join(dir + name);
  let fileStat = fs.statSync(fullpath);

  if (!fileStat.isFile()) {
    console.log(`'${fullpath}' is not file.`);
    return {};
  }

  return {
    name: name,
    path: fullpath,
    timestamp: fileStat.birthtime,
    size: fileStat.size
  };
}

const takeAPic = (dir, name) => {
  if (!dir || !name) {
    console.log(`dir '${dir}' or name '${name}' is blank.`);
    return;
  }

  let fullpath = path.join(dir + name);

  if (fs.existsSync(fullpath)) {
    console.log(`file ${fullpath} is aleady exists.`);
    return;
  }

  execSync('raspistill -o ' + fullpath + '.jpg -w 400 -h 300');
};

module.exports = router;
