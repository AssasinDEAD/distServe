require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const authController = require('./authController');
const authMiddleware = require('./authMiddleware');
const BookService = require('./bookService');

const app = express();

app.use(bodyParser.json());
app.use(cookieParser());

app.use('/auth', authController);

app.get('/books/popular', authMiddleware, async (req, res) => {
    console.log('[SERVER] Fetching popular books...');
    try {
        const popularBooks = await BookService.getPopularBooks(10);
        console.log('[SERVER] Popular books fetched successfully');
        res.json(popularBooks);
    } catch (error) {
        console.error('[SERVER] Error fetching popular books:', error);
        res.status(500).send('Server error');
    }
});

app.get('/books/:id', authMiddleware, async (req, res) => {
   const bookId = parseInt(req.params.id);

   if (isNaN(bookId)) {
       return res.status(400).json({ error: 'Invalid book ID' });
   }

   try {
       console.time('DB Request');
       const bookFromDb = await BookService.getBookByIdFromDb(bookId);
       console.timeEnd('DB Request');

       console.time('Cache Request');
       const bookFromCache = await BookService.getBookById(bookId);
       console.timeEnd('Cache Request');

       if (bookFromCache) {
           await BookService.incrementPopularity(bookId);
           res.json(bookFromCache);
       } else {
           res.status(404).json({ error: 'Book not found' });
       }
   } catch (error) {
       console.error('Error fetching book:', error);
       res.status(500).send('Server error');
   }
});


app.post('/books', authMiddleware, async (req, res) => {
    try {
        const newBook = await BookService.addBook(req.body);
        res.status(201).json(newBook);
    } catch (error) {
        console.error('Error adding book:', error);
        res.status(500).send('Server error');
    }
});

app.put('/books/:id', authMiddleware, async (req, res) => {
    const bookId = parseInt(req.params.id);

    if (isNaN(bookId)) {
        return res.status(400).json({ error: 'Invalid book ID' });
    }

    try {
        const updatedBook = await BookService.updateBook(bookId, req.body);
        if (updatedBook) {
            res.status(200).json(updatedBook);
        } else {
            res.status(404).json({ error: 'Book not found' });
        }
    } catch (error) {
        console.error('Error updating book:', error);
        res.status(500).send('Server error');
    }
});

app.delete('/books/:id', authMiddleware, async (req, res) => {
    const bookId = parseInt(req.params.id);

    if (isNaN(bookId)) {
        return res.status(400).json({ error: 'Invalid book ID' });
    }

    try {
        const isDeleted = await BookService.deleteBook(bookId);
        if (isDeleted) {
            res.status(204).send();
        } else {
            res.status(404).json({ error: 'Book not found' });
        }
    } catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).send('Server error');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`[SERVER] Running on port ${PORT}`);
});
