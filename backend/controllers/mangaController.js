const Book = require('../models/Book');
const Serie = require('../models/Serie');
const jwt = require('jsonwebtoken');

const vipSecret = process.env.JWT_SECRET || 'latioustuturu';
const loginSecret = process.env.JWT_SECRET || 'myooo';

function hasVipAccess(req) {
    const token = req.cookies?.vip;
    if (!token) return false;

    try {
        jwt.verify(token, vipSecret);
        return true;
    } catch (error) {
        return false;
    }
}

function hasLoginAccess(req) {
    const token = req.cookies?.jwt;
    if (!token) return false;

    try {
        jwt.verify(token, loginSecret);
        return true;
    } catch (error) {
        return false;
    }
}

const getManga = async (req, res) => {
    try {
        const manga = await Book.find();
        res.json(manga);
    } catch (error) {
        console.error('Error fetching manga data:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
};
const readManga = async (req, res) => {
    try {
        const manga = await Book.findById(req.params.id);
        if (!manga) {
            return res.status(404).json({ error: 'Manga not found' });
        }

        const loggedIn = hasLoginAccess(req);
        const vipAccess = hasVipAccess(req);
        if (manga.access === 'vip' && (!loggedIn || !vipAccess)) {
            return res.status(403).json({ error: 'VIP member access required' });
        }

        res.json(manga);
    } catch (error) {
        console.error('Error fetching manga data:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
};
const showManga = async (req, res) => {
    try {
        const { serie } = req.query;
        const loggedIn = hasLoginAccess(req);
        const vipAccess = hasVipAccess(req);
        const query = serie ? { serie } : {};

        if (!(loggedIn && vipAccess)) {
            query.access = { $ne: 'vip' };
        }

        const manga = await Book.find(query);
        if (!manga.length) {
            return res.status(404).json({ error: 'Manga not found' });
        }

        res.json(manga);
    } catch (error) {
        console.error('Error fetching manga data:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
};

const delManga = async(req,res)=>{

  try {
        const manga = await Book.findByIdAndDelete(req.params.id);
        if (!manga) {
            return res.status(404).json({ error: 'Manga not found' });
        }
        res.json(manga);
    } catch (error) {
        console.error('Error fetching manga data:', error);
        res.status(500).json({ error: 'Failed to del data' });
    }

};

const createBook = async (req, res) => {
    try {
        const { name, access , seriesId, serie: serieNameFromBody } = req.body;
        let serie = serieNameFromBody;
        let { selectedSeriesCategories } = req.body;
        const mangaFile = req.files?.manga?.[0];
        const imageFile = req.files?.image?.[0];

        if (!name || !mangaFile || !imageFile) {
            return res.status(400).json({ error: 'Name, manga file, and image are required' });
        }

        if (typeof selectedSeriesCategories === 'string') {
            selectedSeriesCategories = JSON.parse(selectedSeriesCategories);
        }

        let serieDoc;
        if ((!selectedSeriesCategories || selectedSeriesCategories.length === 0) && seriesId) {
            serieDoc = await Serie.findById(seriesId).lean();
            selectedSeriesCategories = serieDoc?.sort || [];
        }

        if (!serie && seriesId) {
            serieDoc = serieDoc || await Serie.findById(seriesId).lean();
            serie = serieDoc?.name || '';
        }

        if (!Array.isArray(selectedSeriesCategories) || selectedSeriesCategories.length === 0) {
            return res.status(400).json({ error: 'Series categories are required' });
        }

        if (!serie) {
            return res.status(400).json({ error: 'Serie name is required' });
        }

        const book = await Book.create({
            name,
            access,
            serie,
            selectedSeriesCategories,
            manga: mangaFile.filename,
            image: imageFile.filename,
        });

        res.status(201).json(book);
    } catch (error) {
        console.error('Error creating book:', error);
        res.status(500).json({ error: 'Failed to create book' });
    }
};

module.exports = {
    getManga,
    delManga,
    createBook,
    readManga,
    showManga
};
