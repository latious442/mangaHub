const Book = require('../models/Book');
const Serie = require('../models/Serie');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
const path = require('path');

const vipSecret = process.env.JWT_SECRET || 'latioustuturu';
const loginSecret = process.env.JWT_SECRET || 'myooo';
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

const cleanupUploadedFiles = async (...files) => {
    await Promise.all(
        files
            .filter(Boolean)
            .map((file) => removeFileIfExists(path.join(uploadsRoot, file.filename)))
    );
};

const moveUploadedFile = async (file, destinationFolder) => {
    const fromPath = path.join(uploadsRoot, file.filename);
    const toPath = path.join(destinationFolder, file.filename);

    await fs.rename(fromPath, toPath);
};

const uploadPathForDb = (folderName, fileName) => {
    return path.join(folderName, fileName).replace(/\\/g, '/');
};

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
            manga.manga ? removeFileIfExists(path.join(uploadsRoot, manga.manga)) : null,
            manga.image ? removeFileIfExists(path.join(uploadsRoot, manga.image)) : null,
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
    let movedMangaPath = null;
    let movedImagePath = null;

    try {
        const { name, access , seriesId, serie: serieNameFromBody } = req.body;
        let serie = serieNameFromBody;
        let { selectedSeriesCategories } = req.body;

        if (!name || !mangaFile || !imageFile) {
            await cleanupUploadedFiles(mangaFile, imageFile);
            return res.status(400).json({ error: 'Name, manga file, and image are required' });
        }

        try {
            if (typeof selectedSeriesCategories === 'string') {
                selectedSeriesCategories = JSON.parse(selectedSeriesCategories);
            }
        } catch (error) {
            await cleanupUploadedFiles(mangaFile, imageFile);
            return res.status(400).json({ error: 'Invalid series categories JSON' });
        }

        let serieDoc;
        if (seriesId) {
            serieDoc = await Serie.findById(seriesId).lean();
            if (!serieDoc) {
                await cleanupUploadedFiles(mangaFile, imageFile);
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
            await cleanupUploadedFiles(mangaFile, imageFile);
            return res.status(400).json({ error: 'Series categories are required' });
        }

        if (!serie) {
            await cleanupUploadedFiles(mangaFile, imageFile);
            return res.status(400).json({ error: 'Serie name is required' });
        }

        const serieFolderName = safeFolderName(serie);
        const serieDir = path.join(uploadsRoot, serieFolderName);

        await fs.mkdir(serieDir, { recursive: true });
        await Promise.all([
            moveUploadedFile(mangaFile, serieDir),
            moveUploadedFile(imageFile, serieDir),
        ]);
        movedMangaPath = path.join(serieDir, mangaFile.filename);
        movedImagePath = path.join(serieDir, imageFile.filename);

        const book = await Book.create({
            name: String(name).trim(),
            access,
            serie,
            selectedSeriesCategories,
            manga: uploadPathForDb(serieFolderName, mangaFile.filename),
            image: uploadPathForDb(serieFolderName, imageFile.filename),
        });

        res.status(201).json(book);
    } catch (error) {
        console.error('Error creating book:', error);
        await Promise.all([
            mangaFile ? removeFileIfExists(movedMangaPath || path.join(uploadsRoot, mangaFile.filename)) : null,
            imageFile ? removeFileIfExists(movedImagePath || path.join(uploadsRoot, imageFile.filename)) : null,
        ]);
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
