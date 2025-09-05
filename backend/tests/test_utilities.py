import pytest

@pytest.mark.asyncio
async def test_utility_crud(client):
    yardi = "P400"
    util_id = 30

    # Create property (FK requirement)
    await client.post("/properties", json={
        "yardi": yardi,
        "address": "2000 Birch",
        "city": "Sacramento",
        "state": "CA",
        "zip": 95814
    })

    # Create utility
    res = await client.post("/utilities", json={
        "utility_id": util_id,
        "property_yardi": yardi,
        "service": "Water",
        "vendor": "City Water Co"
    })
    assert res.status_code == 201

    # Get utilities for property
    res = await client.get("/utilities", params={"property_yardi": "P400"})
    assert res.status_code == 200
    assert any(u["utility_id"] == util_id for u in res.json())

    # Update
    res = await client.put(f"/utilities/{util_id}", json={"service": "Electric"})
    assert res.status_code == 200
    updated = res.json()["utility"]  
    assert updated["service"] == "Electric"

    # Delete
    res = await client.delete(f"/utilities/{util_id}")
    assert res.status_code == 200
    assert res.json()["detail"] == "Utility deleted"

@pytest.mark.asyncio
async def test_update_nonexistent_utility(client):
    res = await client.put("/utilities/999", json={"service": "GhostService"})
    assert res.status_code == 404

@pytest.mark.asyncio
async def test_delete_nonexistent_utility(client):
    res = await client.delete("/utilities/999")
    assert res.status_code == 404
