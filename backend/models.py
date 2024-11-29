from app import db

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False) # Храните хэшированные пароли
    email = db.Column(db.String(120), unique=True, nullable=False)
    # ... другие поля ...

    def __repr__(self)::
    return '<User %r>' % self.username






