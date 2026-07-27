import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'cinevault_jwt_secret_key_2026';

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Support base64 profile photo uploads

// --- Database Configuration (MongoDB Mongoose + Local JSON Fallback) ---
let isMongoConnected = false;

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    posterUrl: { type: String, default: '' },
    description: { type: String, default: '' },
    releaseYear: { type: Number },
    genre: { type: String, required: true },
    director: { type: String, default: '' },
    rating: { type: Number, min: 0, max: 10, default: 0 },
    status: {
      type: String,
      enum: ['Want to Watch', 'Watching', 'Watched'],
      default: 'Want to Watch',
    },
    isFavorite: { type: Boolean, default: false },
    notes: { type: String, default: '' },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

const MovieModel = mongoose.model('Movie', movieSchema);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    profilePhoto: { type: String, default: '' },
  },
  { timestamps: true }
);

const UserModel = mongoose.model('User', userSchema);

// Extended Express Request with Authenticated User
interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

// Auth Middleware to protect API routes
const authenticateToken = (req: AuthRequest, res: Response, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required. Please sign in.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    req.user = { id: String(decoded.id), email: decoded.email };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired session. Please sign in again.' });
  }
};

// File-backed Local Persistence for Fallback when MongoDB is not connected
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'movies.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

const INITIAL_SEED_MOVIES = [
  {
    title: 'Inception',
    posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80',
    description: 'A thief who steals corporate secrets through dream-sharing technology is given the inverse task of planting an idea.',
    releaseYear: 2010,
    genre: 'Sci-Fi',
    director: 'Christopher Nolan',
    rating: 9.0,
    status: 'Watched',
    isFavorite: true,
    notes: 'Mind-bending masterpiece with iconic soundtrack.',
    isDeleted: false,
    deletedAt: null,
  },
  {
    title: 'Dune: Part Two',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators.',
    releaseYear: 2024,
    genre: 'Sci-Fi',
    director: 'Denis Villeneuve',
    rating: 8.8,
    status: 'Watched',
    isFavorite: true,
    notes: 'Visually stunning cinematic experience.',
    isDeleted: false,
    deletedAt: null,
  },
  {
    title: 'Oppenheimer',
    posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80',
    description: 'The story of J. Robert Oppenheimer and his role in the development of the atomic bomb.',
    releaseYear: 2023,
    genre: 'Drama',
    director: 'Christopher Nolan',
    rating: 8.9,
    status: 'Watched',
    isFavorite: true,
    notes: 'Incredible performances by Cillian Murphy and Robert Downey Jr.',
    isDeleted: false,
    deletedAt: null,
  },
  {
    title: 'Interstellar',
    posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    description: 'When Earth becomes uninhabitable, a team of researchers travels through a wormhole in space.',
    releaseYear: 2014,
    genre: 'Sci-Fi',
    director: 'Christopher Nolan',
    rating: 8.7,
    status: 'Want to Watch',
    isFavorite: true,
    notes: 'Planning a movie night rewatch.',
    isDeleted: false,
    deletedAt: null,
  },
  {
    title: 'Blade Runner 2049',
    posterUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
    description: 'Young Blade Runner K discovers a long-buried secret that leads him to track down former Blade Runner Rick Deckard.',
    releaseYear: 2017,
    genre: 'Sci-Fi',
    director: 'Denis Villeneuve',
    rating: 8.4,
    status: 'Watching',
    isFavorite: false,
    notes: 'Atmospheric synth wave noir storytelling.',
    isDeleted: false,
    deletedAt: null,
  },
];

