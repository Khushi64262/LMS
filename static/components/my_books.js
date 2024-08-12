export default {
  template: `
    <div class="books-container">
        <h3>Requested Books</h3>
        <div v-if="requestedBooks.length" class="books-grid">
          <div v-for="book in requestedBooks" :key="book.id" class="book-card">
              <p class="book-title">{{ book.ebook.title }}</p>
              <p>Author: {{ book.ebook.author }}</p>
              <p>Section: {{ book.ebook.section }}</p>
          </div>
        </div>
        <p v-else>No requested books</p>

        <h3>Currently Owned Books</h3>
        <div v-if="ownedBooks.length" class="books-grid">
          <div v-for="book in ownedBooks" :key="book.id" class="book-card">
              <p class="book-title">{{ book.ebook.title }}</p>
              <p>Author: {{ book.ebook.author }}</p>
              <p>Section: {{ book.ebook.section }}</p>
              <p>Date Issued: {{ book.date_issued }}</p>
              <p>Expected Return Date: {{ book.expected_return_date }}</p>
              <button @click="returnBook(book)" class="return-button">Return</button>
          </div>
        </div>
        <p v-else>No currently owned books</p>

        <h3>Completed Books</h3>
        <div v-if="completedBooks.length" class="books-grid">
          <div v-for="book in completedBooks" :key="book.id" class="book-card">
              <p class="book-title">{{ book.ebook.title }}</p>
              <p>Author: {{ book.ebook.author }}</p>
              <p>Section: {{ book.ebook.section }}</p>
              <p>Date Issued: {{ book.date_issued }}</p>
              <p>Actual Return Date: {{ book.actual_return_date }}</p>
          </div>
        </div>
        <p v-else>No completed books</p>

        <h3>Cancelled Books</h3>
        <div v-if="cancelledBooks.length" class="books-grid">
          <div v-for="book in cancelledBooks" :key="book.id" class="book-card">
              <p class="book-title">{{ book.ebook.title }}</p>
              <p>Author: {{ book.ebook.author }}</p>
              <p>Section: {{ book.ebook.section }}</p>
              <p>Status: Cancelled</p>
          </div>
        </div>
        <p v-else>No cancelled books</p>

        <h3>Revoked Books</h3>
        <div v-if="revokedBooks.length" class="books-grid">
          <div v-for="book in revokedBooks" :key="book.id" class="book-card">
              <p class="book-title">{{ book.ebook.title }}</p>
              <p>Author: {{ book.ebook.author }}</p>
              <p>Section: {{ book.ebook.section }}</p>
              <p>Date Issued: {{ book.date_issued }}</p>
              <p>Status: Revoked</p>
          </div>
        </div>
        <p v-else>No revoked books</p>
    </div>
  `,
  data() {
    return {
      requestedBooks: [],
      ownedBooks: [],
      completedBooks: [],
      cancelledBooks: [],
      revokedBooks: []
    };
  },
  methods: {
    fetchMyBooks() {
      fetch('/api/my_books', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authentication-token': localStorage.getItem('auth-token')
        }
      })
      .then(response => response.json())
      .then(data => {
        this.requestedBooks = data.filter(book => book.status === 'requested');
        this.ownedBooks = data.filter(book => book.status === 'granted');
        this.completedBooks = data.filter(book => book.status === 'returned');
        this.cancelledBooks = data.filter(book => book.status === 'cancelled');
        this.revokedBooks = data.filter(book => book.status === 'revoked');
      });
    },
    returnBook(book) {
      fetch(`/api/return_book/${book.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authentication-token': localStorage.getItem('auth-token')
        }
      }).then(() => {
        alert('Book returned successfully');
        this.fetchMyBooks(); // Refresh the books list after returning the book
      });
    }
  },
  created() {
    this.fetchMyBooks();
  },
  style: `
    .books-container {
      max-width: 800px;
      margin: auto;
      padding: 20px;
      font-family: Arial, sans-serif;
    }
    h3 {
      color: #333;
      margin-bottom: 15px;
      border-bottom: 2px solid #ddd;
      padding-bottom: 5px;
    }
    .books-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
    }
    .book-card {
      flex: 1 1 calc(50% - 20px);
      border: 2px solid #ccc;
      padding: 15px;
      border-radius: 10px;
      background-color: #fff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      transition: transform 0.3s ease;
    }
    .book-card:hover {
      transform: scale(1.02);
    }
    .book-title {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 10px;
      color: #007BFF;
    }
    button.return-button {
      margin-top: 10px;
      background-color: #28a745;
      color: white;
      padding: 10px 15px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.3s ease;
    }
    button.return-button:hover {
      background-color: #218838;
    }
    p {
      margin: 5px 0;
      color: #555;
    }
    p:last-child {
      margin-bottom: 0;
    }
  `
};
