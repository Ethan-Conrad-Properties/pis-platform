from app import database

def test_get_db_yields_and_closes(monkeypatch):
    class DummySession:
        def __init__(self):
            self.closed = False
        def close(self):
            self.closed = True

    monkeypatch.setattr(database, "SessionLocal", lambda: DummySession())

    gen = database.get_db()
    db = next(gen)
    assert isinstance(db, DummySession)

    # Finish generator
    try:
        next(gen)
    except StopIteration:
        pass

    assert db.closed

def test_init_db_import(monkeypatch):
    # Monkeypatch engine so we don't hit a real DB
    called = {}

    def fake_create_all(bind=None):
        called["ran"] = True

    monkeypatch.setattr("app.models.Base.metadata.create_all", fake_create_all)

    import importlib
    import app.init_db
    importlib.reload(app.init_db)  # re-run the script

    assert called["ran"]