function ensureUsersStore() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(USERS_FILE)) {
    const defaultPassword = bcrypt.hashSync('password123', 10);
    const demoUserId = 'usr_demo_1';
    const seedUsers = [
      {
        _id: demoUserId,
        name: 'Alex Rivers',
        email: 'alex@example.com',
        password: defaultPassword,
        profilePhoto: '',
        createdAt: new Date().toISOString(),
      },
    ];
    fs.writeFileSync(USERS_FILE, JSON.stringify(seedUsers, null, 2), 'utf-8');

    // Ensure default movies exist for demo user in local movies file
    if (!fs.existsSync(DATA_FILE)) {
      const demoMovies = INITIAL_SEED_MOVIES.map((m, idx) => ({
        _id: 'mv_seed_' + (idx + 1),
        ...m,
        user: demoUserId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      fs.writeFileSync(DATA_FILE, JSON.stringify(demoMovies, null, 2), 'utf-8');
    }
  }
}

function readLocalUsers(): any[] {
  ensureUsersStore();
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading local users file:', err);
    ensureUsersStore();
    return [];
  }
}

function writeLocalUsers(users: any[]) {
  ensureUsersStore();
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

function ensureLocalStore() {
  ensureUsersStore();
  if (!fs.existsSync(DATA_FILE)) {
    const demoMovies = INITIAL_SEED_MOVIES.map((m, idx) => ({
      _id: 'mv_seed_' + (idx + 1),
      ...m,
      user: 'usr_demo_1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    fs.writeFileSync(DATA_FILE, JSON.stringify(demoMovies, null, 2), 'utf-8');
  }
}

function readLocalMovies(): any[] {
  ensureLocalStore();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading local movie data file:', err);
    ensureLocalStore();
    return [];
  }
}

function writeLocalMovies(movies: any[]) {
  ensureLocalStore();
  fs.writeFileSync(DATA_FILE, JSON.stringify(movies, null, 2), 'utf-8');
}

// Connect MongoDB if MONGO_URI is set
if (process.env.MONGO_URI) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      isMongoConnected = true;
      console.log('Successfully connected to MongoDB via MONGO_URI.');
    })
    .catch((err) => {
      console.warn('MongoDB connection failed, falling back to local file storage:', err.message);
      isMongoConnected = false;
    });
} else {
  console.log('No MONGO_URI provided. Operating with local file-backed repository.');
}

// Helper to sanitize movie input
function sanitizeMovieInput(body: any) {
  return {
    title: String(body.title || '').trim(),
    posterUrl: String(body.posterUrl || '').trim(),
    description: String(body.description || '').trim(),
    releaseYear: Number(body.releaseYear) || new Date().getFullYear(),
    genre: String(body.genre || 'Other').trim(),
    director: String(body.director || '').trim(),
    rating: Math.min(10, Math.max(0, Number(body.rating) || 0)),
    status: ['Want to Watch', 'Watching', 'Watched'].includes(body.status)
      ? body.status
      : 'Want to Watch',
    isFavorite: Boolean(body.isFavorite),
    notes: String(body.notes || '').trim(),
  };
}

// --- REST API ENDPOINTS ---

// 1. AUTH ENDPOINTS

// Register Handler Helper
async function handleUserRegister(req: Request, res: Response) {
  try {
    const { name, email, password, profilePhoto } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ message: 'Full name is required.' });
    }
    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ message: 'Valid email address is required.' });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (isMongoConnected) {
      const existing = await UserModel.findOne({ email: cleanEmail });
      if (existing) {
        return res.status(400).json({ message: 'An account with this email already exists.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new UserModel({
        name: cleanName,
        email: cleanEmail,
        password: hashedPassword,
        profilePhoto: profilePhoto || '',
      });

      const savedUser = await newUser.save();
      const userIdStr = String(savedUser._id);

      // Seed sample movies for new user
      const sampleMovies = INITIAL_SEED_MOVIES.map((m) => ({
        ...m,
        user: savedUser._id,
      }));
      await MovieModel.insertMany(sampleMovies);

      const token = jwt.sign({ id: userIdStr, email: savedUser.email }, JWT_SECRET, {
        expiresIn: '7d',
      });

      return res.status(201).json({
        user: {
          _id: userIdStr,
          name: savedUser.name,
          email: savedUser.email,
          profilePhoto: savedUser.profilePhoto,
          createdAt: savedUser.createdAt,
        },
        token,
      });
    } else {
      const users = readLocalUsers();
      const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (existing) {
        return res.status(400).json({ message: 'An account with this email already exists.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUserId = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
      const newUser = {
        _id: newUserId,
        name: cleanName,
        email: cleanEmail,
        password: hashedPassword,
        profilePhoto: profilePhoto || '',
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      writeLocalUsers(users);

      // Seed initial starter movies for new user in local file store
      const movies = readLocalMovies();
      const sampleMovies = INITIAL_SEED_MOVIES.map((m, idx) => ({
        _id: 'mv_' + Date.now() + '_' + idx,
        ...m,
        user: newUserId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      movies.push(...sampleMovies);
      writeLocalMovies(movies);

      const token = jwt.sign({ id: newUserId, email: newUser.email }, JWT_SECRET, {
        expiresIn: '7d',
      });

      return res.status(201).json({
        user: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          profilePhoto: newUser.profilePhoto,
          createdAt: newUser.createdAt,
        },
        token,
      });
    }
  } catch (error: any) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Failed to create account', error: error.message });
  }
}

// POST /api/auth/register & POST /api/auth/signup
app.post('/api/auth/register', handleUserRegister);
app.post('/api/auth/signup', handleUserRegister);

// POST /api/auth/login
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (isMongoConnected) {
      const user = await UserModel.findOne({ email: cleanEmail });
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      const token = jwt.sign({ id: String(user._id), email: user.email }, JWT_SECRET, {
        expiresIn: '7d',
      });

      return res.json({
        user: {
          _id: String(user._id),
          name: user.name,
          email: user.email,
          profilePhoto: user.profilePhoto || '',
          createdAt: user.createdAt,
        },
        token,
      });
    } else {
      const users = readLocalUsers();
      const user = users.find((u) => u.email.toLowerCase() === cleanEmail);
      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password.' });
      }

      const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, {
        expiresIn: '7d',
      });

      return res.json({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          profilePhoto: user.profilePhoto || '',
          createdAt: user.createdAt,
        },
        token,
      });
    }
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Failed to sign in', error: error.message });
  }
});

