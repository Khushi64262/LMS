from main import app
from Application.models import db, Role
from flask_security import hash_password
from werkzeug.security import generate_password_hash
from Application.sec import datastore

with app.app_context():
    db.create_all()
    print("Database created successfully")
    print("Tables created successfully")
    datastore.find_or_create_role(name='librarian', description='Librarian Role')
    datastore.find_or_create_role(name='user', description='General User Role')
    db.session.commit()
    if not datastore.find_user(username="lib"):
        datastore.create_user(username="lib",password=generate_password_hash("lib@123"),roles=['librarian'], email='22f10002916@ds.study.iitm.ac.in')
        db.session.commit()
        print("Librarian user created successfully")
        
    else:
        print("Librarian user already exists")

    if not datastore.find_user(username="sidx"):
        datastore.create_user(username="sidx",password=generate_password_hash("Sid@123"),roles=['user'],email= 'khushiksingh915@gmail.com')
        db.session.commit()
        print("General User created successfully")
    else:    
        print("General user already exists")

    
    print("Initial data added successfully")
    print("Database initialization completed")