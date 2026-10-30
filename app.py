from flask import Flask, render_template, url_for, redirect
from flask_sqlalchemy import SQLAlchemy
from flask_wtf import FlaskForm
from wtforms import StringField, TimeField
from wtforms.validators import DataRequired
from flask_wtf.csrf import CSRFProtect
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("APP_SECRET", "my-secret")
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ["DATABASE_URL"]

CSRFProtect(app)
db = SQLAlchemy(app)

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
    return render_template("todo.html", tasks=tasks, form=form)
    
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

@app.route("/edit/<int:task_id>", methods=["POST"])
def edit_task(task_id):
    task = db.get_or_404(TodoModel, task_id)
    form = TodoForm()
    
    if form.validate_on_submit():
        task.task_name = form.task_name.data
        task.task_time = form.task_time.data
        db.session.commit()
        return {
            "message": "ediited successfully",
            "task_name": task.task_name,
            "task_time": task.task_time.strftime("%I:%M %p"),
        }, 200
    else:
        return {
            "message": "Invalid form"
        }, 400
    

@app.errorhandler(404)
def error_404(e):
    return render_template("404.html"), 404

with app.app_context():
    db.create_all()