// GET /api/auth/me
app.get('/api/auth/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    if (isMongoConnected) {
      const user = await UserModel.findById(userId).select('-password');
      if (!user) {
        return res.status(401).json({ message: 'User account not found.' });
      }
      return res.json({
        _id: String(user._id),
        name: user.name,
        email: user.email,
        profilePhoto: user.profilePhoto || '',
        createdAt: user.createdAt,
      });
    } else {
      const users = readLocalUsers();
      const user = users.find((u) => u._id === userId);
      if (!user) {
        return res.status(401).json({ message: 'User account not found.' });
      }
      return res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        profilePhoto: user.profilePhoto || '',
        createdAt: user.createdAt,
      });
    }
  } catch (error: any) {
    return res.status(401).json({ message: 'Invalid session token.' });
  }
});

// PUT /api/auth/profile
app.put('/api/auth/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, profilePhoto } = req.body;

    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ message: 'Name cannot be empty.' });
    }

    const updatedName = name.trim();
    const updatedPhoto = typeof profilePhoto === 'string' ? profilePhoto : '';

    if (isMongoConnected) {
      const user = await UserModel.findByIdAndUpdate(
        userId,
        { $set: { name: updatedName, profilePhoto: updatedPhoto } },
        { new: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.json({
        _id: String(user._id),
        name: user.name,
        email: user.email,
        profilePhoto: user.profilePhoto || '',
        createdAt: user.createdAt,
      });
    } else {
      const users = readLocalUsers();
      const userIndex = users.findIndex((u) => u._id === userId);
      if (userIndex === -1) {
        return res.status(404).json({ message: 'User not found' });
      }

      users[userIndex].name = updatedName;
      users[userIndex].profilePhoto = updatedPhoto;
      writeLocalUsers(users);

      return res.json({
        _id: users[userIndex]._id,
        name: users[userIndex].name,
        email: users[userIndex].email,
        profilePhoto: users[userIndex].profilePhoto || '',
        createdAt: users[userIndex].createdAt,
      });
    }
  } catch (error: any) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Failed to update profile.' });
  }
});

// POST /api/auth/logout
app.post('/api/auth/logout', (_req: Request, res: Response) => {
  res.json({ message: 'Logged out successfully.' });
});

// 2. MOVIE ENDPOINTS (Protected per Logged-in User)

// GET /api/movies/trash - Get all soft-deleted movies in user's Recycle Bin
app.get('/api/movies/trash', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    if (isMongoConnected) {
      const deletedMovies = await MovieModel.find({ user: userId, isDeleted: true })
        .sort({ deletedAt: -1 })
        .exec();
      return res.json(deletedMovies);
    } else {
      const movies = readLocalMovies()
        .filter((m) => m.user === userId && m.isDeleted === true)
        .sort((a, b) => new Date(b.deletedAt || 0).getTime() - new Date(a.deletedAt || 0).getTime());
      return res.json(movies);
    }
  } catch (error: any) {
    console.error('Error fetching trash movies:', error);
    res.status(500).json({ message: 'Failed to fetch Recycle Bin items' });
  }
});

