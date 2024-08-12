from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, RoleMixin
import uuid
from datetime import datetime
db = SQLAlchemy()

# Association table for many-to-many relationship between Users and Roles
roles_users = db.Table('roles_users',
    db.Column('user_id', db.Integer(), db.ForeignKey('user.id')),
    db.Column('role_id', db.Integer(), db.ForeignKey('role.id'))
)

# Role model for Flask-Security
class Role(db.Model, RoleMixin):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True)
    description = db.Column(db.String(255))

# Updated User model to include roles relationship
class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    active = db.Column(db.Boolean())
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False, default=lambda: str(uuid.uuid4()))
    roles = db.relationship('Role', secondary= roles_users, backref=db.backref('users', lazy='dynamic'))

    def __repr__(self):
        return f'<User {self.username}>'

# Section model
class Section(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    date_created = db.Column(db.DateTime, default=datetime.now())
    description = db.Column(db.Text, nullable=False)

    def __repr__(self):
        return f'<Section {self.name}>'

# EBook model with relationships to Section
class EBook(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    author = db.Column(db.String(100), nullable=False)
    section_id = db.Column(db.Integer, db.ForeignKey('section.id'), nullable=False)

    section = db.relationship('Section', backref=db.backref('ebooks', lazy=True))

    def __repr__(self):
        return f'<EBook {self.title}>'

# GrantRequest model to handle issue and return dates
class GrantRequest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    ebook_id = db.Column(db.Integer, db.ForeignKey('e_book.id'), nullable=False)
    date_issued = db.Column(db.DateTime, nullable=True)  # Issue date
    expected_return_date = db.Column(db.DateTime, nullable=True)  # Expected return date
    actual_return_date = db.Column(db.DateTime, nullable=True)  # Actual return date
    status = db.Column(db.String(50), nullable=False)  # 'requested', 'granted', 'revoked', 'returned', 'cancelled'

    user = db.relationship('User', backref=db.backref('requests', lazy=True))
    ebook = db.relationship('EBook', backref=db.backref('requests', lazy=True))

    def __repr__(self):
        return f'<GrantRequest {self.user_id} - {self.ebook_id}>'

# Feedback model for user feedback on eBooks
class Feedback(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    ebook_id = db.Column(db.Integer, db.ForeignKey('e_book.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)  # Rating out of 5
    comment = db.Column(db.Text, nullable=True)
    date_created = db.Column(db.DateTime, default=datetime.now())

    user = db.relationship('User', backref=db.backref('feedback', lazy=True))
    ebook = db.relationship('EBook', backref=db.backref('feedback', lazy=True))

    def __repr__(self):
        return f'<Feedback {self.user_id} - {self.ebook_id}>'

# Statistics model for tracking site statistics
class Statistics(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    active_users = db.Column(db.Integer, nullable=False)
    grant_requests = db.Column(db.Integer, nullable=False)
    ebooks_issued = db.Column(db.Integer, nullable=False)
    ebooks_revoked = db.Column(db.Integer, nullable=False)

    def __repr__(self):
        return f'<Statistics {self.id}>'
