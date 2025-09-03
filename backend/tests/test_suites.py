import pytest

@pytest.mark.asyncio
async def test_suite_crud(client):
    yardi = "P300"
    suite_id = 20

    # Create property (FK requirement)
    await client.post("/properties", json={
        "yardi": yardi,
        "address": "1000 Maple",
        "city": "Sacramento",
        "state": "CA",
        "zip": 95814
    })

    # Create suite
    res = await client.post("/suites", json={
        "suite_id": suite_id,
        "property_yardi": yardi,
        "suite": "101",
        "name": "Main Office"
    })
    assert res.status_code == 201

    # Update
    res = await client.put(f"/suites/{suite_id}", json={"name": "Updated Office"})
    assert res.status_code == 200
    updated = res.json()  # ✅ match your API response
    assert updated["name"] == "Updated Office"

    # Delete
    res = await client.delete(f"/suites/{suite_id}")
    assert res.status_code == 200