// PATCH /api/movies/trash/restore-all - Restore all soft-deleted movies
app.patch('/api/movies/trash/restore-all', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    if (isMongoConnected) {
      const result = await MovieModel.updateMany(
        { user: userId, isDeleted: true },
        { $set: { isDeleted: false, deletedAt: null } }
      );
      return res.json({
        message: 'All movies restored from Recycle Bin ♻️',
        restoredCount: result.modifiedCount,
      });
    } else {
      const movies = readLocalMovies();
      let restoredCount = 0;
      movies.forEach((m) => {
        if (m.user === userId && m.isDeleted === true) {
          m.isDeleted = false;
          m.deletedAt = null;
          m.updatedAt = new Date().toISOString();
          restoredCount++;
        }
      });
      writeLocalMovies(movies);
      return res.json({ message: 'All movies restored from Recycle Bin ♻️', restoredCount });
    }
  } catch (error: any) {
    console.error('Error restoring all movies:', error);
    res.status(500).json({ message: 'Failed to restore movies from Recycle Bin' });
  }
});

// DELETE /api/movies/trash/empty - Permanently delete all soft-deleted movies for user
app.delete('/api/movies/trash/empty', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    if (isMongoConnected) {
      const result = await MovieModel.deleteMany({ user: userId, isDeleted: true });
      return res.json({
        message: 'Recycle Bin emptied successfully 🗑️',
        deletedCount: result.deletedCount,
      });
    } else {
      let movies = readLocalMovies();
      const initialLength = movies.length;
      movies = movies.filter((m) => !(m.user === userId && m.isDeleted === true));
      const deletedCount = initialLength - movies.length;
      writeLocalMovies(movies);
      return res.json({ message: 'Recycle Bin emptied successfully 🗑️', deletedCount });
    }
  } catch (error: any) {
    console.error('Error emptying Recycle Bin:', error);
    res.status(500).json({ message: 'Unable to empty Recycle Bin. Please try again.' });
  }
});

// GET /api/movies - Get active movies (isDeleted: false)
app.get('/api/movies', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { search, genre, status, isFavorite, minRating, sortBy } = req.query;

    if (isMongoConnected) {
      const filter: any = { user: userId, isDeleted: { $ne: true } };

      if (search && typeof search === 'string' && search.trim() !== '') {
        const regex = new RegExp(search.trim(), 'i');
        filter.$and = [
          { user: userId, isDeleted: { $ne: true } },
          { $or: [{ title: regex }, { genre: regex }, { director: regex }] },
        ];
      }

      if (genre && genre !== 'All') {
        filter.genre = genre;
      }

      if (status && status !== 'All') {
        filter.status = status;
      }

      if (isFavorite === 'true') {
        filter.isFavorite = true;
      }

      if (minRating) {
        filter.rating = { $gte: Number(minRating) };
      }

      let query = MovieModel.find(filter);

      if (sortBy === 'titleAsc') query = query.sort({ title: 1 });
      else if (sortBy === 'highestRated') query = query.sort({ rating: -1 });
      else if (sortBy === 'oldest') query = query.sort({ releaseYear: 1 });
      else if (sortBy === 'newest') query = query.sort({ releaseYear: -1 });
      else query = query.sort({ createdAt: -1 });

      const movies = await query.exec();
      return res.json(movies);
    } else {
      let movies = readLocalMovies().filter((m) => m.user === userId && m.isDeleted !== true);

      // Search filter
      if (search && typeof search === 'string' && search.trim() !== '') {
        const q = search.trim().toLowerCase();
        movies = movies.filter(
          (m) =>
            m.title.toLowerCase().includes(q) ||
            m.genre.toLowerCase().includes(q) ||
            m.director.toLowerCase().includes(q)
        );
      }

      // Genre filter
      if (genre && genre !== 'All') {
        movies = movies.filter((m) => m.genre === genre);
      }

      // Status filter
      if (status && status !== 'All') {
        movies = movies.filter((m) => m.status === status);
      }

      // Favorite filter
      if (isFavorite === 'true') {
        movies = movies.filter((m) => m.isFavorite);
      }

      // Rating filter
      if (minRating) {
        movies = movies.filter((m) => m.rating >= Number(minRating));
      }

      // Sorting
      if (sortBy === 'titleAsc') {
        movies.sort((a, b) => a.title.localeCompare(b.title));
      } else if (sortBy === 'highestRated') {
        movies.sort((a, b) => b.rating - a.rating);
      } else if (sortBy === 'oldest') {
        movies.sort((a, b) => a.releaseYear - b.releaseYear);
      } else if (sortBy === 'newest') {
        movies.sort((a, b) => b.releaseYear - a.releaseYear);
      } else {
        movies.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }

      return res.json(movies);
    }
  } catch (error: any) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ message: 'Failed to fetch movies', error: error.message });
  }
});

