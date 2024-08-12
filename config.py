class Config(object):
    DEBUG = False
    TESTING = False

class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///dev.db'
    SECRET_KEY = "04b0a475a48554846c2ebcd61d1b5393"
    SECURITY_PASSWORD_SALT = "6a7dc6163f8d7854c0043769543b9820"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    WTF_CSRF_ENABLED = False
    SECURITY_TOKEN_AUTHENTICATION_HEADER = "Authentication-token"
    SECURITY_JOIN_USER_ROLES = 'user_roles'
    
    # Additional Flask-Security Configurations
    SECURITY_PASSWORD_HASH = "bcrypt"  # Specify the hashing algorithm
