import pytest

@pytest.mark.asyncio
async def test_edit_history_empty(client):
    res = await client.get("/edit-history")
    assert res.status_code == 200
    assert res.json()["edit_history"] == []