// GET /api/stats
app.get('/api/stats', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    let allUserMovies: any[] = [];

    if (isMongoConnected) {
      allUserMovies = await MovieModel.find({ user: userId }).lean().exec();
    } else {
      allUserMovies = readLocalMovies().filter((m) => m.user === userId);
    }

    const activeMovies = allUserMovies.filter((m) => m.isDeleted !== true);
    const deletedMovies = allUserMovies.filter((m) => m.isDeleted === true);

    const totalMovies = activeMovies.length;
    const watchlistCount = activeMovies.filter((m) => m.status === 'Want to Watch').length;
    const watchedCount = activeMovies.filter((m) => m.status === 'Watched').length;
    const watchingCount = activeMovies.filter((m) => m.status === 'Watching').length;
    const favoritesCount = activeMovies.filter((m) => m.isFavorite).length;
    const trashCount = deletedMovies.length;

    const ratedMovies = activeMovies.filter((m) => m.rating > 0);
    const averageRating = ratedMovies.length
      ? Number((ratedMovies.reduce((acc, m) => acc + m.rating, 0) / ratedMovies.length).toFixed(1))
      : 0;

    return res.json({
      totalMovies,
      watchlistCount,
      watchedCount,
      watchingCount,
      favoritesCount,
      trashCount,
      averageRating,
    });
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to compute movie statistics' });
  }
});

// GET /api/movies/:id - Get active movie details
app.get('/api/movies/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    if (isMongoConnected) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ message: 'Movie not found' });
      }
      const movie = await MovieModel.findOne({ _id: id, user: userId, isDeleted: { $ne: true } });
      if (!movie) return res.status(404).json({ message: 'Movie not found' });
      return res.json(movie);
    } else {
      const movies = readLocalMovies();
      const movie = movies.find((m) => String(m._id) === id && m.user === userId && m.isDeleted !== true);
      if (!movie) return res.status(404).json({ message: 'Movie not found' });
      return res.json(movie);
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Error retrieving movie details' });
  }
});

// POST /api/movies
app.post('/api/movies', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { title, genre, status } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ message: 'Movie title is required.' });
    }
    if (!genre || typeof genre !== 'string' || !genre.trim()) {
      return res.status(400).json({ message: 'Genre is required.' });
    }
    if (!status || !['Want to Watch', 'Watching', 'Watched'].includes(status)) {
      return res.status(400).json({ message: 'Valid status is required.' });
    }

    const movieData = sanitizeMovieInput(req.body);

    if (isMongoConnected) {
      const newMongooseMovie = new MovieModel({
        ...movieData,
        isDeleted: false,
        deletedAt: null,
        user: userId,
      });
      const saved = await newMongooseMovie.save();
      return res.status(201).json(saved);
    } else {
      const movies = readLocalMovies();
      const newMovie = {
        _id: 'mv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        ...movieData,
        isDeleted: false,
        deletedAt: null,
        user: userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      movies.unshift(newMovie);
      writeLocalMovies(movies);
      return res.status(201).json(newMovie);
    }
  } catch (error: any) {
    console.error('Error creating movie:', error);
    res.status(500).json({ message: 'Failed to create movie record', error: error.message });
  }
});

