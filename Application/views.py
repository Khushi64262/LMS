from flask import current_app as app, jsonify, request, render_template
from flask_security import auth_required, roles_required
from datetime import datetime, timedelta
from werkzeug.security import check_password_hash
from .models import User, db
from .sec import datastore

@app.get('/')
def home():
    return render_template("index.html")

@app.get('/admin_activate/<int:admin_id>')
@auth_required("token")
@roles_required("admin")
def activate_admin(admin_id):
    admin = User.query.get(admin_id)
    if not admin or "admin" not in admin.roles:
        return jsonify({"message":"Admin not Found"}), 404
    
    admin.active = True
    db.session.commit()
    return jsonify({"message":"User Activated"}), 200

@app.post('/user-login')
def user_login():
    data = request.get_json()
    username = data.get("username")
    if not username:
        return jsonify({"message":"Username not available"}), 400
    

    user = datastore.find_user(username = username)
    
    if not user:
        return jsonify({"message":"User not Found"}), 404
    
    if check_password_hash(user.password, data.get("password")):
        user.last_login = datetime.now()
        db.session.commit()
        return {"token":user.get_auth_token(),
               "username": user.username,
               "role": user.roles[0].name,
               'user_id': user.id}
        
    
    else:
        return jsonify({"message":"Wrong Password"}), 400