from flask_security import SQLAlchemyUserDatastore, Security
from .models import db, User, Role

datastore = SQLAlchemyUserDatastore(db, User, Role)
security = Security(datastore=datastore)