// PUT /api/movies/:id
app.put('/api/movies/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { title, genre, status } = req.body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ message: 'Movie title is required.' });
    }
    if (!genre || typeof genre !== 'string' || !genre.trim()) {
      return res.status(400).json({ message: 'Genre is required.' });
    }
    if (!status || !['Want to Watch', 'Watching', 'Watched'].includes(status)) {
      return res.status(400).json({ message: 'Valid status is required.' });
    }

    const updatedData = sanitizeMovieInput(req.body);

    if (isMongoConnected) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ message: 'Movie not found' });
      }
      const updatedMovie = await MovieModel.findOneAndUpdate(
        { _id: id, user: userId, isDeleted: { $ne: true } },
        { $set: updatedData },
        { new: true, runValidators: true }
      );
      if (!updatedMovie) return res.status(404).json({ message: 'Movie not found' });
      return res.json(updatedMovie);
    } else {
      const movies = readLocalMovies();
      const index = movies.findIndex((m) => String(m._id) === id && m.user === userId && m.isDeleted !== true);
      if (index === -1) {
        return res.status(404).json({ message: 'Movie not found' });
      }
      movies[index] = {
        ...movies[index],
        ...updatedData,
        updatedAt: new Date().toISOString(),
      };
      writeLocalMovies(movies);
      return res.json(movies[index]);
    }
  } catch (error: any) {
    console.error('Error updating movie:', error);
    res.status(500).json({ message: 'Failed to update movie' });
  }
});

// PATCH /api/movies/:id/favorite
app.patch('/api/movies/:id/favorite', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    if (isMongoConnected) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ message: 'Movie not found' });
      }
      const movie = await MovieModel.findOne({ _id: id, user: userId, isDeleted: { $ne: true } });
      if (!movie) return res.status(404).json({ message: 'Movie not found' });
      movie.isFavorite = !movie.isFavorite;
      await movie.save();
      return res.json(movie);
    } else {
      const movies = readLocalMovies();
      const index = movies.findIndex((m) => String(m._id) === id && m.user === userId && m.isDeleted !== true);
      if (index === -1) {
        return res.status(404).json({ message: 'Movie not found' });
      }
      movies[index].isFavorite = !movies[index].isFavorite;
      movies[index].updatedAt = new Date().toISOString();
      writeLocalMovies(movies);
      return res.json(movies[index]);
    }
  } catch (error: any) {
    res.status(500).json({ message: 'Failed to toggle favorite status' });
  }
});

// PATCH /api/movies/:id/restore - Restore soft-deleted movie
app.patch('/api/movies/:id/restore', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    if (isMongoConnected) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ message: 'Movie not found.' });
      }
      const movie = await MovieModel.findOne({ _id: id });
      if (!movie) {
        return res.status(404).json({ message: 'Movie not found.' });
      }
      if (movie.user.toString() !== userId) {
        return res.status(403).json({ message: 'You are not authorized to perform this action.' });
      }
      if (!movie.isDeleted) {
        return res.status(400).json({ message: 'This movie is not in the Recycle Bin.' });
      }

      movie.isDeleted = false;
      movie.deletedAt = null;
      await movie.save();
      return res.json(movie);
    } else {
      const movies = readLocalMovies();
      const movie = movies.find((m) => String(m._id) === id);
      if (!movie) {
        return res.status(404).json({ message: 'Movie not found.' });
      }
      if (movie.user !== userId) {
        return res.status(403).json({ message: 'You are not authorized to perform this action.' });
      }
      if (!movie.isDeleted) {
        return res.status(400).json({ message: 'This movie is not in the Recycle Bin.' });
      }

      movie.isDeleted = false;
      movie.deletedAt = null;
      movie.updatedAt = new Date().toISOString();
      writeLocalMovies(movies);
      return res.json(movie);
    }
  } catch (error: any) {
    console.error('Restore error:', error);
    res.status(500).json({ message: 'Failed to restore movie.' });
  }
});

// DELETE /api/movies/:id/permanent - Permanently delete soft-deleted movie from DB
app.delete('/api/movies/:id/permanent', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    if (isMongoConnected) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ message: 'Movie not found.' });
      }
      const movie = await MovieModel.findOne({ _id: id });
      if (!movie) {
        return res.status(404).json({ message: 'Movie not found.' });
      }
      if (movie.user.toString() !== userId) {
        return res.status(403).json({ message: 'You are not authorized to perform this action.' });
      }
      if (!movie.isDeleted) {
        return res.status(400).json({ message: 'This movie is not in the Recycle Bin.' });
      }

      await MovieModel.findOneAndDelete({ _id: id, user: userId });
      return res.json({ message: 'Movie permanently deleted.', id });
    } else {
      const movies = readLocalMovies();
      const index = movies.findIndex((m) => String(m._id) === id);
      if (index === -1) {
        return res.status(404).json({ message: 'Movie not found.' });
      }
      const movie = movies[index];
      if (movie.user !== userId) {
        return res.status(403).json({ message: 'You are not authorized to perform this action.' });
      }
      if (!movie.isDeleted) {
        return res.status(400).json({ message: 'This movie is not in the Recycle Bin.' });
      }

      movies.splice(index, 1);
      writeLocalMovies(movies);
      return res.json({ message: 'Movie permanently deleted.', id });
    }
  } catch (error: any) {
    console.error('Permanent delete error:', error);
    res.status(500).json({ message: 'Unable to permanently delete the movie. Please try again.' });
  }
});

