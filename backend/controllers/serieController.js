const Serie = require('../models/Serie');
const { put, del } = require('@vercel/blob');

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

  try {
    const name = String(req.body.name || '').trim();
    let sortData;

    try {
      sortData = parseSort(req.body.sort);
    } catch (error) {
      return res.status(400).json({ error: 'Invalid categories JSON' });
    }

    if (!name || !Array.isArray(sortData) || sortData.length === 0 || !photoFile) {
      return res.status(400).json({ error: 'Name, categories, and photo are required' });
    }

    const photoBlob = await put(`series/${name}-${Date.now()}-${photoFile.originalname}`, photoFile.buffer, {
      access: 'public',
    });

    const newSerie = await Serie.create({
      name,
      sort: sortData,
      photo: photoBlob.url,
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

    if (serie.photo?.startsWith('http')) {
      await del(serie.photo);
    }

    return res.json(serie);
  } catch (error) {
    console.error('Error deleting serie:', error);
    return res.status(500).json({ error: 'Failed to delete serie' });
  }
};

module.exports = { postSerie, getSerie, delSerie };
