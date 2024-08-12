from flask import jsonify, request
from flask_restful import Resource, Api, reqparse, marshal_with, fields
from datetime import datetime, timedelta
from Application.models import Section, User, EBook, GrantRequest, Feedback, Statistics, db, Role
from flask_security import auth_required, roles_required
from flask_security import current_user

from werkzeug.security import generate_password_hash, check_password_hash

api = Api(prefix='/api')



# Parser and Marshaling for Section
parser = reqparse.RequestParser()
parser.add_argument('name', type=str, required=True, help='Name of the Section')
parser.add_argument('description', type=str, required=True, help='Description of the Section')

section_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'date_created': fields.String,
    'description': fields.String
}

class SectionResource(Resource):
    @auth_required('token')
    @roles_required('librarian')
    @marshal_with(section_fields)
    def get(self):
        query = request.args.get('query')
        if query:
            # Search for sections matching the query
            sections = Section.query.filter(Section.name.ilike(f'%{query}%')).all()
            if sections:
                # Find all books in the matched sections
                books = []
                for section in sections:
                    books.extend(EBook.query.filter_by(section_id=section.id).all())
                return {'sections': sections, 'books': books}, 200
            return {'message': 'No matching sections found'}, 404
        else:
            all_sections = Section.query.all()
            return all_sections, 200

    @auth_required('token')
    @roles_required('librarian')
    @marshal_with(section_fields)
    def post(self):
        args = parser.parse_args()
        section = Section(
            name=args['name'],
            description=args['description'],
            date_created=datetime.now()  # Automatically set the creation date
        )
        db.session.add(section)
        db.session.commit()
        return section, 201

    @auth_required('token')
    @roles_required('librarian')
    @marshal_with(section_fields)
    def put(self, section_id):
        args = parser.parse_args()
        section = Section.query.get_or_404(section_id)
        section.name = args['name']
        section.description = args['description']
        db.session.commit()
        return section, 200

    @auth_required('token')
    @roles_required('librarian')
    def delete(self, section_id):
        section = Section.query.get_or_404(section_id)
        db.session.delete(section)
        db.session.commit()
        return {'message': 'Section deleted successfully'}, 200

api.add_resource(SectionResource, '/sections', '/sections/<int:section_id>')

# Parser and Marshaling for User
user_parser = reqparse.RequestParser()
user_parser.add_argument('username', type=str, required=True, help='Username of the User')
user_parser.add_argument('password', type=str, required=True, help='Password of the User')
user_parser.add_argument('active', type=bool, help='Is the user active')
user_parser.add_argument('roles', type=str, action='append', help='List of roles for the user')
user_parser.add_argument('email', type=str, help='Email of the user')

user_fields = {
    'id': fields.Integer,
    'username': fields.String,
    'email': fields.String,
    'active': fields.Boolean,
    'roles': fields.List(fields.String(attribute='name'))  # Return the names of the roles
}

class UserResource(Resource):
    @marshal_with(user_fields)
    def get(self):
        all_users = User.query.all()
        return all_users

    def post(self):
        args = user_parser.parse_args()
        role_names = args.pop('roles', [])
        roles = Role.query.filter(Role.name.in_(role_names)).all()
        
        user = User(**args)
        user.roles = roles  # Assign roles to the user
        
        db.session.add(user)
        db.session.commit()
        return {'message': 'User created successfully'}, 201

api.add_resource(UserResource, '/users')




# Parser and Marshaling for EBook
book_parser = reqparse.RequestParser()
book_parser.add_argument('title', type=str, required=True, help='Title of the Book')
book_parser.add_argument('author', type=str, required=True, help='Author of the Book')
book_parser.add_argument('section_id', type=int, required=True, help='Section ID of the Book')

book_fields = {
    'id': fields.Integer,
    'title': fields.String,
    'author': fields.String,
    'section': fields.Nested({
        'id': fields.Integer,
        'name': fields.String
    })
}

class EBookResource(Resource):
    @auth_required('token')
    @marshal_with(book_fields)
    def get(self):
        section_id = request.args.get('section_id', type=int)
        if section_id:
            ebooks = EBook.query.filter_by(section_id=section_id).all()
        else:
            ebooks = EBook.query.all()

        # Return the list of ebooks, each including the section details
        return ebooks, 200

    @auth_required('token')
    @roles_required('librarian')
    @marshal_with(book_fields)
    def post(self):
        args = book_parser.parse_args()
        ebook = EBook(**args)
        db.session.add(ebook)
        db.session.commit()
        return ebook, 201

    @auth_required('token')
    @roles_required('librarian')
    @marshal_with(book_fields)
    def put(self, ebook_id):
        args = book_parser.parse_args()
        ebook = EBook.query.get_or_404(ebook_id)
        ebook.title = args['title']
        ebook.author = args['author']
        ebook.section_id = args['section_id']
        db.session.commit()
        return ebook, 200

    @auth_required('token')
    @roles_required('librarian')
    def delete(self, ebook_id):
        ebook = EBook.query.get_or_404(ebook_id)
        db.session.delete(ebook)
        db.session.commit()
        return {'message': 'Book deleted successfully'}, 200


