const Serie =require('../models/Serie');

const postSerie = async (req, res) => {
  try {
    const { name, sort } = req.body;
    const photoFile = req.file;
    const sortData = typeof sort === 'string' ? JSON.parse(sort) : sort;

    if (!name || !sortData || !photoFile) {
      return res.status(400).json({ error: 'Name, categories, and photo are required' });
    }

    const newSerie = await Serie.create({
      name,
      sort: sortData,
      photo: photoFile.filename,
    });
    console.log('serie posted');
    res.status(201).json(newSerie);
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: 'Server error' });
  }
};

const getSerie = async (req, res) => {
  try {
    const series = await Serie.find();
    res.json(series);
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: 'Server error' });
  }
};

const delSerie = async(req,res)=>{

  try {
        const serie = await Serie.findByIdAndDelete(req.params.id);
        if (!serie) {
            return res.status(404).json({ error: 'Manga not found' });
        }
        res.json(serie);
    } catch (error) {
        console.error('Error fetching manga data:', error);
        res.status(500).json({ error: 'Failed to del data' });
    }

};

module.exports = { postSerie , getSerie , delSerie};