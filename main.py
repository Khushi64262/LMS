from  flask import Flask
from Application.models import db, User, Role
from config import DevelopmentConfig
from Application.resources import api
from flask_security import SQLAlchemyUserDatastore, Security
from Application.sec import datastore

def create_app():
    app = Flask(__name__)
    app.config.from_object(DevelopmentConfig)
    db.init_app(app)
    api.init_app(app)
    app.security = Security(app, datastore)
    with app.app_context():
        db.create_all()
        import Application.views
    return app

app = create_app()

if __name__ == '__main__':
    app.run(debug = True)