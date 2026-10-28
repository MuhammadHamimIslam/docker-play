from flask import Flask, render_template, url_for, redirect
from flask_sqlalchemy import SQLAlchemy
from flask_wtf import FlaskForm
from wtforms import StringField, TimeField
from wtforms.validators import DataRequired
from flask_wtf.csrf import CSRFProtect
import os

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("APP_SECRET", "my-secret")
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite://"

CSRFProtect(app)
db = SQLAlchemy(app)


fields = {
    "task_name": "Task Name",
    "task_time": "Task Time"
}

class TodoModel(db.Model):
    __tablename__ = "todo"
    
    task_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    task_name = db.Column(db.String(120), nullable=False)
    task_time = db.Column(db.Time(), nullable=False)
    task_completed = db.Column(db.Boolean, nullable=False, default=False)

class TodoForm(FlaskForm):
    task_name = StringField("Task Name", validators=[DataRequired()])
    task_time = TimeField("Task Time", validators=[DataRequired()])

@app.route("/home", methods=["GET", "POST"])
def home():
    form = TodoForm()

    if form.validate_on_submit():
        todo = TodoModel(
            task_name=form.task_name.data,
            task_time=form.task_time.data,
        )
        db.session.add(todo)
        db.session.commit()
        return redirect(url_for("home"))

    tasks = TodoModel.query.all()
    return render_template("todo.html", tasks=tasks, form=form, fields=fields)
    
@app.route("/delete/<int:task_id>", methods=["DELETE"])
def delete_task(task_id):
    task = db.get_or_404(TodoModel, task_id)
    db.session.delete(task)
    db.session.commit()
    
    return {"message": "Deleted successfully"}, 200

@app.route("/complete/<int:task_id>", methods=["POST"])
def complete_task(task_id):
    task = db.get_or_404(TodoModel, task_id)
    task.task_completed = True
    db.session.commit()
    return {
        "message": "Updated successfully!"
    }

@app.errorhandler(404)
def error_404():
    return render_template("404.html")

with app.app_context():
    db.create_all()
    