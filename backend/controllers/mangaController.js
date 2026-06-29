const Book = require('../models/Book');
const Serie = require('../models/Serie');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { put, del } = require('@vercel/blob');

const vipSecret = process.env.JWT_SECRET;
const loginSecret = process.env.JWT_SECRET;

async function hasVipAccess(req) {
    const token = req.cookies?.vip;
    if (!token) return false;

    try {
        const decoded = jwt.verify(token, vipSecret);
        const user = await User.findById(decoded._id).select('vipMember').lean();
        return Boolean(user?.vipMember);
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
        const vipAccess = await hasVipAccess(req);
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
        const vipAccess = await hasVipAccess(req);
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
        await Promise.all([
            manga.manga?.startsWith('http') ? del(manga.manga) : null,
            manga.image?.startsWith('http') ? del(manga.image) : null,
        ]);
        res.json(manga);
    } catch (error) {
        console.error('Error fetching manga data:', error);
        res.status(500).json({ error: 'Failed to del data' });
    }

};

const createBook = async (req, res) => {
    const mangaFile = req.files?.manga?.[0];
    const imageFile = req.files?.image?.[0];

    try {
        const { name, access , seriesId, serie: serieNameFromBody } = req.body;
        let serie = serieNameFromBody;
        let { selectedSeriesCategories } = req.body;

        if (!name || !mangaFile || !imageFile) {
            return res.status(400).json({ error: 'Name, manga file, and image are required' });
        }

        try {
            if (typeof selectedSeriesCategories === 'string') {
                selectedSeriesCategories = JSON.parse(selectedSeriesCategories);
            }
        } catch (error) {
            return res.status(400).json({ error: 'Invalid series categories JSON' });
        }

        let serieDoc;
        if (seriesId) {
            serieDoc = await Serie.findById(seriesId).lean();
            if (!serieDoc) {
                return res.status(404).json({ error: 'Serie not found' });
            }
        }

        if ((!selectedSeriesCategories || selectedSeriesCategories.length === 0) && serieDoc) {
            selectedSeriesCategories = serieDoc?.sort || [];
        }

        if (serieDoc) {
            serie = serieDoc.name;
        }

        if (!Array.isArray(selectedSeriesCategories) || selectedSeriesCategories.length === 0) {
            return res.status(400).json({ error: 'Series categories are required' });
        }

        if (!serie) {
            return res.status(400).json({ error: 'Serie name is required' });
        }

        const timestamp = Date.now();
        const mangaBlob = await put(`manga/${timestamp}-${mangaFile.originalname}`, mangaFile.buffer, {
            access: 'public',
        });
        const imageBlob = await put(`images/${timestamp}-${imageFile.originalname}`, imageFile.buffer, {
            access: 'public',
        });

        const book = await Book.create({
            name: String(name).trim(),
            access,
            serie,
            selectedSeriesCategories,
            manga: mangaBlob.url,
            image: imageBlob.url,
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