// DELETE /api/movies/:id - Normal Delete Button -> Soft Delete (Move to Recycle Bin)
app.delete('/api/movies/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    if (isMongoConnected) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ message: 'Movie not found.' });
      }
      const movie = await MovieModel.findOne({ _id: id });
      if (!movie) {
        return res.status(404).json({ message: 'Movie not found.' });
      }
      if (movie.user.toString() !== userId) {
        return res.status(403).json({ message: 'You are not authorized to perform this action.' });
      }
      if (movie.isDeleted) {
        return res.status(400).json({ message: 'This movie is already in the Recycle Bin.' });
      }

      movie.isDeleted = true;
      movie.deletedAt = new Date();
      await movie.save();
      return res.json({ message: 'Movie moved to Recycle Bin 🗑️', id, movie });
    } else {
      const movies = readLocalMovies();
      const movie = movies.find((m) => String(m._id) === id);
      if (!movie) {
        return res.status(404).json({ message: 'Movie not found.' });
      }
      if (movie.user !== userId) {
        return res.status(403).json({ message: 'You are not authorized to perform this action.' });
      }
      if (movie.isDeleted) {
        return res.status(400).json({ message: 'This movie is already in the Recycle Bin.' });
      }

      movie.isDeleted = true;
      movie.deletedAt = new Date().toISOString();
      movie.updatedAt = new Date().toISOString();
      writeLocalMovies(movies);
      return res.json({ message: 'Movie moved to Recycle Bin 🗑️', id: movie._id, movie });
    }
  } catch (error: any) {
    console.error('Error soft deleting movie:', error);
    res.status(500).json({ message: 'Failed to move movie to Recycle Bin.' });
  }
});

// AI / TMDB Movie Autofill Helper
app.get('/api/autofill-movie', authenticateToken, async (req: Request, res: Response) => {
  try {
    const title = req.query.title as string;
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title query parameter is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Return a JSON object for the movie titled "${title.trim()}". Include the following exact JSON structure:
{
  "title": "Exact Title",
  "posterUrl": "Valid direct Unsplash or cinematic image URL matching the movie theme",
  "description": "2-3 sentence engaging synopsis",
  "releaseYear": 2023,
  "genre": "Action" | "Adventure" | "Comedy" | "Drama" | "Horror" | "Sci-Fi" | "Thriller" | "Romance" | "Animation" | "Documentary" | "Other",
  "director": "Full Director Name",
  "rating": 8.5
}
Return ONLY JSON without markdown formatting.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        const text = response.text || '';
        const cleanedJson = text.replace(/```json/gi, '').replace(/```/g, '').trim();
        const movieObj = JSON.parse(cleanedJson);
        return res.json(movieObj);
      } catch (geminiErr) {
        console.warn('Gemini autofill failed, utilizing smart preset fallback:', geminiErr);
      }
    }

    // Smart Preset Fallback based on common search terms
    const lowerTitle = title.toLowerCase();
    let fallbackPoster =
      'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80';
    let genre = 'Drama';
    let director = 'Renowned Director';
    let releaseYear = 2023;
    let rating = 8.0;

    if (lowerTitle.includes('batman') || lowerTitle.includes('action')) {
      fallbackPoster = 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80';
      genre = 'Action';
      director = 'Matt Reeves';
      releaseYear = 2022;
      rating = 8.2;
    } else if (lowerTitle.includes('space') || lowerTitle.includes('sci-fi') || lowerTitle.includes('star')) {
      fallbackPoster = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80';
      genre = 'Sci-Fi';
      director = 'Denis Villeneuve';
      releaseYear = 2021;
      rating = 8.6;
    }

    return res.json({
      title: title.trim(),
      posterUrl: fallbackPoster,
      description: `An epic cinematic experience following the story of ${title.trim()}.`,
      releaseYear,
      genre,
      director,
      rating,
    });
  } catch (err: any) {
    res.status(500).json({ message: 'Autofill details unavailable' });
  }
});

// --- Vite Integration & Production Server Setup ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎬 CineVault Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
