export default {
    template: `
    <div>
  <div class="search-results">
    <h2>Search Results</h2>

    <!-- If books are found -->
    <div v-if="books.length">
      <h3>Books</h3>
      <ul>
        <li v-for="book in books" :key="book.id">
          <strong>{{ book.title }}</strong> by {{ book.author }}
          <p>Section ID: {{ book.section_id }}</p>
        </li>
      </ul>
    </div>

    <!-- If sections are found -->
    <div v-if="sections.length">
      <h3>Sections</h3>
      <ul>
        <li v-for="section in sections" :key="section.id">
          <strong>{{ section.name }}</strong>
          <p>{{ section.description }}</p>
        </li>
      </ul>
    </div>

    <!-- If no results found -->
    <div v-if="!books.length && !sections.length">
      <p>No results found for your search.</p>
    </div>
  </div>
  </div>
`,
    data(){
        return {
            books: [],
            sections: []
        }
    },
    created() {
        // Parse the search results passed via the query parameters
        if (this.$route.query.data) {
          const results = JSON.parse(this.$route.query.data);
          this.books = results.books || [];
          this.sections = results.sections || [];
        }
      }
    };