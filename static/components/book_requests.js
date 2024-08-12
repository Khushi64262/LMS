export default {
    template: `
        <div>
            <h3>Pending Book Requests</h3>
            <div v-for="request in requests" :key="request.id" class="request-card">
                <p>Book ID: {{ request.ebook_id }}</p>
                <p>User ID: {{ request.user_id }}</p>
                <button @click="handleAction(request.id, 'grant')">Grant</button>
                <button @click="handleAction(request.id, 'cancel')">Revoke</button>
            </div>
        </div>
    `,
    data() {
        return {
            requests: []
        };
    },
    methods: {
        async fetchRequests() {
            const res = await fetch('/api/book_requests', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-token': localStorage.getItem('auth-token')
                }
            })

            this.requests = await res.json()

            console.log(this.requests)
        },
        handleAction(requestId, action) {
            fetch(`/api/book_requests/${requestId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authentication-token': localStorage.getItem('auth-token')
                },
                body: JSON.stringify({ action: action })
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                this.fetchRequests();
            });
        }
    },
    created() {
        this.fetchRequests();
    }
};