api.add_resource(EBookResource, '/ebooks', '/ebooks/<int:ebook_id>')


class RequestBookResource(Resource):
    @auth_required('token')
    def post(self, book_id):
        user_id = current_user.id  # Assuming `current_user` is available from Flask-Security
        
        # Check if the book is already granted to someone else
        existing_request = GrantRequest.query.filter(GrantRequest.ebook_id == book_id, GrantRequest.status.in_(['requested']), GrantRequest.user_id==user_id).all()
        print(existing_request)
        if len(existing_request)>0:
            return  400

        # Create a new request
        new_request = GrantRequest(
            user_id=user_id,
            ebook_id=book_id,
            status='requested'
        )
        db.session.add(new_request)
        db.session.commit()

        return  201

api.add_resource(RequestBookResource, '/request_book/<int:book_id>')


request_fields = {
    'id': fields.Integer,
    'user_id': fields.Integer,
    'ebook_id': fields.Integer,
    'status': fields.String,
    'date_issued': fields.DateTime,
    'expected_return_date': fields.DateTime,
    'actual_return_date': fields.DateTime,
}

class BookRequestResource(Resource):
    @auth_required('token')
    @marshal_with(request_fields)
    def get(self):
        requests = GrantRequest.query.filter_by(status='requested').all()
        print(requests)
        return requests, 200

    @auth_required('token')
    @roles_required('librarian')
    def put(self, request_id):
        args = request_parser.parse_args()
        grant_request = GrantRequest.query.get_or_404(request_id)
        
        action = args.get('action')
        if action == 'grant':
            grant_request.status = 'granted'
            grant_request.date_issued = datetime.now()
            grant_request.expected_return_date = datetime.now() + timedelta(days=7)
        elif action == 'cancel':
            grant_request.status = 'cancelled'
        
        db.session.commit()
        return {'message': f'Request {action}ed successfully'}, 200

api.add_resource(BookRequestResource, '/book_requests', '/book_requests/<int:request_id>')

request_parser = reqparse.RequestParser()
request_parser.add_argument('action', type=str, required=True, help='Action to perform: grant or revoke')



my_book_fields = {
    'id': fields.Integer,
    'title': fields.String,
    'author': fields.String,
    'section': fields.String
}

my_grant_request_fields = {
    'id': fields.Integer,
    'status': fields.String,
    'date_issued': fields.DateTime,
    'expected_return_date': fields.DateTime,
    'actual_return_date': fields.DateTime,
    'ebook': fields.Nested(book_fields)
}

class MyBooksResource(Resource):
    @auth_required('token')
    @marshal_with(my_grant_request_fields)
    def get(self):
        current_user_id = current_user.id
        requests = GrantRequest.query.filter_by(user_id=current_user_id).all()
        return requests, 200

api.add_resource(MyBooksResource, '/my_books')


class ReturnBookResource(Resource):
    @auth_required('token')
    def put(self, book_id):
        print(book_id)
        current_user_id = current_user.id
        grant_request = GrantRequest.query.filter_by(user_id=current_user_id, ebook_id=book_id, status='granted').first()
        print(grant_request)
        if grant_request:
            grant_request.status = 'returned'
            grant_request.actual_return_date = datetime.now()
            db.session.commit()
            return {'message': 'Book returned successfully'}, 200
        return {'message': 'Book not found or not issued to you'}, 404

api.add_resource(ReturnBookResource, '/return_book/<int:book_id>')



class NonGrantedBooksResource(Resource):
    @auth_required('token')
    @marshal_with(book_fields)
    def get(self):
        # Fetch all GrantRequests where the status is not 'granted'
        non_granted_requests = GrantRequest.query.filter(GrantRequest.status not in ['granted']).all()

        # Extract the ebook IDs from these requests
        non_granted_ebook_ids = [request.ebook_id for request in non_granted_requests]

        # Fetch the corresponding ebooks
        ebooks = EBook.query.filter(EBook.id.in_(non_granted_ebook_ids)).all()

        return ebooks, 200

# Add the new resource to the API
api.add_resource(NonGrantedBooksResource, '/non_granted_books')

class BookResource(Resource):
    @auth_required('token')
    @marshal_with({
        'id': fields.Integer,
        'title': fields.String,
        'author': fields.String,
        'section_id': fields.Integer,
    })
    def get(self):
        query = request.args.get('query')
        if query:
            # Search for books by title or author
            books = EBook.query.filter(
                (EBook.title.ilike(f'%{query}%')) |
                (EBook.author.ilike(f'%{query}%'))
            ).all()
            if books:
                return books, 200
            return {'message': 'No matching books found'}, 404
        return {'message': 'Query parameter is missing'}, 400

# Add BookResource to API
api.add_resource(BookResource, '/books')
