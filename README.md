# How to Use
In the case where you need to access/edit the source code directly. Here are the steps to follow.

Prereqs:
- Have VS Code installed
- Have Python installed
- Have Node.js + npm installed

1. Inside of VS Code, type git clone [repository-name] in a new terminal (note: this will create a local copy of this repository in the folder you're located in)
2. Once cloned, run frontend server and backend server locally. Follow these steps in terminal. 

```
# Install frontend dependencies and run frontend server
cd .\frontend\
npm install
npm run dev

# Navigate to backend and create/activate virtual environment for Python dependencies
cd ..\backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

You will know be able to open up the app locally at http://localhost:3000/.

When making changes to any code, you need to push the changes to this repository to see the changes take effect in the deployed app.
Follow these steps after changing code.
```
git add .
git commit -m "[description of what you changed]"
git push origin main
```
