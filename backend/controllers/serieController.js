const fs = require('fs').promises;
const path = require('path');
const Serie = require('../models/Serie');

const uploadsRoot = path.join(__dirname, '../public/uploads');

const safeFolderName = (name) => {
  const folderName = String(name || '')
    .trim()
    .replace(/[^a-zA-Z0-9-_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');

  return folderName || String(Date.now());
};

const removeFileIfExists = async (filePath) => {
  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
};

const removeFolderIfExists = async (folderPath) => {
  try {
    await fs.rm(folderPath, { recursive: true, force: true });
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
};

const parseSort = (sort) => {
  if (Array.isArray(sort)) {
    return sort;
  }

  if (typeof sort === 'string') {
    return JSON.parse(sort);
  }

  return [];
};

const postSerie = async (req, res) => {
  const photoFile = req.file;
  const uploadedPhotoPath = photoFile ? path.join(uploadsRoot, photoFile.filename) : null;

  try {
    const name = String(req.body.name || '').trim();
    let sortData;

    try {
      sortData = parseSort(req.body.sort);
    } catch (error) {
      if (uploadedPhotoPath) await removeFileIfExists(uploadedPhotoPath);
      return res.status(400).json({ error: 'Invalid categories JSON' });
    }

    if (!name || !Array.isArray(sortData) || sortData.length === 0 || !photoFile) {
      if (uploadedPhotoPath) await removeFileIfExists(uploadedPhotoPath);
      return res.status(400).json({ error: 'Name, categories, and photo are required' });
    }

    const serieFolderName = safeFolderName(name);
    const serieDir = path.join(uploadsRoot, serieFolderName);
    const photoPathForDb = path.join(serieFolderName, photoFile.filename).replace(/\\/g, '/');

    await fs.mkdir(serieDir, { recursive: true });
    await fs.rename(uploadedPhotoPath, path.join(serieDir, photoFile.filename));

    const newSerie = await Serie.create({
      name,
      sort: sortData,
      photo: photoPathForDb,
    });

    return res.status(201).json(newSerie);
  } catch (error) {
    console.error('Error creating serie:', error);
    return res.status(500).json({ error: 'Failed to create serie' });
  }
};

const getSerie = async (req, res) => {
  try {
    const series = await Serie.find();
    return res.json(series);
  } catch (error) {
    console.error('Error fetching series:', error);
    return res.status(500).json({ error: 'Failed to fetch series' });
  }
};

const delSerie = async (req, res) => {
  try {
    const serie = await Serie.findByIdAndDelete(req.params.id);

    if (!serie) {
      return res.status(404).json({ error: 'Serie not found' });
    }

    const foldersToRemove = new Set([path.join(uploadsRoot, safeFolderName(serie.name))]);

    if (serie.photo) {
      const photoPath = path.join(uploadsRoot, serie.photo);
      foldersToRemove.add(path.dirname(photoPath));
    }

    await Promise.all([...foldersToRemove].map(removeFolderIfExists));

    return res.json(serie);
  } catch (error) {
    console.error('Error deleting serie:', error);
    return res.status(500).json({ error: 'Failed to delete serie' });
  }
};

module.exports = { postSerie, getSerie, delSerie };
