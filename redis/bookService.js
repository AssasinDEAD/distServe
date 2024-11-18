const db = require('./db');
const redisClient = require('./redisClient');

class BookService {
    static async getBookById(id) {
        const cacheKey = `book:${id}`;
        const cachedBook = await redisClient.get(cacheKey);

        if (cachedBook) {
            console.log(`[CACHE HIT] Book ID: ${id}`);
            return JSON.parse(cachedBook);
        }

        console.log(`[CACHE MISS] Book ID: ${id}`);
        const book = await this.getBookByIdFromDb(id);

        if (book) {
            await redisClient.set(cacheKey, JSON.stringify(book), { EX: 600 });
        }

        return book;
    }

    static async getBookByIdFromDb(id) {
        console.log(`[DB REQUEST] Fetching book ID: ${id}`);
        const query = 'SELECT * FROM books WHERE id = $1';
        const { rows } = await db.query(query, [id]);
        return rows[0];
    }

    static async addBook(book) {
        const { title, author, price, genre, description } = book;
        const query = `
            INSERT INTO books (title, author, price, genre, description)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const { rows } = await db.query(query, [title, author, price, genre, description]);
        const newBook = rows[0];
        await redisClient.set(`book:${newBook.id}`, JSON.stringify(newBook), { EX: 600 });
        return newBook;
    }

    static async updateBook(id, book) {
        const { title, author, price, genre, description } = book;

        const query = `
            UPDATE books
            SET title = $1, author = $2, price = $3, genre = $4, description = $5
            WHERE id = $6
            RETURNING *
        `;
        const { rows } = await db.query(query, [title, author, price, genre, description, id]);
        if (rows.length > 0) {
            const updatedBook = rows[0];
            await redisClient.set(`book:${id}`, JSON.stringify(updatedBook), { EX: 600 });
            return updatedBook;
        }
        return null;
    }

    static async deleteBook(id) {
        const query = 'DELETE FROM books WHERE id = $1 RETURNING id';
        const { rows } = await db.query(query, [id]);
        if (rows.length > 0) {
            await redisClient.del(`book:${id}`);
            await redisClient.zRem('popular_books', id.toString());
            return true;
        }
        return false;
    }

    static async getPopularBooks(limit = 10) {
      console.log('[POPULAR BOOKS] Fetching popular books from Redis...');
      const bookIdsWithScores = await redisClient.zRangeWithScores('popular_books', 0, -1, { REV: true });

      if (!bookIdsWithScores.length) {
          console.warn('[POPULAR BOOKS] No popular books found in Redis');
          return [];
      }

      const bookIds = bookIdsWithScores.map(({ value }) => parseInt(value, 10)).filter((id) => !isNaN(id));
      console.log('[POPULAR BOOKS] Valid book IDs:', bookIds);

      if (!bookIds.length) {
          console.warn('[POPULAR BOOKS] No valid book IDs after filtering Redis data');
          return [];
      }

      const placeholders = bookIds.map((_, i) => `$${i + 1}`).join(',');
      const query = `SELECT * FROM books WHERE id IN (${placeholders}) ORDER BY array_position(ARRAY[${bookIds.join(',')}], id)`;

      console.log(`[POPULAR BOOKS] Executing SQL query: ${query}`);

      const { rows } = await db.query(query, bookIds);

      if (!rows.length) {
          console.warn('[POPULAR BOOKS] No books found in DB for IDs:', bookIds);
          return [];
      }

      return rows.map((book) => {
          const score = bookIdsWithScores.find(({ value }) => parseInt(value, 10) == book.id)?.score || 0;
          return { ...book, popularity: score };
      });
  }

    static async incrementPopularity(id) {
        console.log(`[POPULARITY] Incrementing popularity for book ID: ${id}`);
        await redisClient.zIncrBy('popular_books', 1, id.toString());
    }
}

module.exports = BookService;
